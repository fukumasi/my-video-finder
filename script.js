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
