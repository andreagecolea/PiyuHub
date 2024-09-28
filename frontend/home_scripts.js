document.addEventListener('DOMContentLoaded', function() {
    const userIcon = document.getElementById('user-icon');
    const menuIcon = document.getElementById('menu-icon');
    const leftSection = document.getElementById('left');
    const rightSection = document.getElementById('right');
    const logoutButton = document.querySelector('.btn.logout');
    const modal = document.getElementById('logoutModal');
    const confirmButton = document.getElementById('confirmLogout');
    const cancelButton = document.getElementById('cancelLogout');
    const concernsInput = document.getElementById('concernsInput');
    const postImage = document.getElementById('postImage');
    const submitPost = document.getElementById('submitPost');
    const postModal = document.getElementById('postModal');
    const closeFullscreen = document.getElementById('closeFullscreen');
    const cancelPost = document.getElementById('cancelPost');
    const userData = JSON.parse(localStorage.getItem('userData')) || {}; // Fetch user data from local storage

    // Set student name and ID on the page
    document.getElementById('student_name').textContent = `${userData.fname} ${userData.lname}`;
    document.getElementById('student_id').innerHTML = `<i class="fa-solid fa-id-card"></i> ${userData.id_no}`;
    userIcon.addEventListener('click', function() {
        leftSection.classList.toggle('show');
        if (rightSection.classList.contains('show')) {
            rightSection.classList.remove('show');
        }
    });

    menuIcon.addEventListener('click', function() {
        rightSection.classList.toggle('show');
        if (leftSection.classList.contains('show')) {
            leftSection.classList.remove('show');
        }
    });

    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            modal.style.display = 'flex';
        });
    }

    if (confirmButton) {
        confirmButton.addEventListener('click', function() {
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'index.html';
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Show the post modal when clicking on the concerns input
    if (concernsInput) {
        concernsInput.addEventListener('click', function() {
            postModal.style.display = 'flex';
        });
    }

    // Handle the file input change event for multiple image previews
    if (postImage) {
        postImage.addEventListener('change', function(event) {
            const files = event.target.files;
            const imagePreviewsContainer = document.getElementById('imagePreviews');
            imagePreviewsContainer.innerHTML = ''; // Clear previous previews
    
            if (files.length > 5) {
                alert('You can only upload up to 5 images.');
                this.value = ''; // Clear the input if more than 5
                return;
            }
    
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const previewDiv = document.createElement('div');
                    previewDiv.style.position = 'relative';
                    previewDiv.style.display = 'inline-block';
    
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.maxWidth = '100px'; // Adjust the size of the preview
                    img.style.cursor = 'pointer'; // Make image clickable
    
                    // Add click event to show full-screen image
                    img.addEventListener('click', function() {
                        document.getElementById('fullscreenImage').src = img.src;
                        document.getElementById('fullscreenModal').style.display = 'flex';
                    });
    
                    // Create the delete button
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'x';
                    deleteButton.style.position = 'absolute';
                    deleteButton.style.top = '-5px';
                    deleteButton.style.right = '-5px';
                    deleteButton.style.background = 'grey';
                    deleteButton.style.color = 'white';
                    deleteButton.style.border = 'none';
                    deleteButton.style.borderRadius = '50%';
                    deleteButton.style.cursor = 'pointer';
                    deleteButton.style.width = '20px';
                    deleteButton.style.height = '20px';
    
                    // Add click event to delete the image
                    deleteButton.addEventListener('click', function() {
                        previewDiv.remove();
                        const newFiles = Array.from(postImage.files).filter((_, index) => index !== i);
                        const dataTransfer = new DataTransfer();
                        newFiles.forEach(file => dataTransfer.items.add(file));
                        postImage.files = dataTransfer.files; // Update the input files
                    });
    
                    // Append image and button to the preview div
                    previewDiv.appendChild(img);
                    previewDiv.appendChild(deleteButton);
                    imagePreviewsContainer.appendChild(previewDiv); // Append the preview div
                };
                
                reader.readAsDataURL(file);
            }
        });
    }
    

    // Close full-screen image modal
    if (closeFullscreen) {
        closeFullscreen.addEventListener('click', function() {
            document.getElementById('fullscreenModal').style.display = 'none'; // Hide the modal
        });
    }

    // Handle the cancel button
    if (cancelPost) {
        cancelPost.addEventListener('click', function() {
            postModal.style.display = 'none'; // Hide the modal
            document.getElementById('postInput').value = '';
            postImage.value = '';
            document.getElementById('imagePreviews').innerHTML = ''; // Clear previews
        });
    }

    if (submitPost) {
        submitPost.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the default form submission
        
            const postText = document.getElementById('postInput').value;
            const postImages = postImage.files;
            const formData = new FormData();
        
            // Append student_id and name to the form data
            formData.append('student_id', userData.student_id); // Assuming student_id is also in userData
            formData.append('student_name', `${userData.fname} ${userData.lname}`); // Concatenate first and last names
            formData.append('concern', postText);
            
            for (let i = 0; i < postImages.length; i++) {
                formData.append('images[]', postImages[i]);
            }
        
            // Send the data to your PHP script
            fetch('http://localhost/piyuhub/api/home/post_concern', {
                method: 'POST',
                body: formData,
            })
            .then(response => response.json()) // Parse the JSON response
            .then(data => {
                if (data.success) {
                    // Instead of alerting the message, simply reload the page
                    window.location.reload(); // Reload the page to see the new post
                } else {
                    alert(data.error); // Show error if there was one
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
            
        });
        
    }
    
});
document.addEventListener('DOMContentLoaded', function() {
    fetch('http://localhost/piyuhub/api/home/get_posts')
        .then(response => response.json())
        .then(data => {
            const postsContainer = document.getElementById('postsContainer');

            data.forEach(post => {
                const postContainer = document.createElement('div');
                postContainer.className = 'post-container';

                // User post section
                const userPostDiv = document.createElement('div');
                userPostDiv.className = 'user-post';

                const profileImg = document.createElement('img');
                profileImg.className = 'user-dp';
                profileImg.src = post.profile_picture || 'Upload/logo/default_profile.png';
                userPostDiv.appendChild(profileImg);

                const studentNameP = document.createElement('p');
                studentNameP.className = 'student-name';
                studentNameP.textContent = post.student_name;
                userPostDiv.appendChild(studentNameP);

                const studentCollegeP = document.createElement('p');
                studentCollegeP.className = 'student-college';
                studentCollegeP.textContent = post.college;
                userPostDiv.appendChild(studentCollegeP);

                postContainer.appendChild(userPostDiv);

                // Post content section
                const postContentDiv = document.createElement('div');
                postContentDiv.className = 'post-content';

                const postTextP = document.createElement('p');
                postTextP.className = 'post-text';
                postTextP.textContent = post.post_text;
                postContentDiv.appendChild(postTextP);

                // Image Carousel (if images exist)
                if (post.post_images) {
                    const postImagesArray = post.post_images.split(',');

                    const swiperContainer = document.createElement('div');
                    swiperContainer.className = 'swiper-container';

                    const swiperWrapper = document.createElement('div');
                    swiperWrapper.className = 'swiper-wrapper';

                    postImagesArray.forEach(imageSrc => {
                        const slide = document.createElement('div');
                        slide.className = 'swiper-slide';

                        const img = document.createElement('img');
                        img.src = imageSrc.trim();
                        img.alt = "Post Image";

                        img.addEventListener('click', function() {
                            document.getElementById('fullscreenImage').src = imageSrc.trim();
                            document.getElementById('fullscreenModal').style.display = 'flex';
                        });

                        slide.appendChild(img);
                        swiperWrapper.appendChild(slide);
                    });

                    swiperContainer.appendChild(swiperWrapper);

                    const pagination = document.createElement('div');
                    pagination.className = 'swiper-pagination';
                    swiperContainer.appendChild(pagination);

                    postContentDiv.appendChild(swiperContainer);

                    // Initialize Swiper after appending to the DOM
                    setTimeout(() => {
                        new Swiper(swiperContainer, {
                            loop: true,
                            pagination: {
                                el: pagination,
                                clickable: true,
                            },
                            navigation: {
                                nextEl: '.swiper-button-next',
                                prevEl: '.swiper-button-prev',
                            },
                        });
                    }, 0);
                }

                postContainer.appendChild(postContentDiv);
                postsContainer.appendChild(postContainer);
            });
        })
        .catch(error => console.error('Error fetching posts:', error));

    // Close modal functionality
    const closeModal = document.getElementById('closeModal');
    const fullscreenModal = document.getElementById('fullscreenModal');
    closeModal.addEventListener('click', function() {
        fullscreenModal.style.display = 'none';
    });
    fullscreenModal.addEventListener('click', function(event) {
        if (event.target === fullscreenModal) {
            fullscreenModal.style.display = 'none';
        }
    });
});
