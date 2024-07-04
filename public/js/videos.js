document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const categoryId = params.get('category');

  if (!categoryId) {
      document.getElementById('video-list').innerHTML = '<p>カテゴリが見つかりませんでした。</p>';
      return;
  }

  try {
      const response = await fetch(`/api/categories/${categoryId}`);
      if (!response.ok) throw new Error('Failed to fetch category');
      const category = await response.json();

      const videoList = document.getElementById('video-list');
      videoList.innerHTML = '';

      category.videos.forEach(video => {
          const videoItem = document.createElement('div');
          videoItem.innerHTML = `
              <h2>${video.title}</h2>
              <p>${video.description}</p>
              <a href="video-details.html?id=${video._id}">動画を見る</a>
          `;
          videoList.appendChild(videoItem);
      });
  } catch (error) {
      console.error('Error loading videos:', error);
  }
});
