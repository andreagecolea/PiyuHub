<?php
include 'config.php';

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $response = array();

    $user_id = $_POST['user_id'];
    $position = $_POST['position'];
    $status = $_POST['status'];
    $user_email = $_POST['email']; // Email field
    $full_name = $_POST['full-name'];

    // Determine the email content based on the status
    if ($status == 'approved') {
        $subject = "Your PiyuHub Account Approved";
        $message = "
            <html>
            <head>
                <style>
                    .bold { font-weight: bold; }
                </style>
            </head>
            <body>
                <p class='bold'>Dear $full_name,</p>
                <p>Welcome to PiyuHub! Your account has been approved. You can now login and enjoy PiyuHub!</p>
                <p>Regards,<br/>
                PiyuHub Team
                </p>
            </body>
            </html>
        ";
    } elseif ($status == 'blocked') {
        $subject = "Your PiyuHub Account Blocked";
        $message = "
            <html>
            <head>
                <style>
                    .bold { font-weight: bold; }
                </style>
            </head>
            <body>
                <p class='bold'>Dear $full_name,</p>
                <p>Your account has been blocked due to incorrect information. Please sign up again with the correct details.</p>
                <p>Regards,<br/>
                PiyuHub Team
                </p>
            </body>
            </html>
        ";
    }
    elseif ($status == 'pending') {
        $subject = "Your PiyuHub Account Is Pending";
        $message = "
            <html>
            <head>
                <style>
                    .bold { font-weight: bold; }
                </style>
            </head>
            <body>
                <p class='bold'>Dear $full_name,</p>
                <p>Your account is currently under review. Please wait while our team verifies your details.</p>
                <p>Regards,<br/>
                PiyuHub Team
                </p>
            </body>
            </html>
        ";
    }

    // Update user status and position in the database
    $sql = "UPDATE users SET position = ?, status = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ssi', $position, $status, $user_id);
    
    if ($stmt->execute()) {
        // Send the email to the user
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8\r\n";
        $headers .= 'From: info.piyuhub@gmail.com' . "\r\n"; // Replace with your email
        $headers .= 'Reply-To: info.piyuhub@gmail.com' . "\r\n";

        if (mail($user_email, $subject, $message, $headers)) {
            $response['status'] = 'success';
            $response['message'] = 'User status updated and email sent successfully.';
        } else {
            $response['status'] = 'error';
            $response['message'] = 'User status updated but email failed to send.';
        }

        // Optionally send an email to the admin
        $to_admin = "info.piyuhub@gmail.com"; // Replace with the actual admin email
        $admin_subject = "Account Status Changed";
        $admin_message = "
            <html>
            <head>
                <style>
                    .bold { font-weight: bold; }
                </style>
            </head>
            <body>
                <p class='bold'>An account status has been updated.</p>
                <p>User ID: {$user_id}</p>
                <p>New Status: {$status}</p>
            </body>
            </html>
        ";
        mail($to_admin, $admin_subject, $admin_message, $headers);

        header("Location: admin.php"); // Redirect after successful operation
    } else {
        $response['status'] = 'error';
        $response['message'] = 'Failed to update the user.';
        echo "data: " . json_encode($response) . "\n\n";
    }

    $stmt->close();
    $conn->close();
}
?>
