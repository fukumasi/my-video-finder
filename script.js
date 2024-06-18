document.addEventListener('DOMContentLoaded', function() {
  // 検索機能
  const searchInput = document.getElementById('search');
  const videoList = document.querySelectorAll('.video-list li');

  searchInput.addEventListener('input', function() {
      const query = this.value.toLowerCase();
      videoList.forEach(video => {
          const title = video.textContent.toLowerCase();
          video.style.display = title.includes(query) ? '' : 'none';
      });
  });

  // フィルタリング機能
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

  // レビュー機能
  const reviewButtons = document.querySelectorAll('.review-button');
  reviewButtons.forEach(button => {
      button.addEventListener('click', function() {
          const videoId = this.dataset.video;
          const reviewForm = document.getElementById('review-form-' + videoId);
          if (reviewForm) {
              reviewForm.style.display = reviewForm.style.display === 'none' || reviewForm.style.display === '' ? 'block' : 'none';
          }
      });
  });

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

  // 評価システムの実装
  const ratingStars = document.querySelectorAll('.rating span');
  ratingStars.forEach(star => {
      star.addEventListener('click', function() {
          const stars = this.parentNode.querySelectorAll('span');
          stars.forEach((s, index) => {
              if (index <= Array.from(stars).indexOf(this)) {
                  s.style.color = '#f5b301';
              } else {
                  s.style.color = '#ddd';
              }
          });
          alert(`You rated this video ${Array.from(stars).indexOf(this) + 1} stars`);
      });
  });

  // コメント機能の実装
  const commentButtons = document.querySelectorAll('.submit-comment');
  commentButtons.forEach(button => {
      button.addEventListener('click', function() {
          const videoId = this.dataset.video;
          const commentInput = this.previousElementSibling;
          const commentText = commentInput.value;
          if (commentText.trim() !== '') {
              const commentsContainer = document.getElementById('comments-' + videoId);
              const commentElement = document.createElement('div');
              commentElement.classList.add('comment');
              commentElement.textContent = commentText;
              commentsContainer.appendChild(commentElement);
              commentInput.value = ''; // 入力フィールドをクリア
          } else {
              alert('Please write a comment before submitting.');
          }
      });
  });

  // 推薦動画機能の実装
  function recommendVideos() {
      const recommendationList = document.getElementById('recommendation-list');
      const sampleVideos = [
          'Recommended Video 1: Tips for Cooking',
          'Recommended Video 2: JavaScript Basics',
          'Recommended Video 3: Advanced Cooking Techniques',
          'Recommended Video 4: Understanding CSS'
      ];
      sampleVideos.forEach(videoTitle => {
          const listItem = document.createElement('li');
          listItem.textContent = videoTitle;
          recommendationList.appendChild(listItem);
      });
  }

  recommendVideos(); // 推薦動画を表示

  // ログイン機能の実装
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', function(event) {
      event.preventDefault(); // フォームのデフォルトの送信動作を防止

      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      // 仮のユーザーデータ
      const validUsername = 'user';
      const validPassword = 'password';

      if (username === validUsername && password === validPassword) {
          alert('Login successful! Welcome ' + username);
          // ログイン成功後の処理を追加 (例: ページ遷移、ユーザー情報表示など)
      } else {
          alert('Login failed. Please check your username and password.');
      }
  });

  // 動画詳細情報の表示・非表示
  const showDetailsButtons = document.querySelectorAll('.show-details');
  showDetailsButtons.forEach(button => {
      button.addEventListener('click', function() {
          const videoId = this.dataset.video;
          const videoInfo = document.getElementById('video-info-' + videoId);
          if (videoInfo) {
              videoInfo.style.display = videoInfo.style.display === 'none' || videoInfo.style.display === '' ? 'block' : 'none';
          }
      });
  });

  // 動画比較機能の実装
  let selectedVideos = [];
  const compareButtons = document.querySelectorAll('.compare-video');
  compareButtons.forEach(button => {
      button.addEventListener('click', function() {
          const videoId = this.dataset.video;
          if (!selectedVideos.includes(videoId)) {
              selectedVideos.push(videoId);
              this.textContent = 'Selected';
              this.style.backgroundColor = '#4CAF50';
          } else {
              selectedVideos = selectedVideos.filter(id => id !== videoId);
              this.textContent = 'Compare';
              this.style.backgroundColor = '#ff9800';
          }

          if (selectedVideos.length >= 2) {
              compareSelectedVideos();
          }
      });
  });

  function compareSelectedVideos() {
      alert('Comparing videos: ' + selectedVideos.join(', '));
      // 実際の比較処理をここに追加 (例: 比較ページに遷移、詳細比較表示など)
      // ここでは簡易的にアラートで表示
  }
});
