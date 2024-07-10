from flask import Flask, render_template, request, redirect, url_for, jsonify, session, flash
from flask_login import LoginManager, login_user, logout_user, current_user, login_required
from pymongo import MongoClient
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer
from flask_mail import Mail, Message
import os
import logging
from bson.objectid import ObjectId
from datetime import datetime
from utils import get_video_statistics, get_related_videos, get_video_details, sort_videos, search_videos_youtube, get_next_api_key, search_videos
from functools import wraps
import time
from itertools import cycle
import requests

load_dotenv()

app = Flask(__name__, static_folder='static')
app.secret_key = os.getenv('SECRET_KEY')
login_manager = LoginManager()
login_manager.init_app(app)

# ロギングの設定
logging.basicConfig(level=logging.DEBUG)

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

mail = Mail(app)

client = MongoClient(os.getenv('MONGODB_URI'))
db = client['my-video-finder']
users = db['users']
videos = db['videos']
feedback = db['feedback']

s = URLSafeTimedSerializer(app.secret_key)

def generate_password_reset_token(email):
    return s.dumps(email, salt='password-reset-salt')

def verify_password_reset_token(token, expiration=3600):
    try:
        email = s.loads(token, salt='password-reset-salt', max_age=expiration)
    except:
        return None
    return email

class User:
    def __init__(self, user_id, username, email):
        self.user_id = user_id
        self.username = username
        self.email = email

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        return self.user_id

@login_manager.user_loader
def load_user(user_id):
    user_data = users.find_one({"_id": ObjectId(user_id)})
    if user_data:
        return User(user_id=str(user_data['_id']), username=user_data['username'], email=user_data['email'])
    return None

def rate_limit(max_per_hour):
    def decorator(f):
        last_called = {}
        
        @wraps(f)
        def wrapped(*args, **kwargs):
            user_id = current_user.get_id() if current_user.is_authenticated else request.remote_addr
            now = time.time()
            if user_id in last_called:
                elapsed = now - last_called[user_id]
                wait = max(0, 3600 / max_per_hour - elapsed)
                if wait > 0:
                    logging.debug(f"Rate limit exceeded. Waiting for {wait} seconds")
                    time.sleep(wait)
            last_called[user_id] = now
            return f(*args, **kwargs)
        return wrapped
    return decorator

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        logging.debug(f'Login attempt with email: {email}')
        user = users.find_one({'email': email})
        if user and check_password_hash(user['password'], password):
            user_obj = User(user_id=str(user['_id']), username=user['username'], email=user['email'])
            login_user(user_obj)
            logging.debug(f'Login successful for user: {email}')
            return redirect(url_for('index'))
        else:
            logging.debug('Invalid email or password')
            flash('Invalid email or password')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logging.debug(f'User {current_user.email} is logging out')
    logout_user()
    return redirect(url_for('index'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        logging.debug(f'Registration attempt with username: {username}, email: {email}')
        existing_user = users.find_one({'email': email})
        if existing_user:
            logging.debug('Email address already registered')
            flash('このメールアドレスは既に登録されています。')
            return redirect(url_for('register'))
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        user_id = users.insert_one({
            'username': username,
            'email': email,
            'password': hashed_password
        }).inserted_id
        logging.debug(f'User registered with email: {email}')
        user_obj = User(user_id=str(user_id), username=username, email=email)
        login_user(user_obj)
        return redirect(url_for('index'))
    return render_template('register.html')

@app.route('/search')
@rate_limit(max_per_hour=1000)
def search():
    query = request.args.get('query')
    genre = request.args.get('genre')
    sort = request.args.get('sort', 'relevance')
    
    if query or genre:
        videos = search_videos(query, genre)
        
        for video in videos:
            platform = 'youtube' if 'youtube' in video['id'] else 'dailymotion'
            video_id = video['id'][platform]
            video['statistics'] = get_video_statistics(video_id, platform)
        
        videos = sort_videos(videos, sort)
        return render_template('search_results.html', query=query, genre=genre, videos=videos)
    return redirect(url_for('index'))

@app.route('/genre/<genre_name>')
@rate_limit(max_per_hour=1000)
def genre(genre_name):
    sort = request.args.get('sort', 'relevance')
    subgenre = request.args.get('subgenre')
    logging.debug(f"Accessing genre page for genre: {genre_name}")
    logging.debug(f"Sort by: {sort}, Subgenre: {subgenre}")
    videos = search_videos(query=None, genre=genre_name)  # 修正: query=Noneを追加
    return render_template('genre.html', genre_name=genre_name, subgenre=subgenre, sort=sort, videos=videos)

@app.route('/video/<video_id>', methods=['GET', 'POST'])
@login_required
def video_detail(video_id):
    video = videos.find_one({'video_id': video_id})
    if not video:
        video_details = get_video_details(video_id)
        if not video_details:
            return redirect(url_for('index'))
        video = {
            'video_id': video_id,
            'title': video_details.get('title', 'No Title'),
            'description': video_details.get('description', 'No Description'),
            'comments': [],
            'ratings': []
        }
        videos.insert_one(video)
    
    if request.method == 'POST':
        comment_text = request.form['comment']
        comment = {
            '_id': str(ObjectId()),
            'user_id': current_user.get_id(),
            'text': comment_text
        }
        videos.update_one({'video_id': video_id}, {'$push': {'comments': comment}})
        return jsonify({'video_id': video_id, 'comment': comment})
    
    video['statistics'] = get_video_statistics(video_id, 'youtube')
    video['average_rating'] = sum(video['ratings']) / len(video['ratings']) if video['ratings'] else 0
    related_videos = get_related_videos(video_id)
    return render_template('video_detail.html', video=video, related_videos=related_videos)

@app.route('/api/videos/filter', methods=['GET'])
@rate_limit(max_per_hour=1000)
def api_filter_videos():
    genre = request.args.get('genre')
    subgenre = request.args.get('subgenre')
    sort_by = request.args.get('sort', 'relevance')
    
    if not genre:
        return jsonify({"error": "Genre is required"}), 400
    
    query = subgenre if subgenre else genre
    videos = search_videos(query=query, genre=genre)
    
    if not videos:
        logging.debug("No videos found for query")
    else:
        for video in videos:
            platform = 'youtube' if 'youtube' in video['id'] else 'dailymotion'
            video_id = video['id'][platform]
            video['statistics'] = get_video_statistics(video_id, platform)
        videos = sort_videos(videos, sort_by)
    
    logging.debug(f"Filtered videos: {videos}")
    return jsonify(videos)

@app.route('/api/videos/comments', methods=['POST'])
@login_required
@rate_limit(max_per_hour=1000)
def api_post_comment():
    data = request.get_json()
    video_id = data.get('video_id')
    text = data.get('text')
    
    if not video_id or not text:
        return jsonify({"error": "Video ID and comment text are required"}), 400
    
    comment = {
        '_id': str(ObjectId()),
        'user_id': current_user.get_id(),
        'text': text,
        'created_at': datetime.now()
    }
    result = videos.update_one({'video_id': video_id}, {'$push': {'comments': comment}})
    logging.debug(f"Comment posted: {comment}")
    return jsonify({"message": "Comment posted successfully"}), 201

@app.route('/api/videos/ratings', methods=['POST'])
@login_required
@rate_limit(max_per_hour=1000)
def api_post_rating():
    data = request.get_json()
    video_id = data.get('video_id')
    rating = data.get('rating')
    
    if not video_id or rating is None:
        return jsonify({"error": "Video ID and rating are required"}), 400
    
    result = videos.update_one({'video_id': video_id}, {'$push': {'ratings': rating}})
    logging.debug(f"Rating posted: {rating} for video {video_id}")
    return jsonify({"message": "Rating posted successfully"}), 201

# Dailymotion APIキーを設定
DAILYMOTION_API_KEY = 'あなたのDailymotion APIキー'

def search_dailymotion_videos(query, limit=5):
    url = f'https://api.dailymotion.com/videos?search={query}&limit={limit}&fields=id,title,thumbnail_url,channel.name,views_total,created_time'
    response = requests.get(url)
    if response.status_code == 200:
        videos = response.json()['list']
        for video in videos:
            video['id'] = {'dailymotion': video['id']}
        return videos
    else:
        return []

def search_videos(query=None, genre=None, limit=5):
    youtube_videos = search_videos_youtube(query or genre, limit)
    dailymotion_videos = search_dailymotion_videos(query or genre, limit)
    combined_videos = youtube_videos + dailymotion_videos
    return combined_videos

@app.route('/search_dailymotion')
def search_dailymotion():
    query = request.args.get('query', '')
    if query:
        videos = search_dailymotion_videos(query)
        return render_template('search_dailymotion.html', query=query, videos=videos)
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
