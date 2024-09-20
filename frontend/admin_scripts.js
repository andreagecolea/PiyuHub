function changeTab(tabElement, tabName) {
    // Remove active class from all tabs
    var tabs = document.getElementsByClassName("tab");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("active");
    }
    
    // Add active class to clicked tab
    tabElement.classList.add("active");
    
    // Hide all tab contents
    var tabContents = document.getElementsByClassName("tab-content");
    for (var i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = "none";
    }
    
    // Show the selected tab content
    document.getElementById(tabName).style.display = "block";
}

// Get the modal
// Get the modal
var modal = document.getElementById("fullscreenModal");
var modalImg = document.getElementById("fullscreenImage");
var closeBtn = document.getElementsByClassName("close-fullscreen")[0];

// Get all images with the class "idPic"
var images = document.getElementsByClassName("idPic");

// Loop through all images and add the onclick event to each
for (var i = 0; i < images.length; i++) {
    images[i].onclick = function() {
        modal.style.display = "block";
        modalImg.src = this.src; // Set the modal image source to the clicked image's source
    };
}

// When the user clicks on the close button (x), close the modal
closeBtn.onclick = function() {
    modal.style.display = "none";
}

// Optional: close the modal when clicking outside the image
modal.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

