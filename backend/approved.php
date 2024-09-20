<?php
session_start();

// Set the session timeout duration (in seconds)
$timeout_duration = 600; // 10 minutes

// Check if the user is logged in and is an admin
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'Developer') {
    header("Location: piyuhub_adminlogin.php"); // Redirect to login page if not admin
    exit();
}

// Check if the last activity timestamp exists
if (isset($_SESSION['last_activity'])) {
    // Calculate the time elapsed since the last activity
    $time_elapsed = time() - $_SESSION['last_activity'];

    // If the time elapsed is greater than the timeout duration, log out the user
    if ($time_elapsed > $timeout_duration) {
        // Unset session variables and destroy the session
        session_unset();
        session_destroy();

        // Redirect to the login page with a timeout message
        header("Location: piyuhub_adminlogin.php?error=Session timed out due to inactivity");
        exit();
    }
}

// Update the last activity timestamp
$_SESSION['last_activity'] = time();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Post</title>
    <link rel="stylesheet" href="style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</head>
<body>
    <!-- Top Section -->
    <?php
    $currentPage = basename($_SERVER['PHP_SELF']); // Get the current page name
    ?>
    <div id="top">
        <div class="logo-container">
            <img src="Upload/logo/Piyulogo.png" alt="Logo" class="logo">
            <span class="site-name">PiyuHub</span>
        </div>
        <div class="status-container">
            <a href="admin.php" class="tab <?php echo ($currentPage == 'admin.php') ? 'active' : ''; ?>">PENDING</a>
            <a href="approved.php" class="tab <?php echo ($currentPage == 'approved.php') ? 'active' : ''; ?>">APPROVED</a>
            <a href="blocked.php" class="tab <?php echo ($currentPage == 'blocked.php') ? 'active' : ''; ?>">BLOCKED</a>
        </div>
    </div>


    <!-- List of pending -->
    <?php
    // Assume you have a connection to the database
    include 'config.php'; 

    $query = "SELECT id, id_pic, fname, lname, id_no, email, position, status FROM users WHERE status = 'approved'";
    $result = $conn->query($query);

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
    ?>
        <div class="pending-list-item">
            <form action="update_status.php" method="post" enctype="multipart/form-data">
                <input type="hidden" name="user_id" value="<?php echo $row['id']; ?>">
                <div class="pending-list-content">
                    <!-- ID Picture -->
                    <div class="id-pic-container">
                        <img src="<?php echo $row['id_pic']; ?>" alt="ID Picture" class="id-pic idPic" title="Click to view the picture">
                    </div>

                    <!-- Full-Screen Image Modal -->
                    <div id="fullscreenModal" class="fullscreen-modal">
                        <span class="close-fullscreen">&times;</span> <!-- Close button -->
                        <img class="fullscreen-content" id="fullscreenImage">
                    </div>



                    <!-- Info and Buttons -->
                    <div class="user-details">
                        <div class="info-list">   
                            <p><strong>ID:</strong> <?php echo $row['id']; ?></p>
                            <p><strong>Name:</strong> <?php echo $row['fname'] . ' ' . $row['lname']; ?></p>
                            <input type="hidden" name="full-name" value="<?php echo $row['fname'] . ' ' . $row['lname']; ?>">
                            <p><strong>ID No:</strong> <?php echo $row['id_no']; ?></p>
                            <p><strong>Email:</strong> <input name="email" class="email" type="email" value="<?php echo $row['email']; ?>" readonly></p>
                        </div>
                        
                         <!-- Right Section: Dropdowns and Buttons -->
                        <div class="dropdown-buttons-section">
                            <!-- Position Dropdown -->
                            <label for="position">Position:</label>
                            <select name="position" id="position">
                                <option value="Student" <?php if($row['position'] == 'Student') echo 'selected'; ?>>Student</option>
                                <option value="Representative" <?php if($row['position'] == 'Representative') echo 'selected'; ?>>Representative</option>
                                <option value="SSC" <?php if($row['position'] == 'SSC') echo 'selected'; ?>>SSC</option>
                                <option value="Admin" <?php if($row['position'] == 'Admin') echo 'selected'; ?>>Admin</option>
                                <option value="Developer" <?php if($row['position'] == 'Developer') echo 'selected'; ?>>Developer</option>
                            </select>

                        <!-- Status Dropdown -->
                        <!-- Status Dropdown -->
                        <label for="status">Status:</label>
                        <select name="status" id="status">
                            <option name="option" value="pending" <?php if($row['status'] == 'pending') echo 'selected'; ?>>Pending</option>
                            <option name="option" value="approved" <?php if($row['status'] == 'approved') echo 'selected'; ?>>Approved</option>
                            <option name="option" value="blocked" <?php if($row['status'] == 'blocked') echo 'selected'; ?>>Blocked</option>
                        </select>
                        </div>
                        <!-- Approve and Block Buttons -->
                        <div class="button-group">
                            <button type="submit" name="action" value="approve" class="appr-btn">PROCESS</button>
                        </div>
                    
                </div>
            </form>
        </div>

    <?php
        }
    } else {
        echo '<div class="no-users-message">No approved users found.</div>';
    }
    ?>

<!-- Logout Button -->
<div class="logout-container">
    <form action="admin_logout.php" method="post" onsubmit="return confirmLogout();">
        <button type="submit" class="logout-btn">Logout</button>
    </form>
</div>


</body>
<script>
    function confirmLogout() {
        return confirm("Are you sure you want to logout?");
    }
</script>

<script src="scripts.js"></script>
</html>
