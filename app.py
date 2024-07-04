from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_login import LoginManager, login_user, logout_user, current_user, login_required
from pymongo import MongoClient
from dotenv import load_dotenv
from werkzeug.security import check_password_hash
import os
from bson.objectid import ObjectId
from utils import get_video_statistics, get_related_videos, search_videos, get_video_details

load_dotenv()

app = Flask(__name__, static_folder='static')
app.secret_key = os.getenv('SECRET_KEY')
login_manager = LoginManager()
login_manager.init_app(app)

client = MongoClient(os.getenv('MONGODB_URI'))
db = client['my-video-finder']
users = db['users']
videos = db['videos']

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

@app.route('/search')
def search():
    query = request.args.get('query')
    genre = request.args.get('genre')
    sort = request.args.get('sort', 'relevance')
    
    if query or genre:
        videos = search_videos(query, genre)
        videos = sort_videos(videos, sort)
        return render_template('search_results.html', query=query, genre=genre, videos=videos)
    return redirect(url_for('index'))

@app.route('/genre/<genre_name>')
def genre(genre_name):
    sort = request.args.get('sort', 'relevance')
    videos = search_videos(query=genre_name)
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
        new_text = request.form['text']
        for comment in video['comments']:
            if comment['_id'] == comment_id:
                comment['text'] = new_text
                break
        videos.update_one({'video_id': video_id}, {'$set': {'comments': video['comments']}})
        return redirect(url_for('video_detail', video_id=video_id))
    
    return render_template('edit_comment.html', video=video, comment=comment_to_edit)

def sort_videos(videos, sort):
    if sort == 'date':
        videos.sort(key=lambda x: x['date'], reverse=True)
    elif sort == 'views':
        videos.sort(key=lambda x: x['views'], reverse=True)
    return videos

@app.after_request
def add_header(response):
    response.cache_control.max_age = 300
    return response

if __name__ == '__main__':
    app.run(debug=True)
