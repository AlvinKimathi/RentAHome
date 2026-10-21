<?php
// backend/controllers/AdminController.php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';

class AdminController {
    public static function stats(): void {
        AuthMiddleware::requireRole('admin');
        $pdo = Database::getConnection();

        // Total Houses count
        $totalHouses = (int)$pdo->query("SELECT COUNT(*) FROM houses")->fetchColumn();
        $vacantHouses = (int)$pdo->query("SELECT COUNT(*) FROM houses WHERE status = 'Vacant'")->fetchColumn();
        $occupiedHouses = (int)$pdo->query("SELECT COUNT(*) FROM houses WHERE status = 'Occupied'")->fetchColumn();
        $pendingApprovals = (int)$pdo->query("SELECT COUNT(*) FROM houses WHERE approval_status = 'pending'")->fetchColumn();

        // Users count
        $totalUsers = (int)$pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
        $landlordsCount = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'landlord'")->fetchColumn();
        $tenantsCount = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'tenant'")->fetchColumn();

        // Bookings count
        $totalBookings = (int)$pdo->query("SELECT COUNT(*) FROM bookings")->fetchColumn();
        $pendingBookings = (int)$pdo->query("SELECT COUNT(*) FROM bookings WHERE status = 'pending'")->fetchColumn();
        $confirmedBookings = (int)$pdo->query("SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'")->fetchColumn();

        echo json_encode([
            'success' => true,
            'data' => [
                'houses' => [
                    'total' => $totalHouses,
                    'vacant' => $vacantHouses,
                    'occupied' => $occupiedHouses,
                    'pending_approvals' => $pendingApprovals
                ],
                'users' => [
                    'total' => $totalUsers,
                    'landlords' => $landlordsCount,
                    'tenants' => $tenantsCount
                ],
                'bookings' => [
                    'total' => $totalBookings,
                    'pending' => $pendingBookings,
                    'confirmed' => $confirmedBookings
                ]
            ]
        ]);
    }

    public static function listings(): void {
        AuthMiddleware::requireRole('admin');
        $pdo = Database::getConnection();

        $sql = "
            SELECT 
                h.*,
                u.full_name AS landlord_name, u.phone AS landlord_phone, u.email AS landlord_email,
                (SELECT image_path FROM house_images WHERE house_id = h.house_id ORDER BY is_primary DESC, image_id ASC LIMIT 1) AS primary_image,
                (SELECT COUNT(*) FROM bookings WHERE house_id = h.house_id) AS total_bookings
            FROM houses h
            JOIN users u ON h.landlord_id = u.user_id
            ORDER BY h.date_posted DESC
        ";
        $listings = $pdo->query($sql)->fetchAll();

        echo json_encode([
            'success' => true,
            'count' => count($listings),
            'data' => $listings
        ]);
    }

    public static function moderateListing(int $id): void {
        AuthMiddleware::requireRole('admin');
        $pdo = Database::getConnection();

        $data = json_decode(file_get_contents('php://input'), true);
        $approvalStatus = trim($data['approval_status'] ?? '');

        if (!in_array($approvalStatus, ['approved', 'pending', 'rejected'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid approval status.']);
            return;
        }

        $stmt = $pdo->prepare('UPDATE houses SET approval_status = ? WHERE house_id = ?');
        $stmt->execute([$approvalStatus, $id]);

        echo json_encode([
            'success' => true,
            'message' => "Listing approval status updated to {$approvalStatus}."
        ]);
    }

    public static function users(): void {
        AuthMiddleware::requireRole('admin');
        $pdo = Database::getConnection();

        $sql = "
            SELECT 
                user_id, full_name, phone, email, role, is_active, created_at,
                (SELECT COUNT(*) FROM houses WHERE landlord_id = users.user_id) AS properties_posted,
                (SELECT COUNT(*) FROM bookings WHERE tenant_id = users.user_id) AS bookings_made
            FROM users
            ORDER BY created_at DESC
        ";
        $users = $pdo->query($sql)->fetchAll();

        echo json_encode([
            'success' => true,
            'count' => count($users),
            'data' => $users
        ]);
    }

    public static function toggleUser(int $id): void {
        AuthMiddleware::requireRole('admin');
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare('SELECT is_active FROM users WHERE user_id = ?');
        $stmt->execute([$id]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'User not found.']);
            return;
        }

        $newActive = ((int)$user['is_active'] === 1) ? 0 : 1;
        $update = $pdo->prepare('UPDATE users SET is_active = ? WHERE user_id = ?');
        $update->execute([$newActive, $id]);

        echo json_encode([
            'success' => true,
            'message' => 'User status updated successfully.',
            'is_active' => $newActive
        ]);
    }

    public static function reports(): void {
        AuthMiddleware::requireRole('admin');
        $pdo = Database::getConnection();

        // Vacancy breakdown by House Type
        $byType = $pdo->query("
            SELECT house_type, 
                   COUNT(*) AS total,
                   SUM(CASE WHEN status = 'Vacant' THEN 1 ELSE 0 END) AS vacant_count,
                   SUM(CASE WHEN status = 'Occupied' THEN 1 ELSE 0 END) AS occupied_count,
                   ROUND(AVG(rent), 2) AS average_rent
            FROM houses
            GROUP BY house_type
        ")->fetchAll();

        // Vacancy breakdown by Location
        $byLocation = $pdo->query("
            SELECT location,
                   COUNT(*) AS total,
                   SUM(CASE WHEN status = 'Vacant' THEN 1 ELSE 0 END) AS vacant_count,
                   SUM(CASE WHEN status = 'Occupied' THEN 1 ELSE 0 END) AS occupied_count,
                   ROUND(AVG(rent), 2) AS average_rent
            FROM houses
            GROUP BY location
            ORDER BY total DESC
            LIMIT 10
        ")->fetchAll();

        echo json_encode([
            'success' => true,
            'data' => [
                'by_type' => $byType,
                'by_location' => $byLocation
            ]
        ]);
    }
}
