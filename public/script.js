document.addEventListener('DOMContentLoaded', function() {
    // 検索機能
    const searchInput = document.getElementById('search');
    if (!searchInput) {
        console.error('Search input element not found');
        return;
    }
    const videoListContainer = document.querySelector('.video-list');
    if (!videoListContainer) {
        console.error('Video list container element not found');
        return;
    }

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        videoListContainer.childNodes.forEach(video => {
            const title = video.querySelector('.video-title').textContent.toLowerCase();
            video.style.display = title.includes(query) ? '' : 'none';
        });
    });

    // フィルタリング機能
    const filterSelect = document.getElementById('filter');
    if (!filterSelect) {
        console.error('Filter select element not found');
        return;
    }
    filterSelect.addEventListener('change', function() {
        const category = this.value;
        fetchAndDisplayVideos(category);
    });

    // レビュー機能
    const addReviewListeners = () => {
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
    };

    // 評価システムの実装
    const addRatingListeners = () => {
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
    };

    // コメント機能の実装
    const addCommentListeners = () => {
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
    };

    // 推薦動画機能の実装
    function recommendVideos() {
        const recommendationList = document.getElementById('recommendation-list');
        if (!recommendationList) {
            console.error('Recommendation list element not found');
            return;
        }
        recommendationList.innerHTML = ''; // 既存の推薦動画をクリア

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

     // 星評価の生成
     function generateStars(rating) {
        const star = '★';
        const emptyStar = '☆';
        return star.repeat(rating) + emptyStar.repeat(5 - rating);
    }

    // ジャンルページへの遷移
    function goToGenrePage(genre) {
        window.location.href = `genre.html?genre=${genre}`;
    }

    // カテゴリーボタンのクリックイベントにリダイレクト機能を追加
    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', function() {
            const category = this.dataset.category;
            goToGenrePage(category);
        });
    });

    // ジャンルページの動画表示
    function displayGenreVideos() {
        const urlParams = new URLSearchParams(window.location.search);
        const genre = urlParams.get('genre');

        if (genre) {
            fetch(`http://localhost:3000/api/videos?category=${genre}`)
                .then(response => response.json())
                .then(videos => {
                    const genreVideosContainer = document.getElementById('genre-video-list');
                    if (!genreVideosContainer) {
                        console.error('Genre video list element not found');
                        return;
                    }
                    genreVideosContainer.innerHTML = ''; // 既存のリストをクリア

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
                            </div>
                        `;
                        genreVideosContainer.appendChild(listItem);
                    });

                    // フィルタリングとソートのイベントリスナーを設定
                    addFilterAndSortListeners();
                })
                .catch(error => console.error('Error fetching videos by genre:', error));
        } else {
            alert('No genre selected!');
        }
    }

    // フィルタリングとソートのイベントリスナー
    function addFilterAndSortListeners() {
        const ratingFilter = document.getElementById('rating-filter');
        const viewsFilter = document.getElementById('views-filter');
        const dateFilter = document.getElementById('date-filter');
        const sortBy = document.getElementById('sort-by');

        ratingFilter.addEventListener('change', filterAndSortVideos);
        viewsFilter.addEventListener('change', filterAndSortVideos);
        dateFilter.addEventListener('change', filterAndSortVideos);
        sortBy.addEventListener('change', filterAndSortVideos);
    }

    // フィルタリングとソートの処理
    function filterAndSortVideos() {
        const ratingFilter = document.getElementById('rating-filter').value;
        const viewsFilter = document.getElementById('views-filter').value;
        const dateFilter = document.getElementById('date-filter').value;
        const sortBy = document.getElementById('sort-by').value;
    
        let filteredVideos = Array.from(document.querySelectorAll('#genre-video-list li'));
    
        if (ratingFilter !== 'all') {
            filteredVideos = filteredVideos.filter(video => parseInt(video.dataset.rating) >= parseInt(ratingFilter));
        }
    
        if (viewsFilter !== 'all') {
            filteredVideos = filteredVideos.filter(video => parseInt(video.dataset.views) >= parseInt(viewsFilter));
        }
    
        if (dateFilter !== 'all') {
            const now = Date.now();
            const daysAgo = parseInt(dateFilter) * 24 * 60 * 60 * 1000;
            filteredVideos = filteredVideos.filter(video => now - parseInt(video.dataset.date) <= daysAgo);
        }
    
        if (sortBy === 'rating') {
            filteredVideos.sort((a, b) => parseInt(b.dataset.rating) - parseInt(a.dataset.rating));
        } else if (sortBy === 'views') {
            filteredVideos.sort((a, b) => parseInt(b.dataset.views) - parseInt(a.dataset.views));
        } else if (sortBy === 'date') {
            filteredVideos.sort((a, b) => parseInt(b.dataset.date) - parseInt(a.dataset.date));
        }
    
        const genreVideosContainer = document.getElementById('genre-video-list');
        genreVideosContainer.innerHTML = '';
        filteredVideos.forEach(video => genreVideosContainer.appendChild(video));
    }

    // `genre.html` が読み込まれた際に実行
    if (window.location.pathname.endsWith('genre.html')) {
        document.addEventListener('DOMContentLoaded', displayGenreVideos);
    }
});

 // ジャンルページへの遷移
    function goToGenrePage(genre) {
        window.location.href = `genre.html?genre=${genre}`;
    }

    // カテゴリーボタンのクリックイベントにリダイレクト機能を追加
    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', function() {
            const category = this.dataset.category;
            goToGenrePage(category);
        });
    });

    // ジャンルページの動画表示
    function displayGenreVideos() {
        const urlParams = new URLSearchParams(window.location.search);
        const genre = urlParams.get('genre');

        if (genre) {
            fetch(`http://localhost:3000/api/videos?category=${genre}`)
                .then(response => response.json())
                .then(videos => {
                    const genreVideosContainer = document.getElementById('genre-video-list');
                    if (!genreVideosContainer) {
                        console.error('Genre video list element not found');
                        return;
                    }
                    genreVideosContainer.innerHTML = ''; // 既存のリストをクリア

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
                            </div>
                        `;
                        genreVideosContainer.appendChild(listItem);
                    });

                    // フィルタリングとソートのイベントリスナーを設定
                    addFilterAndSortListeners();
                })
                .catch(error => console.error('Error fetching videos by genre:', error));
        } else {
            alert('No genre selected!');
        }
    }

    // 星評価の生成
    function generateStars(rating) {
        const star = '★';
        const emptyStar = '☆';
        return star.repeat(rating) + emptyStar.repeat(5 - rating);
    }

    // フィルタリングとソートのイベントリスナーを追加
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

    // フィルタリングとソートの適用
    function applyFilterAndSort() {
        const ratingFilter = document.getElementById('rating-filter').value;
        const viewsFilter = document.getElementById('views-filter').value;
        const dateFilter = document.getElementById('date-filter').value;
        const sortBy = document.getElementById('sort-by').value;

        let filteredVideos = Array.from(document.querySelectorAll('#genre-video-list li'));

        if (ratingFilter !== 'all') {
            filteredVideos = filteredVideos.filter(video => video.dataset.rating === ratingFilter);
        }

        if (viewsFilter !== 'all') {
            filteredVideos = filteredVideos.filter(video => video.dataset.views >= viewsFilter);
        }

        if (dateFilter !== 'all') {
            const currentDate = new Date().getTime();
            const timeDiff = dateFilter * 24 * 60 * 60 * 1000;
            filteredVideos = filteredVideos.filter(video => {
                const videoDate = parseInt(video.dataset.date, 10);
                return currentDate - videoDate <= timeDiff;
            });
        }

        let sortedVideos = filteredVideos;
        if (sortBy === 'rating') {
            sortedVideos = filteredVideos.sort((a, b) => b.dataset.rating - a.dataset.rating);
        } else if (sortBy === 'views') {
            sortedVideos = filteredVideos.sort((a, b) => b.dataset.views - a.dataset.views);
        } else if (sortBy === 'date') {
            sortedVideos = filteredVideos.sort((a, b) => b.dataset.date - a.dataset.date);
        }

        const genreVideosContainer = document.getElementById('genre-video-list');
        genreVideosContainer.innerHTML = '';
        sortedVideos.forEach(video => genreVideosContainer.appendChild(video));
    }

    // `genre.html` が読み込まれた際に実行
    if (window.location.pathname.endsWith('genre.html')) {
        document.addEventListener('DOMContentLoaded', displayGenreVideos);
    }
