document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/videos');
        if (!response.ok) {
            throw new Error('Failed to fetch videos');
        }
        const videos = await response.json();
        const videoList = document.getElementById('video-list');

        videos.forEach(video => {
            const videoElement = document.createElement('div');
            videoElement.className = 'bg-white p-4 rounded-lg shadow-md';
            videoElement.innerHTML = `
                <h2 class="text-lg font-bold">${video.title}</h2>
                <p>${video.description}</p>
                <a href="/video-details.html?id=${video._id}" class="text-blue-500">詳細を見る</a>
            `;
            videoList.appendChild(videoElement);
        });
    } catch (error) {
        console.error('Error loading videos:', error);
    }
});
