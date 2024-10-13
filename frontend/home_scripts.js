document.addEventListener('DOMContentLoaded', function() {
    const userIcon = document.getElementById('user-icon');
    const closeIcon = document.getElementById('close-icon');
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
    const closeModal = document.getElementById('closeModal');
    const cancelPost = document.getElementById('cancelPost');
    const userData = JSON.parse(localStorage.getItem('userData')) || {}; // Fetch user data from local storage
    const uploadButton = document.querySelector('.custom-button');
    const fullscreenModal = document.getElementById('fullscreenModal');
    const fullscreenImage = document.getElementById('fullscreenImage');
    const fileInput = document.getElementById('fileInput');
    const imagePreviewModal = document.getElementById('imagePreviewModal');
    const uploadModal = document.getElementById('uploadModal');
    const errorMessage = document.getElementById('upload-error-message');
    
    // Set student name and ID on the page
    document.getElementById('student_name').textContent = `${userData.fname} ${userData.lname}`;
    document.getElementById('student_id').innerHTML = `<i class="fa-solid fa-id-card"></i> ${userData.id_no}`;
    const overlay = document.getElementById('overlay');

    userIcon.addEventListener('click', function() {
        // Toggle the visibility of the left section
        leftSection.classList.toggle('show');

        // Show or hide the close icon based on the left section's visibility
        closeIcon.style.display = leftSection.classList.contains('show') ? 'inline-block' : 'none'; // Show close icon
        userIcon.style.display = leftSection.classList.contains('show') ? 'none' : 'inline-block'; // Hide user icon

        if (leftSection.classList.contains('show')) {
            document.body.classList.add('no-scroll'); 
            overlay.style.display = 'block'; // Show overlay when left section is open
        } else {
            // Check if the right section is still open
            if (!rightSection.classList.contains('show')) {
                document.body.classList.remove('no-scroll');
                overlay.style.display = 'none'; // Hide overlay if both sections are closed
            }
        }

        // If the right section is currently open, close it
        if (rightSection.classList.contains('show')) {
            rightSection.classList.remove('show');
            menuIcon.style.display = 'inline-block'; // Show menu icon when right section is closed
            closeIcon.style.display = 'none'; // Hide close icon when the right section is closed
        } else {
            // If the left section is not shown, hide the user icon when the menu is opened
            menuIcon.style.display = 'none'; 
        }
    });

    // Menu Icon Click Event
    menuIcon.addEventListener('click', function() {
        rightSection.classList.toggle('show');
        closeIcon.style.display = rightSection.classList.contains('show') ? 'inline-block' : 'none'; // Show close icon
        menuIcon.style.display = rightSection.classList.contains('show') ? 'none' : 'inline-block'; // Hide user icon

        if (rightSection.classList.contains('show')) {
            document.body.classList.add('no-scroll'); 
            overlay.style.display = 'block'; // Show overlay when right section is open
        } else {
            // Check if the left section is still open
            if (!leftSection.classList.contains('show')) {
                document.body.classList.remove('no-scroll');
                overlay.style.display = 'none'; // Hide overlay if both sections are closed
            }
        }

        if (leftSection.classList.contains('show')) {
            leftSection.classList.remove('show');
            userIcon.style.display = 'inline-block'; // Show user icon when left section is closed
            closeIcon.style.display = 'none'; // Hide close icon
        } else {
            // If the left section is not shown, hide the user icon when the menu is opened
            userIcon.style.display = 'none'; 
        }
    });

    // Close Icon Click Event
    closeIcon.addEventListener('click', function() {
        rightSection.classList.remove('show'); // Hide the right section
        closeIcon.style.display = 'none'; // Hide close icon
        menuIcon.style.display = 'inline-block'; // Show menu icon
        userIcon.style.display = 'inline-block'; // Show user icon when closing the right section
        document.body.classList.remove('no-scroll'); 
        overlay.style.display = 'none'; // Hide overlay

        // Ensure the left section is not affected
        if (leftSection.classList.contains('show')) {
            leftSection.classList.remove('show'); // Optional: if you want to also close the left section
        }
    });

    // Event to close sections when clicking on the overlay
    overlay.addEventListener('click', function() {
        if (leftSection.classList.contains('show')) {
            leftSection.classList.remove('show');
            userIcon.style.display = 'inline-block'; // Show user icon
            closeIcon.style.display = 'none'; // Hide close icon
        }else{
            userIcon.style.display = 'inline-block'; 
            menuIcon.style.display = 'inline-block'; // Show menu icon
        }

        // Close the right section if it's open
        if (rightSection.classList.contains('show')) {
            rightSection.classList.remove('show');
            menuIcon.style.display = 'inline-block'; // Show menu icon
            closeIcon.style.display = 'none'; // Hide close icon
        } else{
            userIcon.style.display = 'inline-block'; 
            menuIcon.style.display = 'inline-block'; // Show menu icon
        }
        // Hide overlay and remove no-scroll class
        overlay.style.display = 'none';
        document.body.classList.remove('no-scroll');
    });

   

    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            modal.style.display = 'flex';
        });
    }
    if (uploadButton) {
        uploadButton.addEventListener('click', function() {
            uploadModal.style.display = 'flex';
        });
    }

    if (confirmButton) {
        confirmButton.addEventListener('click', function() {
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'index.html';
        });
    }
    if (confirmUpload) {
        confirmUpload.addEventListener('click', function() {
            uploadProfilePicture();
        });
    }
    function uploadProfilePicture() {
        const fileInput = document.getElementById('fileInput'); 
        const studentId = userData.id_no;
        const errorMessage = document.getElementById('upload-error-message'); // Error message element
        
        // Clear any previous error messages
        errorMessage.textContent = '';
        
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            
            // Check file size (limit 5MB)
            if (file.size > 5000000) {
                errorMessage.textContent = 'File size too large. Please upload an image smaller than 5MB.';
                return;
            }
            
            // Check file type (must be an image)
            if (!file.type.startsWith('image/')) {
                errorMessage.textContent = 'Invalid file type. Please upload an image file.';
                return;
            }
    
            // Display preview image before upload
            const reader = new FileReader();
            reader.onload = function(e) {
                const imagePreview = document.getElementById('imagePreviewModal');
                imagePreview.src = e.target.result; // Set the preview to the uploaded image
            };
            reader.readAsDataURL(file);
    
            // Prepare the form data
            const formData = new FormData();
            formData.append('profile_picture', file);
            formData.append('student_id', studentId);
    
            // Perform the fetch request to upload the image
            fetch('http://localhost/piyuhub/api/home/upload_profile', {
                method: 'POST',
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update the profile picture src
                    const profilePic = document.querySelector('.profile-picture');
                    const userProfilePic = document.getElementById('userProfilePic');
                    const newPictureSrc = data.profile_picture + '?t=' + new Date().getTime(); // Cache busting
                    profilePic.src = newPictureSrc;
                    userProfilePic.src = newPictureSrc;
    
                    // Update the userData object and localStorage
                    userData.profile_picture = data.profile_picture; 
                    localStorage.setItem('userData', JSON.stringify(userData));
    
                    // Hide the modal after successful upload
                    const uploadModal = document.getElementById('uploadModal');
                    uploadModal.style.display = 'none';
                    
                    // Clear the file input
                    fileInput.value = '';
                    
                    // Optionally, reload the page to reflect changes in other areas
                    window.location.reload();
                } else {
                    // Show server-side error in the modal
                    errorMessage.textContent = data.error || 'Failed to upload the image. Please try again.';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                errorMessage.textContent = 'An error occurred during the upload. Please try again.';
            });
        } else {
            errorMessage.textContent = 'Please select an image to upload.';
        }
    }
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const file = fileInput.files[0];

            // Check if a file is selected and is an image
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Show the modal
                    uploadModal.style.display = 'flex';
                    document.body.classList.add('no-scroll');

                    // Display the selected image in the preview modal
                    imagePreviewModal.src = e.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                errorMessage.textContent = 'Invalid file type. Please upload an image.';
            }
        });
    }
        if (cancelUpload) {
            cancelUpload.addEventListener('click', function() {
             document.body.classList.remove('no-scroll');
                    document.getElementById('uploadModal').style.display = 'none'; // Hide the modal
                    document.getElementById('fileInput').value = ''; // Clear the file input
            });
        }
    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            modal.style.display = 'none';
            imagePreviewModal.value = '';
        });
    }

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            document.body.classList.remove('no-scroll'); // Enable body scroll
        }
    });

    // Show the post modal when clicking on the concerns input
    if (concernsInput) {
        concernsInput.addEventListener('click', function() {
            postModal.style.display = 'flex';
            document.body.classList.add('no-scroll');
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
                        document.body.classList.add('no-scroll');
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
            document.body.classList.remove('no-scroll');
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', function() {
            document.getElementById('fullscreenModal').style.display = 'none'; // Hide the modal
            document.body.classList.remove('no-scroll');
        });
    }


    function closeFullscreenModal() {
        fullscreenModal.style.display = 'none';
        document.body.classList.remove('no-scroll');
    }


    fullscreenModal.addEventListener('click', function(event) {
        if (event.target === fullscreenModal) {
            closeFullscreenModal();
            document.body.classList.remove('no-scroll');
        }
    });





    // Handle the cancel button
    if (cancelPost) {
        cancelPost.addEventListener('click', function() {
            postModal.style.display = 'none'; // Hide the modal
            document.getElementById('postInput').value = '';
            postImage.value = '';
            document.getElementById('imagePreviews').innerHTML = ''; // Clear previews
            document.body.classList.remove('no-scroll');
        });
    }

    if (submitPost) {
        submitPost.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the default form submission
        
            const postText = document.getElementById('postInput').value;
            const postImages = postImage.files;
            const formData = new FormData();
        
            // Append student_id and name to the form data
            formData.append('student_id', userData.student_id);
            formData.append('student_name', `${userData.fname} ${userData.lname}`);
            formData.append('concern', postText);
            
            for (let i = 0; i < postImages.length; i++) {
                formData.append('images[]', postImages[i]);
            }
        
            // Immediately close the modal and show a loading spinner or message
            postModal.style.display = 'none'; // Close the modal
            document.body.classList.remove('no-scroll'); // Enable body scroll
            document.getElementById('loadingSpinner').style.display = 'block'; // Show loading spinner
        
            // Send the data to your PHP script
            fetch('http://localhost/piyuhub/api/home/post_concern', {
                method: 'POST',
                body: formData,
            })
            .then(response => response.json()) // Parse the JSON response
            .then(data => {
                if (data.success) {
                    document.getElementById('postInput').value = '';
                    postImage.value = '';
                    document.getElementById('imagePreviews').innerHTML = '';
                    document.getElementById('loadingSpinner').style.display = 'none';
                } else {
                    document.getElementById('loadingSpinner').style.display = 'none'; // Hide spinner if there's an error
                }
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('loadingSpinner').style.display = 'none'; // Hide spinner if there's an error
            });
        });
        
    }
    
});
document.addEventListener('DOMContentLoaded', function () {
    const postsContainer = document.getElementById('postsContainer');
    const commentModal = document.getElementById('commentModal');
    const closeCommentModal = document.getElementById('closeCommentModal');
    const commentList = document.getElementById('commentList');
    const commentInput = document.getElementById('commentInput');
    const submitCommentBtn = document.getElementById('submitCommentBtn');

    let currentPostId; // To track the current post for comments
    let commentFetchInterval; // To hold the interval for fetching comments

    // Function to fetch posts
    let activeIndices = {}; // Store active indices for each post
    let userPosition = ''; // Global variable to store user position

    function fetchUserPosition() {
        const student_id = userData.student_id; // Assuming student_id is in userData
    
        return fetch(`http://localhost/piyuhub/api/home/get_user_position?student_id=${student_id}`, {
            method: 'GET', // GET request
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            userPosition = data.position; // Store user position
            console.log('User position:', userPosition); // For debugging
    
            // Now that we have the user position, fetch the posts
            fetchPosts();
        })
        .catch(error => console.error('Error fetching user position:', error));
    }
    
    // Call fetchUserPosition() to start the process
    fetchUserPosition();
    

    function fetchPosts() {
        fetch('http://localhost/piyuhub/api/home/get_posts')
            .then(response => response.json())
            .then(data => {
                postsContainer.innerHTML = ''; // Clear current posts
    
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
                        const postId = post.id; // Store the post ID for active index tracking
    
                        const swiperContainer = document.createElement('div');
                        swiperContainer.className = 'swiper-container';
    
                        const swiperWrapper = document.createElement('div');
                        swiperWrapper.className = 'swiper-wrapper';
    
                        postImagesArray.forEach((imageSrc, index) => {
                            const slide = document.createElement('div');
                            slide.className = 'swiper-slide';
    
                            const img = document.createElement('img');
                            img.src = imageSrc.trim();
                            img.alt = "Post Image";
    
                            img.addEventListener('click', function () {
                                document.getElementById('fullscreenImage').src = imageSrc.trim();
                                document.getElementById('fullscreenModal').style.display = 'flex';
                                document.body.classList.add('no-scroll');
                            });
    
                            slide.appendChild(img);
                            swiperWrapper.appendChild(slide);
                        });
    
                        swiperContainer.appendChild(swiperWrapper);
    
                        const pagination = document.createElement('div');
                        pagination.className = 'swiper-pagination';
                        swiperContainer.appendChild(pagination);
    
                        postContentDiv.appendChild(swiperContainer); // Append swiper
    
                        const swiperInstance = new Swiper(swiperContainer, {
                            loop: false,
                            pagination: {
                                el: pagination,
                                clickable: true,
                                type: 'bullets',
                            },
                        });
    
                        // Set the active index if it exists
                        if (activeIndices[postId] !== undefined) {
                            swiperInstance.slideTo(activeIndices[postId], 0); // Slide to the stored active index
                        }
    
                        // Save the current active index for this post when the slide changes
                        swiperInstance.on('slideChange', function () {
                            activeIndices[postId] = swiperInstance.activeIndex; // Update the active index
                        });
                    }
    
                    // Create a container for both comment text and icon
                    const createdAtDiv = document.createElement('div');
                    createdAtDiv.className = 'post-created-at-container'; // New container for alignment
    
                    // Comment text and count
                    const commentsText = document.createElement('span');
                    const commentCount = post.comment_count || 0; // Get comment count from post data
                    commentsText.textContent = `Comments (${commentCount})`; // Show comment count
                    commentsText.className = 'comments-text'; // Optional: Add a class for styling
                    commentsText.style.cursor = 'pointer'; // Make it look clickable
    
                    // Add click event to open the comment modal
                    commentsText.addEventListener('click', function () {
                        currentPostId = post.id; // Set the current post ID
                        fetchComments(currentPostId);
                        commentModal.style.display = 'block'; // Show the modal
                        document.body.classList.add('no-scroll'); // Disable body scroll
    
                        // Start fetching comments every 5 seconds
                        if (commentFetchInterval) {
                            clearInterval(commentFetchInterval); // Clear previous interval if exists
                        }
                        commentFetchInterval = setInterval(() => {
                            fetchComments(currentPostId); // Fetch comments every 5 seconds
                        }, 1000);
                    });
    
                    createdAtDiv.appendChild(commentsText); // Add comments text to the container
    
                    // Display created_at date
                    const createdAtP = document.createElement('p');
                    createdAtP.className = 'post-created-at';
    
                    const options = { year: 'numeric', month: 'long', day: 'numeric' };
                    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    
                    createdAtP.textContent = `${new Date(post.created_at).toLocaleDateString(undefined, options)} at ${new Date(post.created_at).toLocaleTimeString(undefined, timeOptions)}`;
    
                    postContentDiv.appendChild(createdAtP); // Add created_at text to the post content
                    postContentDiv.appendChild(createdAtDiv); // Add the new container to the post content
    
                    // If user is a DEVELOPER, show delete icon
                    if (userPosition === 'Developer') {
                        const deleteIconContainer = document.createElement('div');
                        deleteIconContainer.className = 'delete-icon-container'; // Class for positioning
    
                        const deleteIcon = document.createElement('i');
                        deleteIcon.className = 'fas fa-trash'; // Use Font Awesome or similar for the icon
                        deleteIcon.style.cursor = 'pointer'; // Make it clickable
    
                        // Add a click event for opening the delete confirmation modal
                        deleteIcon.addEventListener('click', function () {
                            postIdToDelete = post.id; // Store the post ID to delete
                            document.getElementById('deletePostModal').style.display = 'block'; // Show modal
                        });
    
                        deleteIconContainer.appendChild(deleteIcon); // Add delete icon to the container
                        userPostDiv.appendChild(deleteIconContainer); // Append the delete icon container to post content
                    }

    
                    postContainer.appendChild(postContentDiv);
                    postsContainer.appendChild(postContainer);
                });
            })
            .catch(error => console.error('Error fetching posts:', error));
    }
    document.getElementById('confirmDeleteButton').addEventListener('click', function () {
        if (postIdToDelete) {
            deletePost(postIdToDelete); // Call deletePost function with the stored ID
            document.getElementById('deletePostModal').style.display = 'none'; // Close the modal
            postIdToDelete = null; // Reset the ID after deletion
        }
    });
    
    document.getElementById('cancelDeleteButton').addEventListener('click', function () {
        document.getElementById('deletePostModal').style.display = 'none'; // Close the modal
    });
    
    document.getElementById('closeModal').addEventListener('click', function () {
        document.getElementById('deletePostModal').style.display = 'none'; // Close the modal
    });
    
    // Function to delete a post
    function deletePost(postId) {
        fetch(`http://localhost/piyuhub/api/home/delete_post`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ postId }) // Send the postId in the body
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Post deleted:', data);
            fetchPosts(); // Refresh the posts after deletion
        })
        .catch(error => console.error('Error deleting post:', error));
    }
    
    
    

    function fetchComments(postId) {
        // Step 1: Store the scroll positions of all scrollable comment text containers
        const commentScrollPositions = Array.from(document.querySelectorAll('.comment-text-container')).map(container => ({
            id: container.dataset.commentId, // Assuming each container has a unique comment ID
            scrollPosition: container.scrollTop // Save the scroll position of the container
        }));
    
        fetch(`http://localhost/piyuhub/api/home/get_comments?post_id=${postId}`)
            .then(response => response.json())
            .then(data => {
                commentList.innerHTML = ''; // Clear existing comments
    
                if (data.length === 0) {
                    const noCommentsItem = document.createElement('li');
                    noCommentsItem.className = 'no-comments-item'; // Optional class for styling
                
                    // Create a span for the message
                    const messageSpan = document.createElement('span');
                    messageSpan.textContent = 'Nothing to see here'; // Set the message
                
                    // Create an icon element
                    const nothingIcon = document.createElement('i');
                    nothingIcon.className = 'fa-regular fa-face-smile'; // Use Font Awesome for the icon
                
                    // Append the icon and message to the noCommentsItem
                    noCommentsItem.appendChild(nothingIcon);
                    noCommentsItem.appendChild(messageSpan);
                    
                    commentList.appendChild(noCommentsItem); // Append to the comment list
                }                
                else {
                    data.forEach(comment => {
                        const commentItem = document.createElement('li');
                        commentItem.className = 'comment-item';
    
                        // Comment info container
                        const commentInfo = document.createElement('div');
                        commentInfo.className = 'comment-info'; // Class for the info container
    
                        // Student profile picture
                        const profileImg = document.createElement('img');
                        profileImg.className = 'commenter-dp'; // Class for styling
                        profileImg.src = comment.profile_picture || 'Upload/logo/default_profile.png'; // Fallback image
                        profileImg.alt = `${comment.student_name}'s profile picture`;
    
                        // Student name
                        const studentName = document.createElement('span');
                        studentName.className = 'student-name-comment'; // Class for student name
                        studentName.textContent = comment.student_name;
    
                        // Student college
                        const studentCollege = document.createElement('span');
                        studentCollege.className = 'student-college-comment'; // Class for college
                        studentCollege.textContent = ` ${comment.college}`;
    
                        // Comment creation time
                        const createdAt = document.createElement('span');
                        createdAt.className = 'comment-created-at'; // Class for created_at
                        createdAt.textContent = `${new Date(comment.created_at).toLocaleString()}`;
    
                        // Create a scrollable container for the comment text
                        const commentTextContainer = document.createElement('div');
                        commentTextContainer.className = 'comment-text-container'; // Add this class
                        commentTextContainer.dataset.commentId = comment.id; // Assign unique comment ID
    
                        const commentText = document.createElement('p');
                        commentText.className = 'comment-text'; // Class for comment text
                        commentText.textContent = comment.comment_text;
    
                        // Append comment text to the container if text exists
                        if (comment.comment_text) {
                            commentTextContainer.appendChild(commentText);
                        }
    
                        // Append the profile picture, name, and college to commentInfo
                        commentInfo.appendChild(profileImg); // Add profile picture
                        commentInfo.appendChild(studentName);
                        commentInfo.appendChild(studentCollege);
    
                        // Append info, comment text container, and created_at to commentItem
                        commentItem.appendChild(commentInfo);
                        commentItem.appendChild(commentTextContainer); // Scrollable text container
    
                        if (comment.comment_image) {
                            const commentImageContainer = document.createElement('div'); // Create a container for the image
                            commentImageContainer.className = 'comment-image-container'; // Add a class for styling
                        
                            const commentImage = document.createElement('img');
                            commentImage.className = 'comment-image'; // Class for styling the image
                            commentImage.src = comment.comment_image; // Image URL
                            commentImage.alt = 'Comment Image';
                            commentImage.style.maxWidth = '100%'; // Limit the size of the image
                        
                            // Make the comment image clickable
                            commentImage.addEventListener('click', function (event) {
                                event.preventDefault(); // Prevent default action (if any)
    
                                // Open modal with the clicked image
                                const modal = document.getElementById('imageModal');
                                const modalImage = document.getElementById('modalImage');
                                const caption = document.getElementById('caption');
                        
                                modal.style.display = 'block'; // Show modal
                                modalImage.src = comment.comment_image; // Set the source of the modal image
                                caption.textContent = comment.comment_text || ''; // Optionally show comment text as caption
                            });
                        
                            commentImageContainer.appendChild(commentImage); // Append the image to the container
                            commentItem.appendChild(commentImageContainer); // Append the container to the comment item
                        }
                        
                        
                        commentItem.appendChild(createdAt);
    
                        // Append comment item to the list
                        commentList.appendChild(commentItem);
                    });
    
                    // Step 2: Restore the scroll positions for the comment text containers
                    commentScrollPositions.forEach(({ id, scrollPosition }) => {
                        const container = document.querySelector(`.comment-text-container[data-comment-id="${id}"]`);
                        if (container) {
                            container.scrollTop = scrollPosition; // Restore the scroll position
                        }
                    });
                }
            })
            .catch(error => console.error('Error fetching comments:', error));
    
        // Add event listener to close the modal
        const modalClose = document.getElementById('modalClose');
        modalClose.addEventListener('click', function () {
            const modal = document.getElementById('imageModal');
            modal.style.display = 'none'; // Hide modal
        });
    }
    

    const commentImageInput = document.getElementById('commentImageInput');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer'); // Container for previewing the image
    
    // Function to hide the image preview
    function hideImagePreview() {
        imagePreviewContainer.innerHTML = ''; // Clear the preview container
    }
    
    // Function to show image preview
    function showImagePreview(file) {
        const reader = new FileReader();
        reader.onload = function (e) {

            const img = document.createElement('img');
            img.src = e.target.result; // Set the source to the file reader result
            img.style.maxWidth = '200px'; // Set max width for the preview
            img.style.maxHeight = '200px'; // Set max height for the preview
        };
        reader.readAsDataURL(file); // Read the uploaded file as a Data URL
    }
    
    // Event listener to show the preview when an image is selected
    commentImageInput.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            showImagePreview(file); // Show the image preview
        } else {
            hideImagePreview(); // Hide if no file is selected
        }
    });
    
    submitCommentBtn.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent the default form submission behavior
    
        const commentText = commentInput.value.trim();
        const commentImage = commentImageInput.files[0]; // Get selected image
    
        // Check if either commentText or commentImage is provided
        if (commentText || commentImage) {
            const formData = new FormData(); // Use FormData for image upload
            formData.append('post_id', currentPostId);
            formData.append('student_id', userData.student_id);
            formData.append('comment_text', commentText || ''); // Send empty string if no text
    
            if (commentImage) {
                formData.append('comment_image', commentImage); // Append the image if it exists
            }
    
            // Send the form data via fetch to your backend
            fetch('http://localhost/piyuhub/api/home/add_comment', {
                method: 'POST',
                body: formData // Send form data
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Clear the input fields and image after successful submission
                    commentInput.value = ''; // Clear comment input
                    commentImageInput.value = ''; // Clear the file input
                    hideImagePreview(); // Hide image preview if visible
                    fetchComments(currentPostId); // Refresh comments list without reloading the page
                } else {
                    alert('Failed to add comment. Please try again with different file type.');
                }
            })
            .catch(error => console.error('Error adding comment:', error));
        } else {
            
        }
    });
    
    

// Handle image preview
document.getElementById('commentImageInput').addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const previewContainer = document.getElementById('commentImagePreviewContainer');
            const preview = document.getElementById('commentImagePreview');
            preview.src = e.target.result;
            previewContainer.style.display = 'block'; // Show the image preview
        }
        reader.readAsDataURL(file);
    }
});

// Handle remove image functionality
document.getElementById('removeImageBtn').addEventListener('click', function () {
    hideImagePreview(); // Hide and clear the image preview
});

function hideImagePreview() {
    const previewContainer = document.getElementById('commentImagePreviewContainer');
    previewContainer.style.display = 'none'; // Hide preview container
    document.getElementById('commentImageInput').value = ''; // Clear image input
}

    

    // Close modal event
    closeCommentModal.addEventListener('click', function () {
        commentModal.style.display = 'none'; // Hide the modal
        document.body.classList.remove('no-scroll'); // Enable body scroll

        if (commentFetchInterval) {
            clearInterval(commentFetchInterval); // Clear the comment fetching interval
        }
    });

    fetchPosts(); // Initial fetch of posts

    // Set an interval to refresh posts every 10 minutes (600,000 milliseconds)
    setInterval(fetchPosts, 1000); // 5 minutes
    
});

// Chat Bot
const chatbotIcon = document.getElementById('chatbot-icon');
        const chatbotModal = document.getElementById('chatbot-modal');
        const closeBtn = document.getElementById('close-btn');
        const sendBtn = document.getElementById('send-btn');
        const userInput = document.getElementById('user-input');
        const chatbotMessages = document.getElementById('chatbot-messages');
        const faqBtns = document.querySelectorAll('.faq-btn');

        chatbotIcon.addEventListener('click', () => {
            chatbotModal.style.display = 'block';
            chatbotIcon.style.display = 'none';
        });

        closeBtn.addEventListener('click', () => {
            chatbotModal.style.display = 'none';
            chatbotIcon.style.display = 'flex';
        });

        sendBtn.addEventListener('click', sendMessage);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        function sendMessage() {
            const message = userInput.value.trim();
            if (message) {
                appendMessage('You', message, 'user-message');
                userInput.value = '';
                // Here you can add logic to process the user's message and generate a response
                setTimeout(() => {
                    appendMessage('Chatbot', 'Thank you for your message. How else can I help you?', 'chatbot-message');
                }, 1000);
            }
        }

        function appendMessage(sender, message, className) {
            const messageElement = document.createElement('p');
            messageElement.classList.add(className);
            const senderElement = document.createElement('span');
            senderElement.classList.add('bold');
            senderElement.textContent = sender + ': ';
            messageElement.appendChild(senderElement);
            messageElement.appendChild(document.createTextNode(message));
            chatbotMessages.appendChild(messageElement);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }

        faqBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                appendMessage('You', btn.textContent, 'user-message');
                setTimeout(() => {
                    appendMessage('Chatbot', 'Here\'s information about "' + btn.textContent + '". How else can I assist you?', 'chatbot-message');
                }, 1000);
            });
        });
