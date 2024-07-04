from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv('MONGODB_URI'))
db = client['my-video-finder']
videos = db['videos']

for video in videos.find():
    print(video)
