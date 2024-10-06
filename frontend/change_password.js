 // We'll include the JavaScript here
 const oldPasswordToggle = document.getElementById('oldTogglePassword');
 const newPasswordToggle = document.getElementById('newTogglePassword');
 const oldPasswordInput = document.getElementById('oldPassword');
 const newPasswordInput = document.getElementById('newPassword');
 const changePasswordButton = document.querySelector('.change-password-box button');
 const passwordStrength = document.getElementById('passwordStrength');

 function togglePasswordVisibility(input, toggle) {
     const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
     input.setAttribute('type', type);
     toggle.classList.toggle('bx-show');
 }

 oldPasswordToggle.addEventListener('click', () => togglePasswordVisibility(oldPasswordInput, oldPasswordToggle));
 newPasswordToggle.addEventListener('click', () => togglePasswordVisibility(newPasswordInput, newPasswordToggle));

 function checkPasswordStrength(password) {
     const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
     const mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");

     if (strongRegex.test(password)) {
         passwordStrength.textContent = "Strong Password";
         passwordStrength.className = "password-strength strong";
     } else if (mediumRegex.test(password)) {
         passwordStrength.textContent = "Medium Password";
         passwordStrength.className = "password-strength medium";
     } else {
         passwordStrength.textContent = "Weak Password";
         passwordStrength.className = "password-strength weak";
     }
 }

 newPasswordInput.addEventListener('input', function() {
     checkPasswordStrength(this.value);
 });

 changePasswordButton.addEventListener('click', function () {
     const oldPassword = oldPasswordInput.value;
     const newPassword = newPasswordInput.value;
     const student_id = 'STU1234567';  // Make sure this matches the student ID in your database

     if (oldPassword === '' || newPassword === '') {
         alert('Please fill in both password fields');
         return;
     }

     if (passwordStrength.textContent === "Weak Password") {
         if (!confirm("Your new password is weak. Are you sure you want to use it?")) {
             return;
         }
     }

     const data = {
         student_id: student_id,
         oldPassword: oldPassword,
         newPassword: newPassword
     };

     fetch('http://localhost/Piyuhubtry/change_password.php', {
         method: 'POST',
         headers: {
             'Content-Type': 'application/json',
         },
         body: JSON.stringify(data)
     })
     .then(response => response.json())
     .then(result => {
         console.log('Server response:', result);
         alert(result.message);
         if (result.message === "Password was changed successfully.") {
             oldPasswordInput.value = '';
             newPasswordInput.value = '';
             passwordStrength.textContent = '';
         }
     })
     .catch(error => {
         console.error('Error:', error);
         alert('An error occurred while changing the password.');
     });
 });