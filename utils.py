import os
import requests
import logging
from itertools import cycle

# 新しいAPIキーの設定
API_KEYS = [
    "AIzaSyAC_s0ahPWwVDG0NBkPe8IXB9OuV3gLor8",
    "AIzaSyCYUidzR5_A4brcGISLV0INrU3x9My69p4",
    "AIzaSyDV9OG0JCHZphFCrDfX72fWMW7xHfdB2Qg"
]

api_key_cycle = cycle(API_KEYS)

def get_next_api_key():
    return next(api_key_cycle)

def get_video_statistics(video_id, platform):
    if platform == 'youtube':
        api_key = get_next_api_key()
        url = f'https://www.googleapis.com/youtube/v3/videos?id={video_id}&part=statistics&key={api_key}'
        response = requests.get(url)
        data = response.json()
        if response.status_code != 200:
            logging.error(f"API request failed with status code {response.status_code}: {data}")
        return data.get('items', [{}])[0].get('statistics', {})
    elif platform == 'dailymotion':
        url = f'https://api.dailymotion.com/video/{video_id}?fields=views_total,likes_total,comments_total'
        response = requests.get(url)
        data = response.json()
        if response.status_code != 200:
            logging.error(f"API request failed with status code {response.status_code}: {data}")
        return {
            'viewCount': data.get('views_total', 0),
            'likeCount': data.get('likes_total', 0),
            'commentCount': data.get('comments_total', 0)
        }
    else:
        return {}

def get_related_videos(video_id):
    api_key = get_next_api_key()
    url = f'https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId={video_id}&type=video&key={api_key}'
    response = requests.get(url)
    data = response.json()
    if response.status_code != 200:
        logging.error(f"API request failed with status code {response.status_code}: {data}")
    return data.get('items', [])

def search_videos(query=None, genre=None, subgenre=None, max_results=10):
    api_key = get_next_api_key()
    if query:
        search_query = query
        if genre:
            search_query += f" {genre}"
        if subgenre:
            search_query += f" {subgenre}"
    else:
        search_query = ''
        if genre:
            search_query = genre
        if subgenre:
            search_query += f" {subgenre}"
    
    url = f'https://www.googleapis.com/youtube/v3/search?part=snippet&q={search_query}&type=video&maxResults={max_results}&key={api_key}'
    response = requests.get(url)
    data = response.json()
    if response.status_code != 200:
        logging.error(f"API request failed with status code {response.status_code}: {data}")
    return data.get('items', [])

def get_video_details(video_id):
    api_key = get_next_api_key()
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

def search_videos_youtube(query, genre=None, limit=5):
    api_key = get_next_api_key()
    search_url = 'https://www.googleapis.com/youtube/v3/search'
    search_params = {
        'part': 'snippet',
        'q': query,
        'type': 'video',
        'maxResults': limit,
        'key': api_key
    }
    
    if genre:
        search_params['videoCategoryId'] = genre
    
    response = requests.get(search_url, params=search_params)
    if response.status_code == 200:
        videos = response.json()['items']
        for video in videos:
            video['id'] = {'youtube': video['id']['videoId']}
        return videos
    else:
        return []
