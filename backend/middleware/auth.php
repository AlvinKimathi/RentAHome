<?php
// backend/middleware/auth.php
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../config/db.php';

class AuthMiddleware {
    public static function authenticate(): ?array {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (!$authHeader && isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        }

        if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return null;
        }

        $token = $matches[1];
        $payload = SimpleJWT::verify($token);

        if (!$payload || !isset($payload['user_id'])) {
            return null;
        }

        // Verify user exists and is active in DB
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT user_id, full_name, email, phone, role, is_active FROM users WHERE user_id = ?');
        $stmt->execute([$payload['user_id']]);
        $user = $stmt->fetch();

        if (!$user || !(int)$user['is_active']) {
            return null;
        }

        return $user;
    }

    public static function requireAuth(): array {
        $user = self::authenticate();
        if (!$user) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Unauthorized. Please login to continue.'
            ]);
            exit;
        }
        return $user;
    }

    public static function requireRole(array|string $roles): array {
        $user = self::requireAuth();
        $allowedRoles = is_array($roles) ? $roles : [$roles];

        if (!in_array($user['role'], $allowedRoles)) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Forbidden. You do not have permission to perform this action.'
            ]);
            exit;
        }

        return $user;
    }
}
