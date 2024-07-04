from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Connect to the MongoDB database
client = MongoClient(os.getenv('MONGODB_URI'))
db = client['my-video-finder']
users = db['users']

# Delete all users
users.delete_many({})

print("All users deleted.")
