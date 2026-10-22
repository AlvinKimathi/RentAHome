<?php
// backend/controllers/HouseController.php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';

class HouseController {
    public static function index(): void {
        $pdo = Database::getConnection();

        $where = ["h.approval_status = 'approved'"];
        $params = [];

        // Filter: Status (default Vacant unless specified)
        if (isset($_GET['status']) && in_array($_GET['status'], ['Vacant', 'Occupied', 'All'])) {
            if ($_GET['status'] !== 'All') {
                $where[] = "h.status = ?";
                $params[] = $_GET['status'];
            }
        } else {
            // Default: show vacant houses as per proposal core purpose
            if (!isset($_GET['include_occupied'])) {
                $where[] = "h.status = 'Vacant'";
            }
        }

        // Filter: Location
        if (!empty($_GET['location'])) {
            $where[] = "h.location LIKE ?";
            $params[] = '%' . trim($_GET['location']) . '%';
        }

        // Filter: House Type
        if (!empty($_GET['house_type']) && $_GET['house_type'] !== 'All') {
            $where[] = "h.house_type = ?";
            $params[] = trim($_GET['house_type']);
        }

        // Filter: Min Rent
        if (!empty($_GET['min_rent'])) {
            $where[] = "h.rent >= ?";
            $params[] = (float)$_GET['min_rent'];
        }

        // Filter: Max Rent
        if (!empty($_GET['max_rent'])) {
            $where[] = "h.rent <= ?";
            $params[] = (float)$_GET['max_rent'];
        }

        // Filter: Keyword search (title, description, location)
        if (!empty($_GET['q'])) {
            $where[] = "(h.title LIKE ? OR h.description LIKE ? OR h.location LIKE ?)";
            $q = '%' . trim($_GET['q']) . '%';
            $params[] = $q;
            $params[] = $q;
            $params[] = $q;
        }

        $whereClause = implode(' AND ', $where);

        // Sorting
        $orderBy = "h.date_posted DESC";
        if (isset($_GET['sort'])) {
            switch ($_GET['sort']) {
                case 'price_asc':
                    $orderBy = "h.rent ASC";
                    break;
                case 'price_desc':
                    $orderBy = "h.rent DESC";
                    break;
                case 'oldest':
                    $orderBy = "h.date_posted ASC";
                    break;
            }
        }

        $sql = "
            SELECT 
                h.house_id, h.landlord_id, h.title, h.location, h.house_type, 
                h.rent, h.deposit, h.description, h.amenities, h.status, 
                h.approval_status, h.beds, h.baths, h.parking, h.date_posted,
                u.full_name AS landlord_name, u.phone AS landlord_phone, u.email AS landlord_email,
                (SELECT image_path FROM house_images WHERE house_id = h.house_id ORDER BY is_primary DESC, image_id ASC LIMIT 1) AS primary_image,
                (SELECT COUNT(*) FROM house_images WHERE house_id = h.house_id) AS total_images
            FROM houses h
            JOIN users u ON h.landlord_id = u.user_id
            WHERE {$whereClause}
            ORDER BY {$orderBy}
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $houses = $stmt->fetchAll();

        // Convert amenities string to clean array
        foreach ($houses as &$house) {
            $house['rent'] = (float)$house['rent'];
            $house['deposit'] = (float)$house['deposit'];
            $house['amenities_list'] = array_filter(array_map('trim', explode(',', $house['amenities'] ?? '')));
        }

        echo json_encode([
            'success' => true,
            'count' => count($houses),
            'data' => $houses
        ]);
    }

    public static function show(int $id): void {
        $pdo = Database::getConnection();

        $sql = "
            SELECT 
                h.*,
                u.full_name AS landlord_name, u.phone AS landlord_phone, u.email AS landlord_email
            FROM houses h
            JOIN users u ON h.landlord_id = u.user_id
            WHERE h.house_id = ?
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        $house = $stmt->fetch();

        if (!$house) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'House listing not found.']);
            return;
        }

        // Fetch gallery images
        $imgStmt = $pdo->prepare('SELECT image_id, image_path, is_primary FROM house_images WHERE house_id = ? ORDER BY is_primary DESC, image_id ASC');
        $imgStmt->execute([$id]);
        $house['images'] = $imgStmt->fetchAll();

        $house['rent'] = (float)$house['rent'];
        $house['deposit'] = (float)$house['deposit'];
        $house['amenities_list'] = array_filter(array_map('trim', explode(',', $house['amenities'] ?? '')));

        echo json_encode([
            'success' => true,
            'data' => $house
        ]);
    }

    public static function store(): void {
        $user = AuthMiddleware::requireRole(['landlord', 'admin']);
        $pdo = Database::getConnection();

        $data = json_decode(file_get_contents('php://input'), true);

        $title = trim($data['title'] ?? '');
        $location = trim($data['location'] ?? '');
        $houseType = trim($data['house_type'] ?? '1 Bedroom');
        $rent = (float)($data['rent'] ?? 0);
        $deposit = (float)($data['deposit'] ?? $rent);
        $description = trim($data['description'] ?? '');
        $amenities = is_array($data['amenities'] ?? null) 
            ? implode(', ', $data['amenities']) 
            : trim($data['amenities'] ?? '');
        $beds = (int)($data['beds'] ?? 1);
        $baths = (int)($data['baths'] ?? 1);
        $parking = !empty($data['parking']) ? 1 : 0;
        $images = $data['images'] ?? [];

        if (empty($title) || empty($location) || empty($description) || $rent <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Title, location, description and a valid rent price are required.']);
            return;
        }

        $stmt = $pdo->prepare("
            INSERT INTO houses (landlord_id, title, location, house_type, rent, deposit, description, amenities, beds, baths, parking, status, approval_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Vacant', 'approved')
        ");
        $stmt->execute([
            $user['user_id'], $title, $location, $houseType, $rent, $deposit, $description, $amenities, $beds, $baths, $parking
        ]);
        $houseId = (int)$pdo->lastInsertId();

        // Insert images
        if (!empty($images) && is_array($images)) {
            $imgStmt = $pdo->prepare("INSERT INTO house_images (house_id, image_path, is_primary) VALUES (?, ?, ?)");
            foreach ($images as $index => $imgPath) {
                $isPrimary = ($index === 0) ? 1 : 0;
                $imgStmt->execute([$houseId, trim($imgPath), $isPrimary]);
            }
        }

        http_response_code(201);
        if (class_exists('AdminController')) {
            AdminController::logAction(
                (int)$user['user_id'],
                $user['full_name'],
                $user['role'],
                'HOUSE_LISTED',
                "Listed new vacancy: '{$title}' in {$location} (KES " . number_format($rent, 2) . "/mo)"
            );
        }

        echo json_encode([
            'success' => true,
            'message' => 'House listed successfully!',
            'house_id' => $houseId
        ]);
    }

    public static function update(int $id): void {
        $user = AuthMiddleware::requireRole(['landlord', 'admin']);
        $pdo = Database::getConnection();

        // Ensure ownership unless admin
        $checkStmt = $pdo->prepare('SELECT landlord_id FROM houses WHERE house_id = ?');
        $checkStmt->execute([$id]);
        $existing = $checkStmt->fetch();

        if (!$existing) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Listing not found.']);
            return;
        }

        if ($user['role'] !== 'admin' && (int)$existing['landlord_id'] !== (int)$user['user_id']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Unauthorized to edit this listing.']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        $title = trim($data['title'] ?? '');
        $location = trim($data['location'] ?? '');
        $houseType = trim($data['house_type'] ?? '1 Bedroom');
        $rent = (float)($data['rent'] ?? 0);
        $deposit = (float)($data['deposit'] ?? $rent);
        $description = trim($data['description'] ?? '');
        $amenities = is_array($data['amenities'] ?? null) 
            ? implode(', ', $data['amenities']) 
            : trim($data['amenities'] ?? '');
        $beds = (int)($data['beds'] ?? 1);
        $baths = (int)($data['baths'] ?? 1);
        $parking = !empty($data['parking']) ? 1 : 0;

        $stmt = $pdo->prepare("
            UPDATE houses 
            SET title = ?, location = ?, house_type = ?, rent = ?, deposit = ?, description = ?, amenities = ?, beds = ?, baths = ?, parking = ?
            WHERE house_id = ?
        ");
        $stmt->execute([
            $title, $location, $houseType, $rent, $deposit, $description, $amenities, $beds, $baths, $parking, $id
        ]);

        // If new images provided, update
        if (isset($data['images']) && is_array($data['images']) && count($data['images']) > 0) {
            $pdo->prepare("DELETE FROM house_images WHERE house_id = ?")->execute([$id]);
            $imgStmt = $pdo->prepare("INSERT INTO house_images (house_id, image_path, is_primary) VALUES (?, ?, ?)");
            foreach ($data['images'] as $index => $imgPath) {
                $isPrimary = ($index === 0) ? 1 : 0;
                $imgStmt->execute([$id, trim($imgPath), $isPrimary]);
            }
        }

        echo json_encode(['success' => true, 'message' => 'Listing updated successfully!']);
    }

    public static function toggleStatus(int $id): void {
        $user = AuthMiddleware::requireRole(['landlord', 'admin']);
        $pdo = Database::getConnection();

        $checkStmt = $pdo->prepare('SELECT landlord_id, status FROM houses WHERE house_id = ?');
        $checkStmt->execute([$id]);
        $house = $checkStmt->fetch();

        if (!$house) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Listing not found.']);
            return;
        }

        if ($user['role'] !== 'admin' && (int)$house['landlord_id'] !== (int)$user['user_id']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Unauthorized to update this house status.']);
            return;
        }

        $newStatus = ($house['status'] === 'Vacant') ? 'Occupied' : 'Vacant';

        $stmt = $pdo->prepare('UPDATE houses SET status = ? WHERE house_id = ?');
        $stmt->execute([$newStatus, $id]);

        echo json_encode([
            'success' => true,
            'message' => "House status updated to {$newStatus}.",
            'status' => $newStatus
        ]);
    }

    public static function destroy(int $id): void {
        $user = AuthMiddleware::requireRole(['landlord', 'admin']);
        $pdo = Database::getConnection();

        $checkStmt = $pdo->prepare('SELECT landlord_id FROM houses WHERE house_id = ?');
        $checkStmt->execute([$id]);
        $house = $checkStmt->fetch();

        if (!$house) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Listing not found.']);
            return;
        }

        if ($user['role'] !== 'admin' && (int)$house['landlord_id'] !== (int)$user['user_id']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Unauthorized to delete this listing.']);
            return;
        }

        $stmt = $pdo->prepare('DELETE FROM houses WHERE house_id = ?');
        $stmt->execute([$id]);

        echo json_encode(['success' => true, 'message' => 'Listing deleted successfully.']);
    }

    public static function myListings(): void {
        $user = AuthMiddleware::requireRole(['landlord', 'admin']);
        $pdo = Database::getConnection();

        $sql = "
            SELECT 
                h.*,
                (SELECT image_path FROM house_images WHERE house_id = h.house_id ORDER BY is_primary DESC, image_id ASC LIMIT 1) AS primary_image,
                (SELECT COUNT(*) FROM house_images WHERE house_id = h.house_id) AS total_images,
                (SELECT COUNT(*) FROM bookings WHERE house_id = h.house_id) AS total_inquiries,
                (SELECT COUNT(*) FROM bookings WHERE house_id = h.house_id AND status = 'pending') AS pending_inquiries
            FROM houses h
            WHERE h.landlord_id = ?
            ORDER BY h.date_posted DESC
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user['user_id']]);
        $houses = $stmt->fetchAll();

        foreach ($houses as &$house) {
            $house['rent'] = (float)$house['rent'];
            $house['deposit'] = (float)$house['deposit'];
            $house['amenities_list'] = array_filter(array_map('trim', explode(',', $house['amenities'] ?? '')));
        }

        echo json_encode([
            'success' => true,
            'count' => count($houses),
            'data' => $houses
        ]);
    }
}
