from pymongo import MongoClient
import os
from dotenv import load_dotenv
from bson import ObjectId

load_dotenv()

client = MongoClient(os.getenv('MONGODB_URI'))
db = client['my-video-finder']
videos = db['videos']

# 手動でURLフィールドを追加
videos.update_one({'_id': ObjectId('6677df3ac55d8527ca27de9b')}, {'$set': {'url': 'https://www.youtube.com/watch?v=aP50PKo4hOI'}})
videos.update_one({'_id': ObjectId('6677df3ac55d8527ca27de9d')}, {'$set': {'url': 'https://www.youtube.com/watch?v=dummy_video_id_1'}})
videos.update_one({'_id': ObjectId('6677df3ac55d8527ca27de9c')}, {'$set': {'url': 'https://www.youtube.com/watch?v=dummy_video_id_2'}})
videos.update_one({'_id': ObjectId('6677df3ac55d8527ca27de9e')}, {'$set': {'url': 'https://www.youtube.com/watch?v=dummy_video_id_3'}})
