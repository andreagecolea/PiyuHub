<?php
class AdminAuth {
    // login
    public function login() {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type");
    
        global $conn;
    
        header('Content-Type: application/json');
        $response = array();
    
        $id_no = $_POST['id_no'] ?? '';
        $password = $_POST['password'] ?? '';
    
        // Validate inputs
        if (empty($id_no)) {
            $response['status'] = 'error';
            $response['message'] = 'ID Number is required.';
            echo json_encode($response);
            return;
        } elseif (!preg_match('/^\d{4}-\d{4}$/', $id_no)) {
            $response['status'] = 'error';
            $response['message'] = 'Invalid Account';
            echo json_encode($response);
            return;
        }
    
        if (empty($password)) {
            $response['status'] = 'error';
            $response['message'] = 'Password is required.';
            echo json_encode($response);
            return;
        }
    
        // Check if user exists, is a Developer, and is approved
        $stmt = $conn->prepare("SELECT id, password FROM users WHERE id_no = ? AND LOWER(position) = 'developer' AND LOWER(status) = 'approved'");
        $stmt->bind_param('s', $id_no);
        $stmt->execute();
        $result = $stmt->get_result();
    
        if ($result->num_rows === 0) {
            $response['status'] = 'error';
            $response['message'] = 'Invalid ID Number or account not approved.';
            echo json_encode($response);
            return;
        }
    
        $user = $result->fetch_assoc();
        $hashed_password = $user['password'];
    
        // Verify password
        if (!password_verify($password, $hashed_password)) {
            $response['status'] = 'error';
            $response['message'] = 'Invalid password.';
            echo json_encode($response);
            return;
        }
    
        // Start the session and store admin ID
        session_start();
        $_SESSION['admin_id'] = $user['id']; // Use a distinct session variable for admin
    
        // Successful admin login
        $response['status'] = 'success';
        $response['message'] = 'Admin login successful.';
        echo json_encode($response);
    }

    
    public function logout() {
        session_start();

        // Destroy the session
        session_unset();
        session_destroy();
        
        // Redirect to the login page
        header("Location: piyuhub_adminlogin.html");
        exit();
    }
}
?>