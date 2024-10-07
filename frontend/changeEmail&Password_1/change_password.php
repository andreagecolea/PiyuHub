<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "piyuhubtry";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(array("message" => "Connection failed: " . $conn->connect_error)));
}

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->student_id) &&
    !empty($data->oldPassword) &&
    !empty($data->newPassword)
) {
    $student_id = $data->student_id;
    $old_password = $data->oldPassword;
    $new_password = $data->newPassword;

    $sql = "SELECT password FROM users WHERE student_id = ?";
    
    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("s", $student_id);
        
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            
            if ($result->num_rows == 1) {
                $row = $result->fetch_assoc();
                $stored_password = $row['password'];
                
                if ($old_password === $stored_password) {
                    $update_sql = "UPDATE users SET password = ? WHERE student_id = ?";
                    
                    if ($update_stmt = $conn->prepare($update_sql)) {
                        $update_stmt->bind_param("ss", $new_password, $student_id);
                        
                        if ($update_stmt->execute()) {
                            echo json_encode(array("message" => "Password was changed successfully."));
                        } else {
                            echo json_encode(array("message" => "Unable to change password."));
                        }
                        
                        $update_stmt->close();
                    }
                } else {
                    echo json_encode(array("message" => "Old password is incorrect."));
                }
            } else {
                echo json_encode(array("message" => "Student not found."));
            }
        } else {
            echo json_encode(array("message" => "Unable to execute query."));
        }
        
        $stmt->close();
    }
} else {
    echo json_encode(array("message" => "Incomplete data."));
}

$conn->close();
?>