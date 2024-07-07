import os
import requests
import logging

# ここに新しいAPIキーを直接記入
api_key = "AIzaSyCYUidzR5_A4brcGISLV0INrU3x9My69p4"

def get_video_statistics(video_id):
    url = f'https://www.googleapis.com/youtube/v3/videos?id={video_id}&part=statistics&key={api_key}'
    response = requests.get(url)
    data = response.json()
    if response.status_code != 200:
        logging.error(f"API request failed with status code {response.status_code}: {data}")
    return data.get('items', [{}])[0].get('statistics', {})

def get_related_videos(video_id):
    url = f'https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId={video_id}&type=video&key={api_key}'
    response = requests.get(url)
    data = response.json()
    if response.status_code != 200:
        logging.error(f"API request failed with status code {response.status_code}: {data}")
    return data.get('items', [])

def search_videos(query, genre=None, max_results=10):
    if genre:
        query = f"{query} {genre}"
    url = f'https://www.googleapis.com/youtube/v3/search?part=snippet&q={query}&type=video&maxResults={max_results}&key={api_key}'
    response = requests.get(url)
    data = response.json()
    if response.status_code != 200:
        logging.error(f"API request failed with status code {response.status_code}: {data}")
    return data.get('items', [])

def get_video_details(video_id):
    url = f'https://www.googleapis.com/youtube/v3/videos?part=snippet&id={video_id}&key={api_key}'
    response = requests.get(url)
    data = response.json()
    if response.status_code != 200:
        logging.error(f"API request failed with status code {response.status_code}: {data}")
    return data.get('items', [{}])[0].get('snippet', {})

def sort_videos(videos, sort):
    if sort == 'date':
        videos.sort(key=lambda x: x['snippet'].get('publishedAt', ''), reverse=True)
    elif sort == 'views':
        videos.sort(key=lambda x: x.get('statistics', {}).get('viewCount', 0), reverse=True)
    return videos
