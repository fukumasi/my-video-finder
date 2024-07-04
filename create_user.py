# create_user.py
from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv('MONGODB_URI'))
db = client['my-video-finder']
users = db['users']

new_user = {
    'username': 'testuser10',  # 新しいユーザー名
    'email': 'testuser10@test.com',  # 新しいメールアドレス
    'password': generate_password_hash('password10')  # 新しいパスワード
}

users.insert_one(new_user)
print("User created successfully")
