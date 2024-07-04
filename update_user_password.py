# update_user_password.py
from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv('MONGODB_URI'))
db = client['my-video-finder']
users = db['users']

# 既存のユーザーのメールアドレス
email_to_update = 'testuser01@test.com'
# 既存のユーザーの新しいパスワード（ハッシュ化されていない）
new_password = 'password01'

# パスワードをハッシュ化
hashed_password = generate_password_hash(new_password)

# パスワードを更新
result = users.update_one({'email': email_to_update}, {'$set': {'password': hashed_password}})

if result.modified_count > 0:
    print(f"Password for user {email_to_update} updated successfully.")
else:
    print(f"Failed to update password for user {email_to_update}.")
