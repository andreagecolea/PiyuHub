document.addEventListener('DOMContentLoaded', function() {
    const userIcon = document.getElementById('user-icon');
    const menuIcon = document.getElementById('menu-icon');
    const leftSection = document.getElementById('left');
    const rightSection = document.getElementById('right');

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
});

// Your existing changeTab function here
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
