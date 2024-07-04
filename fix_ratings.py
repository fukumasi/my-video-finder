from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv('MONGODB_URI'))
db = client['my-video-finder']
videos = db['videos']

for video in videos.find():
    if 'ratings' in video:
        fixed_ratings = []
        for rating in video['ratings']:
            if isinstance(rating, int):
                fixed_ratings.append({'user_id': 'unknown', 'score': rating})
            elif isinstance(rating, dict) and 'score' in rating:
                if 'user_id' not in rating:
                    rating['user_id'] = 'unknown'
                fixed_ratings.append(rating)
        videos.update_one({'_id': video['_id']}, {'$set': {'ratings': fixed_ratings}})
