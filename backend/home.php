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
    
    
    
    public function get_comments() {
        global $conn; // Assuming you are using $conn (similar to get_posts)
        header('Content-Type: application/json');
        header("Access-Control-Allow-Methods: GET");
    
        if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['post_id'])) {
            $post_id = $_GET['post_id'];
            
            // Query to get comments for a specific post, including the profile picture and comment image
            $query = "
                SELECT 
                    c.id,
                    c.comment_text, 
                    c.comment_image,  -- Include the comment_image field
                    c.created_at, 
                    CONCAT(u.fname, ' ', u.lname) AS student_name, 
                    u.college,
                    u.profile_picture -- Add profile_picture to the selected columns
                FROM 
                    comments c 
                JOIN 
                    users u ON c.student_id = u.student_id
                WHERE 
                    c.post_id = ?
                ORDER BY 
                    c.created_at ASC
            ";
            
            $stmt = $conn->prepare($query);
            $stmt->bind_param('i', $post_id); // Use bind_param for prepared statements
            $stmt->execute();
            $result = $stmt->get_result();
    
            $comments = [];
            while ($row = $result->fetch_assoc()) {
                $comments[] = $row;
            }
    
            // Output the comments in JSON format
            echo json_encode($comments);
            $stmt->close();
        } else {
            http_response_code(400); // Bad request
            echo json_encode(["message" => "Invalid request"]);
        }
    }
    public function add_comment() {
        global $conn;
        error_reporting(E_ALL);
        ini_set('display_errors', 1);
        header('Content-Type: application/json');
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type");
        
        // Initialize variables
        $comment_image = null;
        $uploadDir = 'Upload/comments/'; // Directory to store uploaded images
        
        // Check if there's an image upload
        if (isset($_FILES['comment_image']) && $_FILES['comment_image']['error'] == 0) {
            $comment_image = $uploadDir . basename($_FILES['comment_image']['name']);
            $imageFileType = strtolower(pathinfo($comment_image, PATHINFO_EXTENSION));
            
            // Validate image file type
            $allowedTypes = array('jpg', 'jpeg', 'png', 'gif', 'jfif', 'heic', 'gif');
            if (!in_array($imageFileType, $allowedTypes)) {
                echo json_encode(['success' => false, 'message' => 'Invalid image file type.']);
                return;
            }
            
            // Move uploaded file to the server directory
            if (!move_uploaded_file($_FILES['comment_image']['tmp_name'], $comment_image)) {
                echo json_encode(['success' => false, 'message' => 'Failed to upload image.']);
                return;
            }
        }
        
        // Retrieve posted data from JSON or POST (for text data)
        $post_id = $_POST['post_id'] ?? null;
        $student_id = $_POST['student_id'] ?? null;
        $comment_text = isset($_POST['comment_text']) ? trim($_POST['comment_text']) : ''; // Set to empty string if not provided
    
        // Validate input
        if (empty($post_id) || empty($student_id)) {
            echo json_encode(['success' => false, 'message' => 'Post ID or student ID is missing.']);
            return;
        }
        
        // Start transaction
        $conn->begin_transaction();
        
        try {
            // Retrieve the student's name
            $stmt = $conn->prepare("SELECT fname, lname FROM users WHERE student_id = ?");
            if (!$stmt) {
                throw new Exception("Failed to prepare student query: " . $conn->error);
            }
            $stmt->bind_param("s", $student_id);
            $stmt->execute();
            $result = $stmt->get_result();
    
            // Check if student exists
            if ($result->num_rows === 0) {
                throw new Exception("Student not found with ID: $student_id");
            }
            $user = $result->fetch_assoc();
            $stmt->close();
    
            // Insert the comment into the comments table
            $insert_stmt = $conn->prepare("
                INSERT INTO comments (post_id, student_id, comment_text, fname, lname, comment_image)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            if (!$insert_stmt) {
                throw new Exception("Failed to prepare insert query: " . $conn->error);
            }
    
            // Allow the comment_text to be NULL if empty
            $insert_stmt->bind_param("isssss", $post_id, $student_id, $comment_text, $user['fname'], $user['lname'], $comment_image);
            
            if (!$insert_stmt->execute()) {
                throw new Exception("Failed to execute insert query: " . $insert_stmt->error);
            }
            $insert_stmt->close();
    
            // Commit transaction
            $conn->commit();
    
            echo json_encode(['success' => true, 'message' => 'Comment added successfully!']);
            
        } catch (Exception $e) {
            // Rollback transaction on error
            $conn->rollback();
            error_log("Error in add_comment: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()]);
        }
    }
    public function delete_post() {
        global $conn;
    
        // Check if the request method is DELETE
        if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            // Parse the input JSON body for DELETE requests
            $input = json_decode(file_get_contents('php://input'), true);
    
            // Check if postId is provided
            if (isset($input['postId'])) {
                $postId = intval($input['postId']); // Get the post ID from the request body
    
                // Prepare the SQL statement to delete the post
                $sql = "DELETE FROM post WHERE id = ?";
    
                if ($stmt = $conn->prepare($sql)) {
                    // Bind the parameter
                    $stmt->bind_param('i', $postId);
    
                    // Execute the statement
                    if ($stmt->execute()) {
                        // Check if a row was affected
                        if ($stmt->affected_rows > 0) {
                            http_response_code(200); // OK
                            echo json_encode(['message' => 'Post deleted successfully.']);
                        } else {
                            http_response_code(404); // Not Found
                            echo json_encode(['message' => 'Post not found.']);
                        }
                    } else {
                        http_response_code(500); // Internal Server Error
                        echo json_encode(['message' => 'Error deleting post: ' . $stmt->error]);
                    }
    
                    // Close the statement
                    $stmt->close();
                } else {
                    http_response_code(500); // Internal Server Error
                    echo json_encode(['message' => 'Database error: ' . $conn->error]);
                }
            } else {
                http_response_code(400); // Bad Request
                echo json_encode(['message' => 'Invalid request. Please provide a valid post ID.']);
            }
        } else {
            http_response_code(405); // Method Not Allowed
            echo json_encode(['message' => 'Invalid request method. Only DELETE allowed.']);
        }
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
