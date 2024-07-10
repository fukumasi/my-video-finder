document.addEventListener('DOMContentLoaded', () => {
    const genreSelect = document.getElementById('genre-select');
    const subgenreSelect = document.getElementById('subgenre-select');
    const sortSelect = document.getElementById('sort-select');
    const videoContainer = document.getElementById('video-container');

    function fetchVideos() {
        const genre = genreSelect ? genreSelect.value : '';
        const subgenre = subgenreSelect ? subgenreSelect.value : '';
        const sort = sortSelect ? sortSelect.value : '';
        const url = `/api/videos/filter?genre=${genre}&subgenre=${subgenre}&sort=${sort}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                videoContainer.innerHTML = ''; // Clear previous videos

                if (data.length === 0) {
                    videoContainer.innerHTML = '<p>動画が見つかりませんでした。</p>';
                } else {
                    data.forEach(video => {
                        const videoElement = createVideoElement(video);
                        videoContainer.appendChild(videoElement);
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching videos:', error);
                videoContainer.innerHTML = '<p>動画の取得中にエラーが発生しました。</p>';
            });
    }

    function createVideoElement(video) {
        const videoDiv = document.createElement('div');
        videoDiv.classList.add('video-item');

        const title = document.createElement('h3');
        title.textContent = video.title;
        videoDiv.appendChild(title);

        const thumbnail = document.createElement('img');
        thumbnail.src = video.thumbnail_url || video.snippet.thumbnails.medium.url;
        videoDiv.appendChild(thumbnail);

        const description = document.createElement('p');
        description.textContent = video.description || video.snippet.description;
        videoDiv.appendChild(description);

        return videoDiv;
    }

    window.fetchVideos = fetchVideos;
});
