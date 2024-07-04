document.getElementById('signup-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
      const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, email, password })
      });

      if (!response.ok) {
          throw new Error('Failed to sign up');
      }

      alert('Sign up successful');
      window.location.href = 'login.html';
  } catch (error) {
      console.error('Error signing up:', error);
      alert(error.message);
  }
});
