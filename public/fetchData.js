document.addEventListener('DOMContentLoaded', async function() {
  try {
      const response = await fetch('http://localhost:3000/api/videos');
      const data = await response.json();

      const videoList = document.querySelector('.video-list');
      videoList.innerHTML = '';

      data.forEach(video => {
          const listItem = document.createElement('li');
          listItem.setAttribute('data-category', video.category);
          listItem.innerHTML = `
              <div class="video-details">
                  <div class="video-title">${video.title}</div>
                  <div class="rating">${'★'.repeat(video.rating)}${'☆'.repeat(5 - video.rating)}</div>
                  <button class="button show-details" data-video="${video._id}">Show Details</button>
                  <button class="button compare-video" data-video="${video._id}">Compare</button>
              </div>
              <div class="video-info" id="video-info-${video._id}">
                  <p>Description: ${video.description}</p>
                  <p>Views: ${video.views}</p>
                  <p>Likes: ${video.likes}</p>
              </div>
              <button class="review-button" data-video="${video._id}">Add Review</button>
              <div class="review-form" id="review-form-${video._id}">
                  <textarea placeholder="Write your review..."></textarea>
                  <button class="button submit-review" data-video="${video._id}">Submit</button>
              </div>
              <div class="comment-section">
                  <textarea placeholder="Add a comment..." class="comment-input"></textarea>
                  <button class="button submit-comment" data-video="${video._id}">Comment</button>
                  <div class="comments" id="comments-${video._id}"></div>
              </div>
          `;
          videoList.appendChild(listItem);
      });
  } catch (error) {
      console.error('Error fetching data:', error);
  }
});
