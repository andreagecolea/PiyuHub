 // JavaScript code here
 const backButton = document.getElementById('backButton');
 const changeEmailBtn = document.getElementById('changeEmailBtn');
 const newEmailInput = document.getElementById('newEmail');
 const darkModeToggle = document.getElementById('darkModeToggle');
 const body = document.body;

 backButton.addEventListener('click', () => {
     history.back();
 });


 function isValidEmail(email) {
     const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
     return re.test(String(email).toLowerCase());
 }

 changeEmailBtn.addEventListener('click', () => {
     const newEmail = newEmailInput.value;
     const student_id = 'STU1234567';  // Make sure this matches the student ID in your database

     if (newEmail === '') {
         alert('Please enter a new email address');
         return;
     }

     if (!isValidEmail(newEmail)) {
         alert('Please enter a valid email address');
         return;
     }

     const data = {
         student_id: student_id,
         newEmail: newEmail
     };

     fetch('http://localhost/Piyuhubtry/change_email.php', {
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
         if (result.message === "Email was changed successfully.") {
             newEmailInput.value = '';
         }
     })
     .catch(error => {
         console.error('Error:', error);
         alert('An error occurred while changing the email.');
     });
 });