
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');

  // Toggle password visibility
  togglePassword.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      togglePassword.classList.toggle('bx-show');
  });

  // Handle form submission
  loginForm.addEventListener('submit', (event) => {
      event.preventDefault(); // Prevent the default form submission

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      fetch('http://localhost/piyuhub/api/auth/login', {
          method: 'POST',
          body: formData
      })
      .then(response => response.json())
      .then(data => {
          if (data.status === 'success') {
              // Redirect or handle successful login
              window.location.href = 'post.php'; // Example redirect
          } else {
              // Handle errors
              document.getElementById('login-error').textContent = data.message;
          }
      })
      .catch(error => {
          console.error('Error:', error);
          alert('An error occurred. Please try again.');
      });
  });
});