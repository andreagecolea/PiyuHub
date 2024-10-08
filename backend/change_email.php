<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

error_log("Received request: " . file_get_contents("php://input"));

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "piyuhubtry";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    error_log("Connection failed: " . $conn->connect_error);
    die(json_encode(array("message" => "Connection failed: " . $conn->connect_error)));
}

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->student_id) &&
    !empty($data->newEmail)
) {
    $student_id = $conn->real_escape_string($data->student_id);
    $new_email = $conn->real_escape_string($data->newEmail);

    // Check if the student exists
    $check_sql = "SELECT * FROM users WHERE student_id = '$student_id'";
    $result = $conn->query($check_sql);
    
    if ($result->num_rows == 1) {
        // Student exists, proceed with update
        $update_sql = "UPDATE users SET email = '$new_email' WHERE student_id = '$student_id'";
        
        if ($conn->query($update_sql) === TRUE) {
            echo json_encode(array("message" => "Email was changed successfully."));
        } else {
            error_log("Update failed: " . $conn->error);
            echo json_encode(array("message" => "Unable to change email: " . $conn->error));
        }
    } else {
        error_log("No user found with student_id: $student_id");
        echo json_encode(array("message" => "No user found with the given student ID."));
    }
} else {
    echo json_encode(array("message" => "Incomplete data. Please provide student_id and newEmail."));
}

$conn->close();
error_log("PHP script completed");
?>