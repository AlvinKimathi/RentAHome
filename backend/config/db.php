<?php
// backend/config/db.php

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $databaseUrl = getenv('DATABASE_URL');

            if ($databaseUrl) {
                // Production Cloud Database: Render PostgreSQL
                $db = parse_url($databaseUrl);
                $host = $db['host'] ?? '127.0.0.1';
                $port = $db['port'] ?? 5432;
                $dbName = ltrim($db['path'] ?? '', '/');
                $username = $db['user'] ?? '';
                $password = $db['pass'] ?? '';

                $dsn = "pgsql:host={$host};port={$port};dbname={$dbName};sslmode=require";
                $options = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ];

                try {
                    self::$instance = new PDO($dsn, $username, $password, $options);
                    self::ensureTablesPg(self::$instance);
                } catch (PDOException $e) {
                    http_response_code(500);
                    echo json_encode([
                        'success' => false,
                        'message' => 'PostgreSQL Database connection failed: ' . $e->getMessage()
                    ]);
                    exit;
                }
            } else {
                // Local Development Database: MySQL / MariaDB (XAMPP)
                $host = getenv('DB_HOST') ?: '127.0.0.1';
                $port = getenv('DB_PORT') ?: '3306';
                $dbName = getenv('DB_NAME') ?: 'geta_rental_db';
                $username = getenv('DB_USER') ?: 'root';
                $password = getenv('DB_PASS') ?: '';

                $dsn = "mysql:host={$host};port={$port};dbname={$dbName};charset=utf8mb4";
                $options = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ];

                try {
                    self::$instance = new PDO($dsn, $username, $password, $options);
                } catch (PDOException $e) {
                    http_response_code(500);
                    echo json_encode([
                        'success' => false,
                        'message' => 'MySQL Database connection failed: ' . $e->getMessage()
                    ]);
                    exit;
                }
            }
        }

        return self::$instance;
    }

    private static function ensureTablesPg(PDO $pdo): void {
        try {
            $check = $pdo->query("SELECT to_regclass('public.users')")->fetchColumn();
            if (!$check) {
                $schemaFile = __DIR__ . '/../../database/schema_pg.sql';
                $seedFile = __DIR__ . '/../../database/seed_pg.sql';

                if (file_exists($schemaFile)) {
                    $pdo->exec(file_get_contents($schemaFile));
                }
                if (file_exists($seedFile)) {
                    $pdo->exec(file_get_contents($seedFile));
                }
            }
        } catch (Throwable $t) {
            error_log('Database schema initialization error: ' . $t->getMessage());
        }
    }
}
