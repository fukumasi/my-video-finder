import os
import requests
from dotenv import load_dotenv

load_dotenv()

def get_video_statistics(video_id):
    api_key = os.getenv('YOUTUBE_API_KEY')
    url = f'https://www.googleapis.com/youtube/v3/videos?id={video_id}&part=statistics&key={api_key}'
    response = requests.get(url)
    if response.status_code == 200:
        items = response.json().get('items', [])
        if items:
            return items[0].get('statistics', {})
    return {}

def get_video_details(video_id):
    api_key = os.getenv('YOUTUBE_API_KEY')
    url = f'https://www.googleapis.com/youtube/v3/videos?id={video_id}&part=snippet&key={api_key}'
    response = requests.get(url)
    if response.status_code == 200:
        items = response.json().get('items', [])
        if items:
            return items[0].get('snippet', {})
    return {}

def get_related_videos(video_id):
    video_details = get_video_details(video_id)
    if not video_details:
        return []

    query = video_details.get('title', '')
    api_key = os.getenv('YOUTUBE_API_KEY')
    url = f'https://www.googleapis.com/youtube/v3/search?part=snippet&q={query}&type=video&maxResults=5&key={api_key}'
    response = requests.get(url)
    if response.status_code == 200:
        items = response.json().get('items', [])
        related_videos = []
        for item in items:
            if item['id']['videoId'] != video_id:
                video_data = {
                    'video_id': item['id']['videoId'],
                    'title': item['snippet']['title'],
                    'description': item['snippet']['description']
                }
                related_videos.append(video_data)
        return related_videos
    return []

def search_videos(query, genre=None):
    api_key = os.getenv('YOUTUBE_API_KEY')
    url = f'https://www.googleapis.com/youtube/v3/search?part=snippet&q={query}&type=video&maxResults=5&key={api_key}'
    response = requests.get(url)
    if response.status_code == 200:
        items = response.json().get('items', [])
        videos = []
        for index, item in enumerate(items):
            video_data = {
                'video_id': item['id']['videoId'],
                'title': item['snippet']['title'],
                'description': item['snippet']['description'],
                'thumbnail_url': item['snippet']['thumbnails']['default']['url'],
                'genre': genre if genre else 'unknown',
                'date': item['snippet']['publishedAt'],
                'views': (index + 1) * 100  # テスト用の異なる視聴回数データ
            }
            videos.append(video_data)
        return videos
    return []
