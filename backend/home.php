<?php

class PostWeb {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function post_concern() {
        global $conn;
        error_reporting(E_ALL);
        ini_set('display_errors', 1);
        header('Content-Type: application/json');
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type");
    
        // Retrieve posted data
        $student_id = $_POST['student_id'] ?? null;
        $student_name = $_POST['student_name'] ?? null;
        $post_text = isset($_POST['concern']) ? trim($_POST['concern']) : null;
    
        if (empty($student_id) || empty($student_name)) {
            echo json_encode(['error' => true, 'message' => 'Student information is missing.']);
            return;
        }
    
        if (empty($post_text)) {
            echo json_encode(['error' => true, 'message' => 'Concern text is missing.']);
            return;
        }
    
        // Handle image upload
        $uploaded_images = [];  // Array to store image paths
        if (isset($_FILES['images'])) {
            foreach ($_FILES['images']['error'] as $error) {
                if ($error !== UPLOAD_ERR_OK) {
                    echo json_encode(['success' => false, 'error' => 'Error uploading image.']);
                    return;
                }
            }
    
            for ($i = 0; $i < count($_FILES['images']['name']); $i++) {
                $image_name = basename($_FILES['images']['name'][$i]);
                $target_dir = "Upload/posts/";
                $target_file = $target_dir . uniqid() . "_" . $image_name;
    
                if (!move_uploaded_file($_FILES['images']['tmp_name'][$i], $target_file)) {
                    echo json_encode(['success' => false, 'error' => 'Error uploading image.']);
                    return;
                }
    
                // Store each uploaded image path in the array
                $uploaded_images[] = $target_file;
            }
        }
    
        // Insert the post into the 'post' table
        $query = "INSERT INTO post (student_id, student_name, post_text) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("sss", $student_id, $student_name, $post_text);
    
        if ($stmt->execute()) {
            $post_id = $stmt->insert_id;  // Get the inserted post's ID
            
            // Insert the images into a separate table (if there are images)
            if (!empty($uploaded_images)) {
                $image_query = "INSERT INTO post_images (post_id, image_path) VALUES (?, ?)";
                $image_stmt = $conn->prepare($image_query);
    
                foreach ($uploaded_images as $image_path) {
                    $image_stmt->bind_param("is", $post_id, $image_path);
                    $image_stmt->execute();
                }
                $image_stmt->close();
            }
    
            echo json_encode(['success' => true, 'message' => 'Your concern has been posted successfully!']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Error posting concern: ' . $stmt->error]);
        }
    
        $stmt->close();
    }
    
    
    public function get_posts() {
        global $conn;
        header('Content-Type: application/json');
        header("Access-Control-Allow-Methods: GET");

        $query = "
            SELECT 
                p.id, 
                p.post_text, 
                CONCAT(u.fname, ' ', u.lname) AS student_name, 
                u.college, 
                u.profile_picture, 
                GROUP_CONCAT(pi.image_path) AS post_images
            FROM 
                post p
            JOIN 
                users u ON p.student_id = u.student_id
            LEFT JOIN 
                post_images pi ON pi.post_id = p.id
            GROUP BY 
                p.id
            ORDER BY 
                p.created_at DESC
        ";


        $stmt = $conn->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();

        $posts = [];
        while ($row = $result->fetch_assoc()) {
            // Check for default profile image if none exists
            if (!$row['profile_picture']) {
                $row['profile_picture'] = 'Upload/logo/default_profile.png'; // Default profile image path
            }

            $posts[] = $row;
        }

        echo json_encode($posts);
        $stmt->close();
    }
    
    
    
    public function fetch_comment() {
        global $conn;
        // Your comment logic
    }

    public function load_account() {
        global $conn;
    
        // Check if the student_id parameter is set
        if (isset($_GET['student_id'])) {
            $student_id = $_GET['student_id'];
    
            // Prepare the SQL statement to prevent SQL injection
            $stmt = $conn->prepare("SELECT * FROM users WHERE id_no = ?");
            $stmt->bind_param("s", $student_id);
            $stmt->execute();
            
            // Get the result
            $result = $stmt->get_result();
            
            // Check if the user exists
            if ($result->num_rows > 0) {
                // Fetch the user data
                $userData = $result->fetch_assoc();
                $response = [
                    'success' => true,
                    'userData' => $userData
                ];
            } else {
                $response = [
                    'success' => false,
                    'error' => 'User not found'
                ];
            }
    
            // Close the statement
            $stmt->close();
        } else {
            $response = [
                'success' => false,
                'error' => 'Student ID is required'
            ];
        }
    
        // Set the content type to JSON and return the response
        header('Content-Type: application/json');
        echo json_encode($response);
    
    }

    public function upload_profile() {
        // Check if a file is uploaded
        if (isset($_FILES['profile_picture']) && isset($_POST['student_id'])) {
            $studentId = $_POST['student_id'];
            $profilePic = $_FILES['profile_picture'];
    
            // Define the directory where the image will be saved
            $uploadDir = 'Upload/profile/';
            $fileExtension = pathinfo($profilePic['name'], PATHINFO_EXTENSION);
            
            // Generate a unique filename using student ID and original file name
            $originalFileName = pathinfo($profilePic['name'], PATHINFO_FILENAME); // Get the original file name without extension
            $uniqueFileName = 'CCS-' . $studentId . '-' . uniqid() . '-' . $originalFileName . '.' . $fileExtension; // Create a unique file name
            $uploadFile = $uploadDir . $uniqueFileName;
    
            // Check if the file is an image and its size
            $check = getimagesize($profilePic['tmp_name']);
            if ($check !== false && $profilePic['size'] < 5000000) { // Limit file size to 5MB
                
                // Move the uploaded file to the directory (will overwrite if file exists)
                if (move_uploaded_file($profilePic['tmp_name'], $uploadFile)) {
                    // Store the file path in the database
                    $filePathInDb = 'Upload/profile/' . $uniqueFileName;
    
                    // Update the profile picture in the database
                    $sql = "UPDATE users SET profile_picture = ? WHERE id_no = ?";
                    $stmt = $this->db->prepare($sql);
                    if ($stmt->execute([$filePathInDb, $studentId])) {
                        echo json_encode(['success' => 'Profile picture uploaded successfully!', 'profile_picture' => $filePathInDb]);
                    } else {
                        echo json_encode(['error' => 'Failed to update profile picture in database.']);
                    }
                } else {
                    echo json_encode(['error' => 'Failed to upload profile picture.']);
                }
            } else {
                echo json_encode(['error' => 'Invalid file or file too large.']);
            }
        } else {
            echo json_encode(['error' => 'No file uploaded or missing student ID.']);
        }
    }
    
}
?>
