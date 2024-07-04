document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
      const response = await fetch('/api/users/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
          throw new Error('Failed to login');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      alert('Login successful');
      window.location.href = 'index.html';
  } catch (error) {
      console.error('Error logging in:', error);
      alert(error.message);
  }
});
