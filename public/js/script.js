document.addEventListener('DOMContentLoaded', function() {
    // 検索機能のセットアップ
    const searchInput = document.getElementById('search');
    const videoListContainer = document.querySelector('.video-list');

    if (searchInput && videoListContainer) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            videoListContainer.childNodes.forEach(video => {
                const title = video.querySelector('.video-title').textContent.toLowerCase();
                video.style.display = title.includes(query) ? '' : 'none';
            });
        });
    }

    // フィルタリング機能のセットアップ
    const filterSelect = document.getElementById('filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            const category = this.value;
            fetchAndDisplayVideos(category);
        });
    }

    // ジャンルページの動画表示
    if (window.location.pathname.endsWith('genre.html')) {
        displayGenreVideos();
    }

    // ジャンルページの動画表示関数
    function displayGenreVideos() {
        const urlParams = new URLSearchParams(window.location.search);
        const genre = urlParams.get('genre');

        if (genre) {
            fetch(`http://localhost:3000/api/videos?category=${genre}`)
                .then(response => response.json())
                .then(videos => {
                    const genreTitle = document.getElementById('genre-title');
                    if (genreTitle) {
                        genreTitle.textContent = `Videos in ${genre}`;
                    }

                    const genreVideosContainer = document.getElementById('genre-video-list');
                    genreVideosContainer.innerHTML = '';

                    videos.forEach(video => {
                        const listItem = document.createElement('li');
                        listItem.dataset.rating = video.rating;
                        listItem.dataset.views = video.views;
                        listItem.dataset.date = new Date(video.date).getTime();
                        listItem.innerHTML = `
                            <div class="video-details">
                                <div class="video-title">${video.title}</div>
                                <div class="rating">${generateStars(video.rating)}</div>
                                <p>${video.description}</p>
                                <button class="button show-details" data-video="${video._id}">Show Details</button>
                                <div class="video-info" id="video-info-${video._id}" style="display:none;">
                                    <p>Description: ${video.description}</p>
                                    <p>Views: ${video.views}</p>
                                    <p>Likes: ${video.likes}</p>
                                    <h3>Reviews:</h3>
                                    <ul class="review-list" id="review-list-${video._id}"></ul>
                                    <form class="review-form" data-video="${video._id}">
                                        <textarea placeholder="Write your review..." required></textarea>
                                        <input type="number" min="1" max="5" placeholder="Rating (1-5)" required>
                                        <button type="submit" class="button submit-review">Submit</button>
                                    </form>
                                </div>
                            </div>
                        `;
                        genreVideosContainer.appendChild(listItem);
                    });

                    addFilterAndSortListeners();
                    addShowDetailsListener();
                    addReviewFormListeners();
                })
                .catch(error => console.error('Error fetching videos by genre:', error));
        } else {
            alert('No genre selected!');
        }
    }

    // フィルタリングとソートリスナーの追加
    function addFilterAndSortListeners() {
        const ratingFilter = document.getElementById('rating-filter');
        const viewsFilter = document.getElementById('views-filter');
        const dateFilter = document.getElementById('date-filter');
        const sortBy = document.getElementById('sort-by');

        if (ratingFilter && viewsFilter && dateFilter && sortBy) {
            ratingFilter.addEventListener('change', applyFilterAndSort);
            viewsFilter.addEventListener('change', applyFilterAndSort);
            dateFilter.addEventListener('change', applyFilterAndSort);
            sortBy.addEventListener('change', applyFilterAndSort);
        }
    }

    // フィルタリングとソートの適用関数
    function applyFilterAndSort() {
        const ratingFilter = document.getElementById('rating-filter').value;
        const viewsFilter = document.getElementById('views-filter').value;
        const dateFilter = document.getElementById('date-filter').value;
        const sortBy = document.getElementById('sort-by').value;

        let filteredVideos = Array.from(document.querySelectorAll('#genre-video-list li'));

        if (ratingFilter !== 'all') {
            filteredVideos = filteredVideos.filter(video => Number(video.dataset.rating) >= Number(ratingFilter));
        }

        if (viewsFilter !== 'all') {
            filteredVideos = filteredVideos.filter(video => Number(video.dataset.views) >= Number(viewsFilter));
        }

        if (dateFilter !== 'all') {
            const currentDate = new Date().getTime();
            const timeDiff = Number(dateFilter) * 24 * 60 * 60 * 1000;
            filteredVideos = filteredVideos.filter(video => {
                const videoDate = parseInt(video.dataset.date, 10);
                return currentDate - videoDate <= timeDiff;
            });
        }

        let sortedVideos = filteredVideos;
        if (sortBy === 'rating') {
            sortedVideos = filteredVideos.sort((a, b) => Number(b.dataset.rating) - Number(a.dataset.rating));
        } else if (sortBy === 'views') {
            sortedVideos = filteredVideos.sort((a, b) => Number(b.dataset.views) - Number(a.dataset.views));
        } else if (sortBy === 'date') {
            sortedVideos = filteredVideos.sort((a, b) => Number(b.dataset.date) - Number(a.dataset.date));
        }

        const genreVideosContainer = document.getElementById('genre-video-list');
        genreVideosContainer.innerHTML = '';
        sortedVideos.forEach(video => genreVideosContainer.appendChild(video));
    }

    // 星評価の生成関数
    function generateStars(rating) {
        const maxRating = Math.min(rating, 5);  // 最大5まで
        const star = '★';
        const emptyStar = '☆';
        return star.repeat(maxRating) + emptyStar.repeat(5 - maxRating);
    }

    // 詳細表示リスナーの追加
    function addShowDetailsListener() {
        const showDetailsButtons = document.querySelectorAll('.show-details');
        showDetailsButtons.forEach(button => {
            button.addEventListener('click', function() {
                const videoId = this.dataset.video;
                const videoInfo = document.getElementById('video-info-' + videoId);
                if (videoInfo) {
                    videoInfo.style.display = videoInfo.style.display === 'none' ? 'block' : 'none';
                    if (videoInfo.style.display === 'block') {
                        fetchReviews(videoId);
                    }
                }
            });
        });
    }

    // レビューの取得関数
    function fetchReviews(videoId) {
        fetch(`/api/reviews/${videoId}`)
            .then(response => response.json())
            .then(reviews => {
                const reviewList = document.getElementById(`review-list-${videoId}`);
                if (reviewList) {
                    reviewList.innerHTML = '';
                    reviews.forEach(review => {
                        const reviewItem = document.createElement('li');
                        reviewItem.textContent = `${review.username}: ${review.text} (${review.rating} stars)`;
                        reviewList.appendChild(reviewItem);
                    });
                }
            })
            .catch(error => console.error('Error fetching reviews:', error));
    }

    // レビューフォームのリスナー追加
    function addReviewFormListeners() {
        const reviewForms = document.querySelectorAll('.review-form');
        reviewForms.forEach(form => {
            form.addEventListener('submit', function(event) {
                event.preventDefault();
                const videoId = this.dataset.video;
                const textarea = this.querySelector('textarea');
                const ratingInput = this.querySelector('input[type="number"]');
                const reviewText = textarea.value.trim();
                const rating = ratingInput.value.trim();

                if (reviewText && rating) {
                    const reviewData = {
                        videoId: videoId,
                        username: 'Anonymous',  // ユーザー名はここでは固定値としています。適宜変更してください。
                        text: reviewText,
                        rating: Number(rating)
                    };

                    fetch('/api/reviews', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(reviewData)
                    })
                    .then(response => response.json())
                    .then(review => {
                        fetchReviews(videoId);
                        textarea.value = '';
                        ratingInput.value = '';
                    })
                    .catch(error => console.error('Error posting review:', error));
                } else {
                    alert('Please enter both a review and a rating.');
                }
            });
        });
    }
});
