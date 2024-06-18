document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search');
  const videoList = document.querySelectorAll('.video-list li');

  searchInput.addEventListener('input', function() {
      const query = this.value.toLowerCase();
      let hasResults = false;
      videoList.forEach(video => {
          const title = video.textContent.toLowerCase();
          if (title.includes(query)) {
              video.style.display = '';
              hasResults = true;
          } else {
              video.style.display = 'none';
          }
      });
      if (!hasResults) {
          alert('No results found');
      }
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
});
