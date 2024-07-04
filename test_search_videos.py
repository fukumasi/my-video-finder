import os
import requests
from dotenv import load_dotenv

load_dotenv()

def search_videos(query):
    api_key = os.getenv('YOUTUBE_API_KEY')
    url = f'https://www.googleapis.com/youtube/v3/search?part=snippet&q={query}&type=video&maxResults=5&key={api_key}'
    response = requests.get(url)
    print(f"Request URL: {url}")
    print(f"Response Status Code: {response.status_code}")
    print(f"Response JSON: {response.json()}")
    if response.status_code == 200:
        items = response.json().get('items', [])
        videos = []
        for item in items:
            video_data = {
                'video_id': item['id']['videoId'],
                'title': item['snippet']['title'],
                'description': item['snippet']['description']
            }
            videos.append(video_data)
        return videos
    return []

query = 'Python programming'
videos = search_videos(query)
print(videos)
