document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('/api/users/me', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (response.ok) {
        const user = await response.json();
        document.getElementById('name').value = user.name;
        document.getElementById('email').value = user.email;
    } else {
        // Handle errors
        console.error('Failed to fetch user profile');
    }

    document.getElementById('profile-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;

        const updateResponse = await fetch('/api/users/me', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name })
        });

        if (updateResponse.ok) {
            alert('Profile updated successfully');
        } else {
            // Handle errors
            console.error('Failed to update profile');
        }
    });
});
