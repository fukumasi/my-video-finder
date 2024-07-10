import requests

API_KEY = 'AIzaSyAC_s0ahPWwVDG0NBkPe8IXB9OuV3gLor8'
query = 'Python tutorials'
url = f'https://www.googleapis.com/youtube/v3/search?part=snippet&q={query}&type=video&key={API_KEY}'

response = requests.get(url)
if response.status_code == 200:
    print('API call successful')
    print(response.json())
else:
    print(f'Error: {response.status_code}')
    print(response.json())
