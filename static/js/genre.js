document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const genre = params.get('genre');
  const sortSelect = document.getElementById('sort');
  let sortBy = sortSelect.value;

  if (!genre) {
      document.getElementById('genre-title').innerText = 'ジャンルが指定されていません';
      return;
  }

  document.getElementById('genre-title').innerText = `${genre}の動画`;

  const fetchVideos = async () => {
      try {
          const response = await fetch(`/api/videos/filter?genre=${encodeURIComponent(genre)}&sort=${sortBy}`);
          const videos = await response.json();
          const videoList = document.getElementById('video-list');
          videoList.innerHTML = '';

          if (videos.length === 0) {
              videoList.innerHTML = '<p>このジャンルの動画はありません。</p>';
          } else {
              videos.forEach(video => {
                  const videoElement = document.createElement('div');
                  videoElement.innerHTML = `
                      <h3>${video.title}</h3>
                      <p>${video.description}</p>
                      <p>評価: ${video.rating}</p>
                      <a href="video-details.html?id=${video._id}">詳細を見る</a>
                  `;
                  videoList.appendChild(videoElement);
              });
          }
      } catch (error) {
          console.error('Error fetching videos:', error);
          document.getElementById('video-list').innerHTML = '<p>動画の取得中にエラーが発生しました。</p>';
      }
  };

  sortSelect.addEventListener('change', async () => {
      sortBy = sortSelect.value;
      await fetchVideos();
  });

  await fetchVideos();
});
