document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('http://localhost:3000/api/videos');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        const videoList = document.querySelector('.video-list');
        if (!videoList) {
            console.error('Video list container not found');
            return;
        }

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
                <div class="video-info" id="video-info-${video._id}" style="display: none;">
                    <p>Description: ${video.description}</p>
                    <p>Views: ${video.views}</p>
                    <p>Likes: ${video.likes}</p>
                </div>
                <button class="review-button" data-video="${video._id}">Add Review</button>
                <div class="review-form" id="review-form-${video._id}" style="display: none;">
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

        // Show Detailsボタンのイベントリスナーを追加
        document.querySelectorAll('.show-details').forEach(button => {
            button.addEventListener('click', function() {
                const videoId = this.dataset.video;
                const videoInfo = document.getElementById(`video-info-${videoId}`);
                if (videoInfo) {
                    videoInfo.style.display = videoInfo.style.display === 'none' ? 'block' : 'none';
                }
            });
        });

        // Add Reviewボタンのイベントリスナーを追加
        document.querySelectorAll('.review-button').forEach(button => {
            button.addEventListener('click', function() {
                const videoId = this.dataset.video;
                const reviewForm = document.getElementById(`review-form-${videoId}`);
                if (reviewForm) {
                    reviewForm.style.display = reviewForm.style.display === 'none' ? 'block' : 'none';
                }
            });
        });

        // Submit Reviewボタンのイベントリスナーを追加
        document.querySelectorAll('.submit-review').forEach(button => {
            button.addEventListener('click', function() {
                const videoId = this.dataset.video;
                const reviewForm = document.getElementById(`review-form-${videoId}`);
                const reviewText = reviewForm.querySelector('textarea').value.trim();
                if (reviewText) {
                    alert(`Review for video ${videoId}: ${reviewText}`);
                    reviewForm.querySelector('textarea').value = ''; // フォームをクリア
                    reviewForm.style.display = 'none'; // フォームを非表示に戻す
                } else {
                    alert('Please write a review before submitting.');
                }
            });
        });

        // Add Commentボタンのイベントリスナーを追加
        document.querySelectorAll('.submit-comment').forEach(button => {
            button.addEventListener('click', function() {
                const videoId = this.dataset.video;
                const commentInput = this.previousElementSibling;
                const commentText = commentInput.value.trim();
                if (commentText) {
                    const commentsContainer = document.getElementById(`comments-${videoId}`);
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

    } catch (error) {
        console.error('Error fetching data:', error);
    }
});
