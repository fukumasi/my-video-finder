from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv('MONGODB_URI'))
db = client['my-video-finder']
videos = db['videos']

# 既存のコメントを修正
for video in videos.find():
    if 'comments' in video:
        fixed_comments = []
        for comment in video['comments']:
            if isinstance(comment, str):
                fixed_comments.append({'user_id': 'unknown', 'text': comment})
            elif isinstance(comment, dict) and 'text' in comment:
                fixed_comments.append(comment)
        videos.update_one({'_id': video['_id']}, {'$set': {'comments': fixed_comments}})
