<?php
session_start();
include 'config.php';

if (isset($_POST['login'])) {
    $id_no = $_POST['id_no'];
    $password = $_POST['password'];


    $query = "SELECT * FROM users WHERE id_no = ? AND position = 'Developer' AND status = 'approved'";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $id_no); // Bind the id_no parameter
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();

        if (password_verify($password, $user['password'])) {
            // Set session variables for the admin
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_role'] = $user['position'];
            $_SESSION['user_name'] = $user['fname'] . ' ' . $user['lname'];

            // Redirect to admin dashboard
            header("Location: admin.php");
            exit();
        } else {
            // Wrong password
            header("Location: piyuhub_adminlogin.html?error=Invalid ID or password");
            exit();
        }
    } else {
        // No admin account found or status is not approved
        header("Location: piyuhub_adminlogin.html?error=Account not found");
        exit();
    }
}
?>
