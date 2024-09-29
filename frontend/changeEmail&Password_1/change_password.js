const oldPasswordToggle = document.getElementById('oldTogglePassword');
const newPasswordToggle = document.getElementById('newTogglePassword');
const oldPasswordInput = document.getElementById('oldPassword');
const newPasswordInput = document.getElementById('newPassword');

// Toggle old password visibility
oldTogglePassword.addEventListener('click', () => {
    const type = oldPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    oldPasswordInput.setAttribute('type', type);
    oldPasswordToggle.classList.toggle('bx-show');
});

// Toggle new password visibility
newTogglePassword.addEventListener('click', () => {
    const type = newPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    newPasswordInput.setAttribute('type', type);
    newPasswordToggle.classList.toggle('bx-show');
});