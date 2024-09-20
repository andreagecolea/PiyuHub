const togglePasswordIcons = document.querySelectorAll('.togglePassword'); // Select all elements with the class "togglePassword"

togglePasswordIcons.forEach(toggleIcon => {
  toggleIcon.addEventListener('click', function () {
    // Get the password input field associated with the clicked icon
    const passwordInput = this.closest('.box').querySelector('input[type="password"], input[type="text"]'); // Handle both password and text types

    if (!passwordInput) {
      // Handle potential error if no password input is found
      console.error('Password input not found for clicked icon.');
      return; // Exit the function if no input found
    }

    // Toggle the type attribute of the password input field
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    // Toggle the icon class based on password visibility
    this.classList.toggle('bx-hide');
    this.classList.toggle('bx-show'); // Assuming "bx-show" is your desired class for the visible password icon
  });
});

document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = document.getElementById('signupForm');
  const formData = new FormData(form);

  // Clear previous error messages
  document.getElementById('id-pic-error').textContent = '';
  document.getElementById('acc-error').textContent = '';

  // Client-side validation for file upload
  const idPic = formData.get('id_pic');
  if (!idPic || idPic.size === 0) {
    document.getElementById('id-pic-error').textContent = '*Please upload your Student ID picture.';
    return;
  }

  const idNo = formData.get('id_no');
  const idNoPattern = /^\d{4}-\d{4}$/;
  if (!idNoPattern.test(idNo)) {
    document.getElementById('acc-error').textContent = '*ID Number must be in the format 0000-0000.';
    return;
  }

  // Client-side validation for password
  const password = formData.get('password');
  const confirmPassword = formData.get('confirm_password');

  if (password.length < 6) {
    document.getElementById('acc-error').textContent = '*Password must be at least 6 characters long.';
    return;
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    document.getElementById('acc-error').textContent = '*Password must contain both letters and numbers.';
    return;
  }

  if (password !== confirmPassword) {
    document.getElementById('acc-error').textContent = '*Passwords do not match.';
    return;
  }

  try {
    // Check if email or ID number already exists
    const checkExistsFormData = new FormData();
    checkExistsFormData.append('id_no', idNo);
    checkExistsFormData.append('email', formData.get('email'));

    const checkResponse = await fetch('http://localhost/piyuhub/api/auth/check', {
      method: 'POST',
      body: checkExistsFormData,
    });

    if (!checkResponse.ok) throw new Error('Error checking existing user.');

    const checkData = await checkResponse.json();

    if (checkData.status === 'error') {
      document.getElementById('acc-error').textContent = checkData.message;
      return;
    }

    // Proceed with registration if validation passes
    const response = await fetch('http://localhost/piyuhub/api/auth/register', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Error during registration.');

    const data = await response.json();

    if (data.status === 'success') {
      alert('Account Registered Successfully!')
      window.location.href = 'index.html';
    }
  else {
      document.getElementById('acc-error').textContent = data.message || 'Registration failed. Please try again.';
    }
  } catch (error) {
    document.getElementById('acc-error').textContent = 'An error occurred. Please try again.';
  }
});



document.getElementById('student-id-upload').addEventListener('change', function(event) {
  const file = event.target.files[0];
  const uploadLabel = document.getElementById('upload-label');
  const uploadedImage = document.getElementById('uploaded-image');
  
  if (file) {
      // Display the selected image
      const reader = new FileReader();
      
      reader.onload = function(e) {
          // Set the image source to the selected file
          uploadedImage.src = e.target.result;
          uploadedImage.style.display = 'block'; // Show the image
          uploadLabel.style.display = 'none'; // Hide the label
      };
      
      reader.readAsDataURL(file);
  } else {
      // If no file is selected, reset to initial state
      uploadedImage.style.display = 'none';
      uploadLabel.style.display = 'block';
  }
});
