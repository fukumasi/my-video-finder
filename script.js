document.addEventListener('DOMContentLoaded', function() {
  // 検索バーの要素を取得
  const searchInput = document.getElementById('search');
  const videoList = document.querySelectorAll('.video-list li');

  searchInput.addEventListener('input', function() {
      const query = this.value.toLowerCase();
      videoList.forEach(video => {
          const title = video.textContent.toLowerCase();
          video.style.display = title.includes(query) ? '' : 'none';
      });
  });

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

  // 評価システムの実装（ここを追加）
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
});
