<?php
// backend/controllers/AuthController.php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../middleware/auth.php';

class AuthController {
    public static function register(): void {
        $data = json_decode(file_get_contents('php://input'), true);

        $fullName = trim($data['full_name'] ?? '');
        $email = trim($data['email'] ?? '');
        $phone = trim($data['phone'] ?? '');
        $password = $data['password'] ?? '';
        $role = $data['role'] ?? 'tenant';

        if (empty($fullName) || empty($email) || empty($password) || empty($phone)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'All fields (full_name, email, phone, password) are required.']);
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Please provide a valid email address.']);
            return;
        }

        if (!in_array($role, ['tenant', 'landlord'])) {
            $role = 'tenant';
        }

        $pdo = Database::getConnection();

        // Check if email already registered
        $stmt = $pdo->prepare('SELECT user_id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'An account with this email already exists.']);
            return;
        }

        $passwordHash = password_hash($password, PASSWORD_BCRYPT);

        $insertStmt = $pdo->prepare(
            'INSERT INTO users (full_name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)'
        );
        $insertStmt->execute([$fullName, $email, $phone, $passwordHash, $role]);
        $userId = (int)$pdo->lastInsertId();

        $tokenPayload = [
            'user_id' => $userId,
            'email' => $email,
            'role' => $role,
            'full_name' => $fullName
        ];
        $token = SimpleJWT::generate($tokenPayload);

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Registration successful!',
            'token' => $token,
            'user' => [
                'user_id' => $userId,
                'full_name' => $fullName,
                'email' => $email,
                'phone' => $phone,
                'role' => $role
            ]
        ]);
    }

    public static function login(): void {
        $data = json_decode(file_get_contents('php://input'), true);

        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT user_id, full_name, email, phone, password, role, is_active FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
            return;
        }

        if (!(int)$user['is_active']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Your account has been deactivated. Please contact support.']);
            return;
        }

        $tokenPayload = [
            'user_id' => (int)$user['user_id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'full_name' => $user['full_name']
        ];
        $token = SimpleJWT::generate($tokenPayload);

        echo json_encode([
            'success' => true,
            'message' => 'Login successful!',
            'token' => $token,
            'user' => [
                'user_id' => (int)$user['user_id'],
                'full_name' => $user['full_name'],
                'email' => $user['email'],
                'phone' => $user['phone'],
                'role' => $user['role']
            ]
        ]);
    }

    public static function me(): void {
        $user = AuthMiddleware::requireAuth();
        echo json_encode([
            'success' => true,
            'user' => $user
        ]);
    }

    public static function forgotPassword(): void {
        $data = json_decode(file_get_contents('php://input'), true);
        $email = trim($data['email'] ?? '');

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Please provide a valid registered email address.']);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT user_id, full_name FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'No account found with this email address.']);
            return;
        }

        // Generate 6-digit code
        $code = sprintf("%06d", mt_rand(100000, 999999));

        // Delete any existing codes for this email
        $pdo->prepare('DELETE FROM password_resets WHERE email = ?')->execute([$email]);

        // Insert new reset code with 15 minute expiry calculated directly in MySQL
        $insert = $pdo->prepare('INSERT INTO password_resets (email, code, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))');
        $insert->execute([$email, $code]);

        echo json_encode([
            'success' => true,
            'message' => 'A 6-digit verification code has been issued. Use this code to reset your password.',
            'code' => $code,
            'email' => $email
        ]);
    }

    public static function resetPassword(): void {
        $data = json_decode(file_get_contents('php://input'), true);
        $email = trim($data['email'] ?? '');
        $code = trim($data['code'] ?? '');
        $newPassword = $data['new_password'] ?? '';

        if (empty($email) || empty($code) || empty($newPassword)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Email, verification code, and new password are required.']);
            return;
        }

        if (strlen($newPassword) < 6) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters long.']);
            return;
        }

        $pdo = Database::getConnection();

        // Check if code is valid and not expired
        $stmt = $pdo->prepare('SELECT id FROM password_resets WHERE email = ? AND code = ? AND expires_at >= NOW()');
        $stmt->execute([$email, $code]);
        $resetRecord = $stmt->fetch();

        if (!$resetRecord) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid or expired verification code. Please request a new one.']);
            return;
        }

        // Update user password
        $passwordHash = password_hash($newPassword, PASSWORD_BCRYPT);
        $update = $pdo->prepare('UPDATE users SET password = ? WHERE email = ?');
        $update->execute([$passwordHash, $email]);

        // Remove used reset code
        $pdo->prepare('DELETE FROM password_resets WHERE email = ?')->execute([$email]);

        echo json_encode([
            'success' => true,
            'message' => 'Password reset successful! You can now sign in with your new password.'
        ]);
    }

    public static function googleLogin(): void {
        $data = json_decode(file_get_contents('php://input'), true);
        $email = trim($data['email'] ?? '');
        $fullName = trim($data['full_name'] ?? '');
        $role = trim($data['role'] ?? 'tenant');

        if (empty($email)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Google email is required.']);
            return;
        }

        if (!in_array($role, ['tenant', 'landlord'])) {
            $role = 'tenant';
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT user_id, full_name, email, phone, role, is_active FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            // Auto-create user from Google profile
            $phone = '+254 700 000 000';
            $randomPass = bin2hex(random_bytes(16));
            $passHash = password_hash($randomPass, PASSWORD_BCRYPT);

            $insertStmt = $pdo->prepare(
                'INSERT INTO users (full_name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)'
            );
            $insertStmt->execute([$fullName ?: 'Google User', $email, $phone, $passHash, $role]);
            $userId = (int)$pdo->lastInsertId();

            $user = [
                'user_id' => $userId,
                'full_name' => $fullName ?: 'Google User',
                'email' => $email,
                'phone' => $phone,
                'role' => $role,
                'is_active' => 1
            ];
        }

        if (!(int)$user['is_active']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Your account has been deactivated. Please contact support.']);
            return;
        }

        $tokenPayload = [
            'user_id' => (int)$user['user_id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'full_name' => $user['full_name']
        ];
        $token = SimpleJWT::generate($tokenPayload);

        echo json_encode([
            'success' => true,
            'message' => 'Google authentication successful!',
            'token' => $token,
            'user' => [
                'user_id' => (int)$user['user_id'],
                'full_name' => $user['full_name'],
                'email' => $user['email'],
                'phone' => $user['phone'],
                'role' => $user['role']
            ]
        ]);
    }
}
