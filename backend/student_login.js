document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
  
    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.classList.toggle('bx-show');
        togglePassword.classList.toggle('bx-hide'); // Ensure both classes toggle appropriately
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
                // Set login status in localStorage
                localStorage.setItem('isLoggedIn', 'true');
  
                // Optionally, store user data if returned by the server
                // localStorage.setItem('user_id', data.user_id);
  
                // Redirect or handle successful login
                window.location.href = 'post.html'; // Ensure the redirect points to post.html
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
  
