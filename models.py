from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv('MONGODB_URI'))
db = client['my-video-finder']
users = db['users']

class User:
    def __init__(self, username, email, password=None):
        self.username = username
        self.email = email
        if password:
            self.password_hash = generate_password_hash(password)
        else:
            self.password_hash = None

    @staticmethod
    def get(user_id):
        user_data = users.find_one({"_id": ObjectId(user_id)})
        if user_data:
            user = User(user_data['username'], user_data['email'])
            user.password_hash = user_data['password_hash']
            return user
        return None

    @staticmethod
    def get_by_email(email):
        user_data = users.find_one({"email": email})
        if user_data:
            user = User(user_data['username'], user_data['email'])
            user.password_hash = user_data['password_hash']
            return user
        return None

    def save(self):
        users.insert_one({
            "username": self.username,
            "email": self.email,
            "password_hash": self.password_hash
        })

    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def is_authenticated(self):
        return True

    @property
    def is_active(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def get_id(self):
        user_data = users.find_one({"email": self.email})
        return str(user_data['_id'])
