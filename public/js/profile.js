document.addEventListener('DOMContentLoaded', function() {
    // ユーザープロフィールの取得と表示
    const userId = localStorage.getItem('userId'); // 例: ログイン時に保存したユーザーIDを使用

    if (!userId) {
        alert('User not logged in');
        window.location.href = 'index.html';
        return;
    }

    fetch(`/api/user/${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(user => {
            document.getElementById('username').value = user.username;
            document.getElementById('email').value = user.email;
        })
        .catch(error => {
            console.error('Error fetching user:', error);
            alert('Failed to load user profile');
        });

    // プロフィール更新フォームの送信
    document.getElementById('profile-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        fetch(`/api/user/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            alert('Profile updated successfully');
        })
        .catch(error => {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        });
    });
});
