document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search');
  const videoList = document.querySelectorAll('.video-list li');

  searchInput.addEventListener('input', function() {
      const query = this.value.toLowerCase();
      videoList.forEach(video => {
          const title = video.textContent.toLowerCase();
          video.style.display = title.includes(query) ? '' : 'none';
      });
  });
});
document.addEventListener('DOMContentLoaded', function() {
  // 検索バーの要素を取得
  const searchInput = document.getElementById('search');
  const videoList = document.querySelectorAll('.video-list li');

  // 検索バーの入力イベントをリッスン
  searchInput.addEventListener('input', function() {
      const query = this.value.toLowerCase();
      videoList.forEach(video => {
          const title = video.textContent.toLowerCase();
          video.style.display = title.includes(query) ? '' : 'none';
      });
  });
});
// 動画リストのフィルタリング機能
function filterVideos(category) {
  const videos = document.querySelectorAll('.video-list li');
  videos.forEach(video => {
      if (video.dataset.category === category || category === 'all') {
          video.style.display = 'block';
      } else {
          video.style.display = 'none';
      }
  });
}

// フィルタリングの実行
document.getElementById('filter').addEventListener('change', function() {
  filterVideos(this.value);
});
document.addEventListener('DOMContentLoaded', function() {
  // 検索バーの要素を取得
  const searchInput = document.getElementById('search');
  const videoList = document.querySelectorAll('.video-list li');

  // 検索バーの入力イベントをリッスン
  searchInput.addEventListener('input', function() {
      const query = this.value.toLowerCase();
      videoList.forEach(video => {
          const title = video.textContent.toLowerCase();
          video.style.display = title.includes(query) ? '' : 'none';
      });
  });

  // カテゴリフィルターの追加
  const filterSelect = document.getElementById('filter');
  filterSelect.addEventListener('change', function() {
      const category = this.value;
      videoList.forEach(video => {
          if (category === 'all' || video.dataset.category === category) {
              video.style.display = '';
          } else {
              video.style.display = 'none';
          }
      });
  });
});
document.addEventListener('DOMContentLoaded', function() {
  // 既存のコード...

  // レビュー投稿フォームの表示
  const reviewButtons = document.querySelectorAll('.review-button');
  reviewButtons.forEach(button => {
      button.addEventListener('click', function() {
          const videoId = this.dataset.video;
          const reviewForm = document.getElementById('review-form-' + videoId);
          reviewForm.style.display = reviewForm.style.display === 'block' ? 'none' : 'block';
      });
  });

  // レビューの送信
  const submitButtons = document.querySelectorAll('.submit-review');
  submitButtons.forEach(button => {
      button.addEventListener('click', function() {
          const videoId = this.dataset.video;
          const reviewForm = document.getElementById('review-form-' + videoId);
          const reviewText = reviewForm.querySelector('textarea').value;
          alert('Review for video ' + videoId + ': ' + reviewText);
          reviewForm.querySelector('textarea').value = ''; // フォームをクリア
          reviewForm.style.display = 'none'; // フォームを非表示に戻す
      });
  });
});
document.addEventListener('DOMContentLoaded', function() {
  // 既存のコード...

  // レビュー投稿フォームの表示・非表示
  const reviewButtons = document.querySelectorAll('.review-button');
  reviewButtons.forEach(button => {
      button.addEventListener('click', function() {
          const videoId = this.dataset.video;
          const reviewForm = document.getElementById('review-form-' + videoId);
          reviewForm.style.display = reviewForm.style.display === 'block' ? 'none' : 'block';
      });
  });

  // レビューの送信
  const submitButtons = document.querySelectorAll('.submit-review');
  submitButtons.forEach(button => {
      button.addEventListener('click', function() {
          const videoId = this.dataset.video;
          const reviewForm = document.getElementById('review-form-' + videoId);
          const reviewText = reviewForm.querySelector('textarea').value;
          if (reviewText.trim() !== '') {
              alert('Review for video ' + videoId + ': ' + reviewText);
              reviewForm.querySelector('textarea').value = ''; // フォームをクリア
              reviewForm.style.display = 'none'; // フォームを非表示に戻す
          } else {
              alert('Please write a review before submitting.');
          }
      });
  });
});
