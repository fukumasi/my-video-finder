import os
from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv
from bson.objectid import ObjectId

load_dotenv()

client = MongoClient(os.getenv('MONGODB_URI'))
db = client['my-video-finder']
users = db['users']

# ハッシュ化したいユーザーのメールアドレスとパスワード
user_id = "your_user_id_here"  # ユーザーIDを指定
new_password = "your_new_password_here"  # 新しいパスワードを指定

# パスワードをハッシュ化
hashed_password = generate_password_hash(new_password)

# データベースのユーザーのパスワードを更新
users.update_one({"_id": ObjectId(user_id)}, {"$set": {"password": hashed_password}})

print("パスワードをハッシュ化して更新しました。")
