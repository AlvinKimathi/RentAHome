<?php
// backend/controllers/BookingController.php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';

class BookingController {
    public static function store(): void {
        $user = AuthMiddleware::requireRole(['tenant', 'landlord', 'admin']);
        $pdo = Database::getConnection();

        $data = json_decode(file_get_contents('php://input'), true);

        $houseId = (int)($data['house_id'] ?? 0);
        $bookingDate = trim($data['booking_date'] ?? '');
        $bookingTime = trim($data['booking_time'] ?? '10:00 AM');
        $message = trim($data['message'] ?? '');

        if ($houseId <= 0 || empty($bookingDate)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'House ID and booking date are required.']);
            return;
        }

        // Verify house exists
        $houseStmt = $pdo->prepare('SELECT house_id, landlord_id, title FROM houses WHERE house_id = ?');
        $houseStmt->execute([$houseId]);
        $house = $houseStmt->fetch();

        if (!$house) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'House listing not found.']);
            return;
        }

        $stmt = $pdo->prepare("
            INSERT INTO bookings (house_id, tenant_id, booking_date, booking_time, message, status)
            VALUES (?, ?, ?, ?, ?, 'pending')
        ");
        $stmt->execute([$houseId, $user['user_id'], $bookingDate, $bookingTime, $message]);
        $bookingId = (int)$pdo->lastInsertId();

        if (class_exists('AdminController')) {
            AdminController::logAction(
                (int)$user['user_id'],
                $user['full_name'],
                $user['role'],
                'BOOKING_CREATED',
                "Tenant requested viewing inspection for property #{$houseId} ('{$house['title']}') on {$bookingDate} at {$bookingTime}"
            );
        }

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Viewing request submitted successfully! The landlord has been notified.',
            'booking_id' => $bookingId
        ]);
    }

    public static function tenantBookings(): void {
        $user = AuthMiddleware::requireAuth();
        $pdo = Database::getConnection();

        $sql = "
            SELECT 
                b.booking_id, b.booking_date, b.booking_time, b.message, b.status, b.created_at,
                h.house_id, h.title AS house_title, h.location AS house_location, 
                h.rent AS house_rent, h.house_type, h.status AS house_status,
                u.full_name AS landlord_name, u.phone AS landlord_phone, u.email AS landlord_email,
                (SELECT image_path FROM house_images WHERE house_id = h.house_id ORDER BY is_primary DESC, image_id ASC LIMIT 1) AS house_image
            FROM bookings b
            JOIN houses h ON b.house_id = h.house_id
            JOIN users u ON h.landlord_id = u.user_id
            WHERE b.tenant_id = ?
            ORDER BY b.created_at DESC
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user['user_id']]);
        $bookings = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'count' => count($bookings),
            'data' => $bookings
        ]);
    }

    public static function landlordBookings(): void {
        $user = AuthMiddleware::requireRole(['landlord', 'admin']);
        $pdo = Database::getConnection();

        $sql = "
            SELECT 
                b.booking_id, b.booking_date, b.booking_time, b.message, b.status, b.created_at,
                h.house_id, h.title AS house_title, h.location AS house_location, h.rent AS house_rent,
                u.user_id AS tenant_id, u.full_name AS tenant_name, u.phone AS tenant_phone, u.email AS tenant_email
            FROM bookings b
            JOIN houses h ON b.house_id = h.house_id
            JOIN users u ON b.tenant_id = u.user_id
            WHERE h.landlord_id = ?
            ORDER BY b.created_at DESC
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user['user_id']]);
        $bookings = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'count' => count($bookings),
            'data' => $bookings
        ]);
    }

    public static function updateStatus(int $id): void {
        $user = AuthMiddleware::requireRole(['landlord', 'admin']);
        $pdo = Database::getConnection();

        // Check ownership of the house for this booking
        $checkStmt = $pdo->prepare("
            SELECT b.booking_id, h.landlord_id 
            FROM bookings b 
            JOIN houses h ON b.house_id = h.house_id 
            WHERE b.booking_id = ?
        ");
        $checkStmt->execute([$id]);
        $booking = $checkStmt->fetch();

        if (!$booking) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Booking request not found.']);
            return;
        }

        if ($user['role'] !== 'admin' && (int)$booking['landlord_id'] !== (int)$user['user_id']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Unauthorized to update this booking.']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $newStatus = trim($data['status'] ?? '');

        if (!in_array($newStatus, ['pending', 'confirmed', 'declined', 'completed'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid status value.']);
            return;
        }

        $updateStmt = $pdo->prepare('UPDATE bookings SET status = ? WHERE booking_id = ?');
        $updateStmt->execute([$newStatus, $id]);

        if (class_exists('AdminController')) {
            AdminController::logAction(
                (int)$user['user_id'],
                $user['full_name'],
                $user['role'],
                'BOOKING_STATUS_CHANGED',
                "Booking inspection #{$id} status updated to '{$newStatus}'"
            );
        }

        echo json_encode([
            'success' => true,
            'message' => "Booking status updated to {$newStatus}.",
            'status' => $newStatus
        ]);
    }
}
