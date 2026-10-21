<?php
// backend/public/index.php

// 1. Set global response headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. Parse request URI and method
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Normalize URI (remove base script path or trailing slash)
$scriptDir = dirname($_SERVER['SCRIPT_NAME']);
if ($scriptDir !== '/' && strpos($uri, $scriptDir) === 0) {
    $uri = substr($uri, strlen($scriptDir));
}
$uri = '/' . trim($uri, '/');

// Include controllers
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/HouseController.php';
require_once __DIR__ . '/../controllers/BookingController.php';
require_once __DIR__ . '/../controllers/AdminController.php';

// Serve uploaded files statically if requested
if (strpos($uri, '/uploads/') === 0) {
    $filePath = __DIR__ . '/..' . $uri;
    if (file_exists($filePath) && is_file($filePath)) {
        $mime = mime_content_type($filePath);
        header('Content-Type: ' . $mime);
        readfile($filePath);
        exit;
    }
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'File not found.']);
    exit;
}

// 3. Router
try {
    // Health check / Root
    if (($uri === '/' || $uri === '/api' || $uri === '/health') && $method === 'GET') {
        echo json_encode([
            'status' => 'healthy',
            'service' => 'RentAHome API',
            'version' => '1.0.0'
        ]);
        exit;
    }

    // Auth Routes
    if ($uri === '/api/auth/register' && $method === 'POST') {
        AuthController::register();
        exit;
    }
    if ($uri === '/api/auth/login' && $method === 'POST') {
        AuthController::login();
        exit;
    }
    if ($uri === '/api/auth/me' && $method === 'GET') {
        AuthController::me();
        exit;
    }
    if ($uri === '/api/auth/forgot-password' && $method === 'POST') {
        AuthController::forgotPassword();
        exit;
    }
    if ($uri === '/api/auth/reset-password' && $method === 'POST') {
        AuthController::resetPassword();
        exit;
    }
    if ($uri === '/api/auth/google' && $method === 'POST') {
        AuthController::googleLogin();
        exit;
    }

    // House Routes
    if ($uri === '/api/houses/my/listings' && $method === 'GET') {
        HouseController::myListings();
        exit;
    }
    if ($uri === '/api/houses' && $method === 'GET') {
        HouseController::index();
        exit;
    }
    if ($uri === '/api/houses' && $method === 'POST') {
        HouseController::store();
        exit;
    }
    if (preg_match('#^/api/houses/(\d+)/status$#', $uri, $m) && $method === 'PATCH') {
        HouseController::toggleStatus((int)$m[1]);
        exit;
    }
    if (preg_match('#^/api/houses/(\d+)$#', $uri, $m)) {
        $id = (int)$m[1];
        if ($method === 'GET') {
            HouseController::show($id);
            exit;
        }
        if ($method === 'PUT') {
            HouseController::update($id);
            exit;
        }
        if ($method === 'DELETE') {
            HouseController::destroy($id);
            exit;
        }
    }

    // Booking / Viewing Routes
    if ($uri === '/api/bookings' && $method === 'POST') {
        BookingController::store();
        exit;
    }
    if ($uri === '/api/bookings/my' && $method === 'GET') {
        BookingController::tenantBookings();
        exit;
    }
    if ($uri === '/api/bookings/landlord' && $method === 'GET') {
        BookingController::landlordBookings();
        exit;
    }
    if (preg_match('#^/api/bookings/(\d+)/status$#', $uri, $m) && $method === 'PATCH') {
        BookingController::updateStatus((int)$m[1]);
        exit;
    }

    // Admin Routes
    if ($uri === '/api/admin/stats' && $method === 'GET') {
        AdminController::stats();
        exit;
    }
    if ($uri === '/api/admin/listings' && $method === 'GET') {
        AdminController::listings();
        exit;
    }
    if (preg_match('#^/api/admin/listings/(\d+)/moderate$#', $uri, $m) && $method === 'PATCH') {
        AdminController::moderateListing((int)$m[1]);
        exit;
    }
    if ($uri === '/api/admin/users' && $method === 'GET') {
        AdminController::users();
        exit;
    }
    if (preg_match('#^/api/admin/users/(\d+)/toggle$#', $uri, $m) && $method === 'PATCH') {
        AdminController::toggleUser((int)$m[1]);
        exit;
    }
    if ($uri === '/api/admin/reports' && $method === 'GET') {
        AdminController::reports();
        exit;
    }

    // File Upload Route
    if ($uri === '/api/upload' && $method === 'POST') {
        $user = AuthMiddleware::requireRole(['landlord', 'admin']);
        
        if (empty($_FILES['image'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'No image file uploaded.']);
            exit;
        }

        $file = $_FILES['image'];
        $uploadDir = __DIR__ . '/../uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        if (!in_array($ext, $allowed)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid file extension. Allowed: jpg, jpeg, png, webp.']);
            exit;
        }

        $filename = 'house_' . time() . '_' . bin2hex(random_bytes(6)) . '.' . $ext;
        $target = $uploadDir . $filename;

        if (move_uploaded_file($file['tmp_name'], $target)) {
            $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
            $protocol = $isHttps ? 'https://' : 'http://';
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost:8000';
            $url = $protocol . $host . '/uploads/' . $filename;
            echo json_encode([
                'success' => true,
                'url' => $url,
                'path' => '/uploads/' . $filename
            ]);
            exit;
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to save uploaded file.']);
            exit;
        }
    }

    // Default 404
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => "Endpoint not found: {$method} {$uri}"
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
