import os
import requests
from dotenv import load_dotenv

load_dotenv()

def get_video_statistics(video_id):
    api_key = os.getenv('YOUTUBE_API_KEY')
    url = f'https://www.googleapis.com/youtube/v3/videos?id={video_id}&part=statistics&key={api_key}'
    response = requests.get(url)
    print(f"Request URL: {url}")
    print(f"Response Status Code: {response.status_code}")
    print(f"Response JSON: {response.json()}")
    if response.status_code == 200:
        items = response.json().get('items', [])
        if items:
            return items[0].get('statistics', {})
    return {}

video_id = 'aP50PKo4hOI'
stats = get_video_statistics(video_id)
print(stats)
