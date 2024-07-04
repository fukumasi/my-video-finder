document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM fully loaded and parsed');
  const params = new URLSearchParams(window.location.search);
  const videoId = params.get('id');

  if (!videoId) {
      document.getElementById('video-details').innerHTML = '<p>動画が見つかりませんでした。</p>';
      return;
  }

  try {
      const response = await fetch(`/api/videos/${videoId}`);
      const video = await response.json();

      const videoDetails = document.getElementById('video-details');
      videoDetails.innerHTML = `
          <h2 class="text-lg font-bold">${video.title}</h2>
          <p>${video.description}</p>
          <p><strong>ジャンル:</strong> ${video.genre}</p>
          <p><strong>評価:</strong> ${video.rating}</p>
          <a href="${video.url}" target="_blank" class="text-blue-500">Watch Video</a>
          <div class="mt-4">
              <h3 class="text-lg font-bold">レビュー</h3>
              <div id="youtube-stats"></div>
              <form id="review-form" class="mt-2">
                  <div>
                      <label for="rating">Rating:</label>
                      <input type="number" id="rating" name="rating" min="1" max="5" required>
                  </div>
                  <div>
                      <label for="comment">Comment:</label>
                      <textarea id="comment" name="comment" rows="4" required></textarea>
                  </div>
                  <button type="submit" class="bg-blue-500 text-white px-4 py-2 mt-2">Submit</button>
              </form>
              <div id="reviews" class="mt-4">
                  <!-- Reviews will be inserted here by videoDetails.js -->
              </div>
          </div>
      `;

      console.log('Review form found:', document.getElementById('review-form'));

      // Fetch and display reviews
      fetchReviews(videoId);

      // Fetch and display YouTube data
      fetchYouTubeData(video.url);

      document.getElementById('review-form').addEventListener('submit', async (event) => {
          event.preventDefault();
          console.log('Form submission prevented');
          const rating = document.getElementById('rating').value;
          const comment = document.getElementById('comment').value;
          const token = localStorage.getItem('token'); // ローカルストレージからトークンを取得
          console.log('Token:', token);
          console.log('Review data:', { videoId, rating, comment });

          try {
              const response = await fetch('/api/reviews', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}` // トークンをリクエストに含める
                  },
                  body: JSON.stringify({ videoId, rating, comment })
              });

              console.log('Review POST response status:', response.status);
              console.log('Review POST response text:', await response.text());

              if (!response.ok) {
                  throw new Error(`Error adding review: ${response.statusText}`);
              }

              const newReview = await response.json();
              alert('Review added successfully');
              fetchReviews(videoId); // 新しいレビューを表示するためにレビューを再取得
          } catch (error) {
              console.error('Error adding review:', error);
              alert(error.message);
          }
      });
  } catch (error) {
      console.error('Error loading video details:', error);
      document.getElementById('video-details').innerHTML = '<p>動画の詳細を読み込めませんでした。</p>';
  }
});

async function fetchYouTubeData(url) {
  const videoId = url.split('v=')[1];
  if (!videoId) {
      console.error('YouTube video ID not found in URL:', url);
      return;
  }

  const apiKey = 'YOUR_API_KEY';
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=statistics&key=${apiKey}`;

  try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      const stats = data.items[0].statistics;

      document.getElementById('youtube-stats').innerHTML = `
          <p><strong>視聴回数:</strong> ${stats.viewCount}</p>
          <p><strong>いいね数:</strong> ${stats.likeCount}</p>
      `;
  } catch (error) {
      console.error('Error fetching YouTube data:', error);
      document.getElementById('youtube-stats').innerHTML = '<p>データの取得に失敗しました。</p>';
  }
}

async function fetchReviews(videoId) {
  try {
      const response = await fetch(`/api/reviews/${videoId}`);
      const reviews = await response.json();
      const reviewsContainer = document.getElementById('reviews');
      reviewsContainer.innerHTML = '';

      if (reviews.length === 0) {
          reviewsContainer.innerHTML = '<p>レビューがありません。</p>';
      } else {
          reviews.forEach(review => {
              const reviewElement = document.createElement('div');
              reviewElement.className = 'bg-gray-100 p-2 rounded-lg mt-2';
              reviewElement.innerHTML = `
                  <p><strong>Rating:</strong> ${review.rating}</p>
                  <p>${review.comment}</p>
              `;
              reviewsContainer.appendChild(reviewElement);
          });
      }
  } catch (error) {
      console.error('Error fetching reviews:', error);
  }
}
