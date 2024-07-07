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
from utils import get_video_statistics, get_related_videos, search_videos, get_video_details, sort_videos
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

        # ユーザーが既に存在するか確認
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
def search():
    query = request.args.get('query')
    genre = request.args.get('genre')
    sort = request.args.get('sort', 'relevance')
    
    if query or genre:
        videos = search_videos(query, genre)
        
        # ここで各ビデオにstatistics属性を追加する
        for video in videos:
            video_id = video['id']['videoId']
            video['statistics'] = get_video_statistics(video_id)
        
        videos = sort_videos(videos, sort)
        return render_template('search_results.html', query=query, genre=genre, videos=videos)
    return redirect(url_for('index'))

@app.route('/genre/<genre_name>')
def genre(genre_name):
    sort = request.args.get('sort', 'relevance')
    videos = search_videos(query=genre_name)
    logging.debug(f"Videos found for genre '{genre_name}': {videos}")  # デバッグ用ログ
    
    # ここで各ビデオにstatistics属性を追加する
    for video in videos:
        video_id = video['id']['videoId']
        video['statistics'] = get_video_statistics(video_id)
    
    videos = sort_videos(videos, sort)
    return render_template('genre.html', genre=genre_name, videos=videos)

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

    video['statistics'] = get_video_statistics(video_id)
    video['average_rating'] = sum(rating.get('rating', 0) for rating in video.get('ratings', [])) / len(video.get('ratings', [])) if video.get('ratings') else 0
    related_videos = get_related_videos(video_id)
    return render_template('video_detail.html', video=video, related_videos=related_videos)

@app.route('/video/<video_id>/rate', methods=['POST'])
@login_required
def rate_video(video_id):
    rating_value = int(request.form['rating'])
    rating = {
        'user_id': current_user.get_id(),
        'rating': rating_value
    }
    videos.update_one({'video_id': video_id}, {'$push': {'ratings': rating}})
    return redirect(url_for('video_detail', video_id=video_id))

@app.route('/video/<video_id>/comment/<comment_id>/delete', methods=['POST'])
@login_required
def delete_comment(video_id, comment_id):
    video = videos.find_one({'video_id': video_id})
    if video:
        updated_comments = [comment for comment in video['comments'] if comment['_id'] != comment_id]
        videos.update_one({'video_id': video_id}, {'$set': {'comments': updated_comments}})
    return redirect(url_for('video_detail', video_id=video_id))

@app.route('/video/<video_id>/comment/<comment_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_comment(video_id, comment_id):
    video = videos.find_one({'video_id': video_id})
    if not video:
        return redirect(url_for('video_detail', video_id=video_id))
    
    comment_to_edit = next((comment for comment in video['comments'] if comment['_id'] == comment_id), None)
    if not comment_to_edit or comment_to_edit['user_id'] != current_user.get_id():
        return redirect(url_for('video_detail', video_id=video_id))
    
    if request.method == 'POST':
        new_text = request.form['comment']
        for comment in video['comments']:
            if comment['_id'] == comment_id:
                comment['text'] = new_text
                break
        videos.update_one({'video_id': video_id}, {'$set': {'comments': video['comments']}})
        return redirect(url_for('video_detail', video_id=video_id))
    
    return render_template('edit_comment.html', video_id=video_id, comment=comment_to_edit, video=video)

@app.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        email = request.form['email']
        user = users.find_one({'email': email})
        if user:
            token = generate_password_reset_token(email)
            reset_url = url_for('reset_password', token=token, _external=True)
            msg = Message('Password Reset Request', recipients=[email])
            msg.body = f'Click the following link to reset your password: {reset_url}'
            mail.send(msg)
            flash('Password reset link sent to your email.')
        else:
            flash('Email address not found.')
    return render_template('forgot_password.html')

@app.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    email = verify_password_reset_token(token)
    if not email:
        flash('The password reset link is invalid or has expired.')
        return redirect(url_for('forgot_password'))

    if request.method == 'POST':
        new_password = request.form['password']
        hashed_password = generate_password_hash(new_password, method='pbkdf2:sha256')
        users.update_one({'email': email}, {'$set': {'password': hashed_password}})
        flash('Your password has been reset successfully.')
        return redirect(url_for('login'))

    return render_template('reset_password.html', token=token)

@app.route('/feedback', methods=['GET', 'POST'])
@login_required
def feedback_route():
    if request.method == 'POST':
        feedback_text = request.form['feedback']
        feedback_entry = {
            'user_id': current_user.get_id(),
            'feedback': feedback_text,
            'timestamp': datetime.now()
        }
        feedback.insert_one(feedback_entry)
        flash('Feedback submitted successfully!')
        return redirect(url_for('index'))
    return render_template('feedback.html')

def get_related_videos(video_id):
    api_key = os.getenv('YOUTUBE_API_KEY')
    url = f'https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId={video_id}&type=video&key={api_key}'
    
    logging.debug(f"Request URL: {url}")
    
    response = requests.get(url)
    logging.debug(f"Response status code: {response.status_code}")
    logging.debug(f"Response content: {response.json()}")
    
    if response.status_code == 200:
        data = response.json()
        videos = []
        for item in data.get('items', []):
            video = {
                'video_id': item['id']['videoId'],
                'title': item['snippet']['title'],
                'description': item['snippet']['description']
            }
            videos.append(video)
        return videos
    else:
        logging.error(f"API request failed with status code {response.status_code}: {response.json()}")
        return []

if __name__ == '__main__':
    app.run(debug=True)
