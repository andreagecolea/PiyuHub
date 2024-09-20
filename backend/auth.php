<?php
class AuthWeb {
    // register
    public function register() {
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: *'); // If necessary   

        global $conn;
    
        $response = array();
    
        $id_pic = $_FILES['id_pic'] ?? '';
        $fname = $_POST['fname'] ?? '';
        $lname = $_POST['lname'] ?? '';
        $college = $_POST['college'] ?? '';
        $id_no = $_POST['id_no'] ?? '';
        $email = $_POST['email'] ?? '';
        $status = $_POST['status'] ?? 'pending'; // Default value
        $position = $_POST['position'] ?? 'Student'; // Default value
        $password = $_POST['password'] ?? '';
        $confirm_password = $_POST['confirm_password'] ?? '';
    
        // Validate inputs
        if (empty($_FILES['id_pic']['name'])) {
            $response['status'] = 'error';
            $response['message'] = 'Please provide your ID picture.';
            echo json_encode($response);
            return;
        }        
    
        $allowed_types = ['image/jpeg', 'image/png', 'image/heic'];
        if (!in_array($id_pic['type'], $allowed_types)) {
            $response['status'] = 'error';
            $response['message'] = 'Invalid file type. Only JPG, PNG, and HEIC files are allowed.';
            echo json_encode($response);
            return;
        }
    
        if (empty($fname)) {
            $response['status'] = 'error';
            $response['message'] = 'First Name is required.';
            echo json_encode($response);
            return;
        }
    
        if (empty($lname)) {
            $response['status'] = 'error';
            $response['message'] = 'Last Name is required.';
            echo json_encode($response);
            return;
        }
    
        $valid_colleges = ['CCS', 'CTE', 'CFND', 'CAS', 'COF', 'CCJE', 'CHMT', 'CBAA'];
        if (!in_array($college, $valid_colleges)) {
            $response['status'] = 'error';
            $response['message'] = 'Invalid college value. Valid values are: ' . implode(', ', $valid_colleges);
            echo json_encode($response);
            return;
        }
    
        if (!preg_match('/^\d{4}-\d{4}$/', $id_no)) {
            $response['status'] = 'error';
            $response['message'] = 'ID Number must be in the format 0000-0000.';
            echo json_encode($response);
            return;
        }
    
        if (empty($email)) {
            $response['status'] = 'error';
            $response['message'] = 'Email is required.';
            echo json_encode($response);
            return;
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $response['status'] = 'error';
            $response['message'] = 'Invalid email format.';
            echo json_encode($response);
            return;
        }
    
        if (empty($password)) {
            $response['status'] = 'error';
            $response['message'] = 'Password is required.';
            echo json_encode($response);
            return;
        } elseif (strlen($password) < 6) {
            $response['status'] = 'error';
            $response['message'] = 'Password must be at least 6 characters long.';
            echo json_encode($response);
            return;
        } elseif (!preg_match('/[A-Za-z]/', $password) || !preg_match('/[0-9]/', $password)) {
            $response['status'] = 'error';
            $response['message'] = 'Password must contain both letters and numbers.';
            echo json_encode($response);
            return;
        }
    
        if ($password !== $confirm_password) {
            $response['status'] = 'error';
            $response['message'] = 'Passwords do not match.';
            echo json_encode($response);
            return;
        }
    
        // Generate student_id based on college and existing records
        $student_id = $this->generateStudentId($college);
    
        // Handle file upload
        if ($id_pic && $id_pic['error'] == UPLOAD_ERR_OK) {
            $id_pic_dir = 'admin/Upload/id/'; // Save in admin/Upload/id/
            $id_pic_filename = $student_id . '_' . basename($id_pic['name']);
            $id_pic_path = $id_pic_dir . $id_pic_filename;
            
            // Save file in the directory
            if (!move_uploaded_file($id_pic['tmp_name'], $id_pic_path)) {
                $response['status'] = 'error';
                $response['message'] = 'Error uploading profile picture.';
                echo json_encode($response);
                return;
            }
            
            // Save relative path in database
            $id_pic_db_path = 'Upload/id/' . $id_pic_filename;
        } else {
            $id_pic_db_path = ''; // Or handle as needed
        }
    
        // Check if user already exists
        $stmt = $conn->prepare("SELECT * FROM users WHERE id_no = ? OR email = ?");
        $stmt->bind_param("ss", $id_no, $email);
        $stmt->execute();
        $result = $stmt->get_result();
        $stmt->close();
    
        if ($result->num_rows > 0) {
            $response['status'] = 'error';
            $response['message'] = 'Account already exists or pending.';
            echo json_encode($response);
            return;
        }
    
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
        // Insert the new user into the database
        $stmt = $conn->prepare("INSERT INTO users (student_id, id_pic, fname, lname, id_no, college, email, status, position, password, reset_token_hash, reset_token_expires_at, login_attempts, last_attempt_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, 0, CURRENT_TIMESTAMP)");
        $stmt->bind_param("ssssssssss", $student_id, $id_pic_db_path, $fname, $lname, $id_no, $college, $email, $status, $position, $hashed_password);
        $stmt->execute();
        $stmt->close();
    
        $response['status'] = 'success';
        $response['message'] = 'Registration successful.';
        echo json_encode($response);
    }
    
    // Helper function to generate student_id based on college
    private function generateStudentId($college) {
        header('Cache-Control: no-cache');
        global $conn;
        // Get the last student_id for the given college
        $query = "SELECT student_id FROM users WHERE college = ? ORDER BY student_id DESC LIMIT 1";
        $stmt = $conn->prepare($query);
        $stmt->bind_param('s', $college);
        $stmt->execute();
        $result = $stmt->get_result();
        $last_id = $result->fetch_assoc();
        $number = 1; // Default starting number

        if ($last_id && isset($last_id['student_id'])) {
            // Extract the numeric part and increment
            $number = intval(substr($last_id['student_id'], strlen($prefix) + 1)) + 1;
        }

        
        // Extract the numeric part and increment
        $prefix = $college;
        $number = 1;
        if ($last_id) {
            $number = intval(substr($last_id, strlen($prefix) + 1)) + 1;
        }
        
        // Generate the new student_id
        return $prefix . '-' . str_pad($number, 2, '0', STR_PAD_LEFT);
    }
    
    
    // Login user
    public function login() {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type");
    
        global $conn;
    
        header('Content-Type: application/json');
        $response = array();
    
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';
    
        // Validate inputs
        if (empty($email)) {
            $response['status'] = 'error';
            $response['message'] = 'Email is required.';
            echo json_encode($response);
            return;
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $response['status'] = 'error';
            $response['message'] = 'Invalid email format.';
            echo json_encode($response);
            return;
        }
    
        if (empty($password)) {
            $response['status'] = 'error';
            $response['message'] = 'Password is required.';
            echo json_encode($response);
            return;
        }
    
        // Check if user exists and is approved
        $stmt = $conn->prepare("SELECT id, password, status FROM users WHERE email = ? AND status = 'approved'");
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $result = $stmt->get_result();
    
        if ($result->num_rows === 0) {
            $response['status'] = 'error';
            $response['message'] = 'Invalid email or account not approved.';
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
    
        // Start the session and store user ID
        session_start();
        $_SESSION['user_id'] = $user['id'];
    
        // Successful login
        $response['status'] = 'success';
        $response['message'] = 'Login successful.';
        echo json_encode($response);
    }
    public function check(){
        // check_exists.php

        header('Content-Type: application/json');

        global $conn;

        $response = array();

        $id_no = $_POST['id_no'] ?? '';
        $email = $_POST['email'] ?? '';

        // Validate inputs
        if (empty($id_no) || empty($email)) {
            $response['status'] = 'error';
            $response['message'] = 'ID Number and Email are required.';
            echo json_encode($response);
            exit;
        }

        // Check if user already exists
        $stmt = $conn->prepare("SELECT * FROM users WHERE id_no = ? OR email = ?");
        $stmt->bind_param("ss", $id_no, $email);
        $stmt->execute();
        $result = $stmt->get_result();
        $stmt->close();

        if ($result->num_rows > 0) {
            $response['status'] = 'error';
            $response['message'] = 'ID Number or Email already exists.';
        } else {
            $response['status'] = 'success';
        }

        echo json_encode($response);
    }
    
}
?>
