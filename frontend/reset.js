// Select all toggle password icons
const togglePasswordIcons = document.querySelectorAll('#togglePassword');

// Add event listeners to each icon
togglePasswordIcons.forEach(toggleIcon => {
    toggleIcon.addEventListener('click', function () {
        // Find the associated password input field
        const passwordInput = this.previousElementSibling;

        if (!passwordInput) {
            // Handle if no password input is found
            console.error('Password input not found for clicked icon.');
            return;
        }

        // Toggle the type attribute between 'password' and 'text'
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Toggle the icon class for visibility
        this.classList.toggle('bx-hide');
        this.classList.toggle('bx-show');
    });
});