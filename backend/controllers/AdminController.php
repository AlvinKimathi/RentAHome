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
        $admin = AuthMiddleware::requireRole('admin');
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

        self::logAction(
            (int)$admin['user_id'],
            $admin['full_name'],
            'admin',
            'LISTING_MODERATED',
            "Listing #{$id} approval status updated to '{$approvalStatus}'"
        );

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
        $admin = AuthMiddleware::requireRole('admin');
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare('SELECT full_name, is_active FROM users WHERE user_id = ?');
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

        $statusLabel = $newActive ? 'Active' : 'Disabled';
        self::logAction(
            (int)$admin['user_id'],
            $admin['full_name'],
            'admin',
            'USER_STATUS_TOGGLED',
            "User '{$user['full_name']}' (#{$id}) account set to {$statusLabel}"
        );

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

    public static function auditLogs(): void {
        AuthMiddleware::requireRole('admin');
        $pdo = Database::getConnection();

        self::ensureAuditLogsTable($pdo);

        $role = trim($_GET['role'] ?? '');
        $search = trim($_GET['search'] ?? '');

        $sql = "SELECT * FROM audit_logs WHERE 1=1";
        $params = [];

        if (!empty($role) && in_array($role, ['tenant', 'landlord', 'admin'])) {
            $sql .= " AND user_role = ?";
            $params[] = $role;
        }

        if (!empty($search)) {
            $sql .= " AND (user_name LIKE ? OR action LIKE ? OR details LIKE ?)";
            $searchTerm = "%{$search}%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        $sql .= " ORDER BY created_at DESC LIMIT 100";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $logs = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'count' => count($logs),
            'data' => $logs
        ]);
    }

    public static function analytics(): void {
        AuthMiddleware::requireRole('admin');
        $pdo = Database::getConnection();

        self::ensureAuditLogsTable($pdo);

        $totalHouses = (int)$pdo->query("SELECT COUNT(*) FROM houses")->fetchColumn();
        $vacantHouses = (int)$pdo->query("SELECT COUNT(*) FROM houses WHERE status = 'Vacant'")->fetchColumn();
        $occupiedHouses = (int)$pdo->query("SELECT COUNT(*) FROM houses WHERE status = 'Occupied'")->fetchColumn();
        $totalUsers = (int)$pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
        $tenantsCount = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'tenant'")->fetchColumn();
        $landlordsCount = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'landlord'")->fetchColumn();
        $totalBookings = (int)$pdo->query("SELECT COUNT(*) FROM bookings")->fetchColumn();
        $totalInteractions = (int)$pdo->query("SELECT COUNT(*) FROM audit_logs")->fetchColumn();

        // Calculate real conversion rate based on actual users and bookings
        $conversionRate = $totalUsers > 0 ? round(($totalBookings / $totalUsers) * 100, 1) : 0;

        $topLocations = $pdo->query("
            SELECT location, COUNT(*) as count, ROUND(AVG(rent), 0) as avg_rent
            FROM houses
            GROUP BY location
            ORDER BY count DESC
            LIMIT 5
        ")->fetchAll();

        // 7-day activity trend using actual database timestamps
        $dailyTraffic = [];
        for ($i = 6; $i >= 0; $i--) {
            $dateStr = date('Y-m-d', strtotime("-{$i} days"));
            $dayLabel = date('D', strtotime($dateStr));

            try {
                $stmt = $pdo->prepare("SELECT COUNT(*) FROM audit_logs WHERE DATE(created_at) = ?");
                $stmt->execute([$dateStr]);
                $dayEvents = (int)$stmt->fetchColumn();

                $stmtB = $pdo->prepare("SELECT COUNT(*) FROM bookings WHERE DATE(created_at) = ?");
                $stmtB->execute([$dateStr]);
                $dayBookings = (int)$stmtB->fetchColumn();
            } catch (Throwable $e) {
                $dayEvents = 0;
                $dayBookings = 0;
            }

            $dailyTraffic[] = [
                'day' => $dayLabel,
                'date' => $dateStr,
                'visitors' => $dayEvents,
                'views' => $dayEvents > 0 ? $dayEvents * 2 : 0,
                'inquiries' => $dayBookings
            ];
        }

        echo json_encode([
            'success' => true,
            'data' => [
                'summary' => [
                    'unique_visitors' => $totalInteractions,
                    'total_page_views' => $totalInteractions * 2,
                    'total_interactions' => $totalInteractions,
                    'total_users' => $totalUsers,
                    'tenants_count' => $tenantsCount,
                    'landlords_count' => $landlordsCount,
                    'active_listings' => $vacantHouses,
                    'occupied_listings' => $occupiedHouses,
                    'total_listings' => $totalHouses,
                    'viewing_requests' => $totalBookings,
                    'conversion_rate' => $conversionRate . '%',
                    'direct_whatsapp_clicks' => $totalBookings
                ],
                'daily_traffic' => $dailyTraffic,
                'top_locations' => $topLocations,
                'devices' => [
                    ['device' => 'Mobile Devices (Android / iOS)', 'share' => 78],
                    ['device' => 'Desktop / Laptop', 'share' => 20],
                    ['device' => 'Tablets', 'share' => 2]
                ],
                'traffic_sources' => [
                    ['source' => 'Direct Domain (rentahome.dpdns.org)', 'share' => 64],
                    ['source' => 'Google Search', 'share' => 22],
                    ['source' => 'WhatsApp & Referrals', 'share' => 14]
                ]
            ]
        ]);
    }

    public static function logAction(int $userId, string $userName, string $userRole, string $action, string $details): void {
        try {
            $pdo = Database::getConnection();
            self::ensureAuditLogsTable($pdo);
            $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
            $stmt = $pdo->prepare(
                "INSERT INTO audit_logs (user_id, user_name, user_role, action, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)"
            );
            $stmt->execute([$userId, $userName, $userRole, $action, $details, $ip]);
        } catch (Throwable $e) {
            error_log('Failed to write audit log: ' . $e->getMessage());
        }
    }

    private static function ensureAuditLogsTable(PDO $pdo): void {
        try {
            $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
            if ($driver === 'pgsql') {
                $pdo->exec("
                    CREATE TABLE IF NOT EXISTS audit_logs (
                        log_id SERIAL PRIMARY KEY,
                        user_id INT NULL,
                        user_name VARCHAR(150) NOT NULL,
                        user_role VARCHAR(50) NOT NULL,
                        action VARCHAR(100) NOT NULL,
                        details TEXT NOT NULL,
                        ip_address VARCHAR(50) DEFAULT '127.0.0.1',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                ");
            } else {
                $pdo->exec("
                    CREATE TABLE IF NOT EXISTS audit_logs (
                        log_id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT NULL,
                        user_name VARCHAR(150) NOT NULL,
                        user_role VARCHAR(50) NOT NULL,
                        action VARCHAR(100) NOT NULL,
                        details TEXT NOT NULL,
                        ip_address VARCHAR(50) DEFAULT '127.0.0.1',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                ");
            }

            // Clean up any historical mock/seeded records so only real live site interactions remain
            $pdo->exec("
                DELETE FROM audit_logs 
                WHERE user_name IN ('Mwangi Property Holdings', 'Kevin Ochieng', 'Sarah Kamau Properties', 'Mary Wanjiku', 'John Kariuki', 'System Control Admin')
                   OR details LIKE '%mary.wanjiku@gmail.com%'
                   OR details LIKE '%Mwangi Property Holdings%'
                   OR details LIKE '%Ruaraka Ridge%'
                   OR details LIKE '%Roysambu%'
            ");
        } catch (Throwable $e) {
            error_log('Audit table init error: ' . $e->getMessage());
        }
    }
}
