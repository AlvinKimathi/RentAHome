-- PostgreSQL Initial Seed Data
INSERT INTO users (full_name, phone, email, role, password) VALUES
('System Control Admin', '+254 700 000 001', 'admin@leon.com', 'admin', '$2y$10$O0K8fD8p95tq4K7h6jC7/OVpGqK4L2F5M0G0H0I0J0K0L0M0N0O0P'),
('Mwangi Property Holdings', '+254 712 345 678', 'landlord@leon.com', 'landlord', '$2y$10$qI0E6L3v9G7b0E2w7J1/OOj2Ua5R0U4L3Z0Y1A1B1C1D1E1F1G1H'),
('Kevin Ochieng', '+254 733 111 222', 'tenant@leon.com', 'tenant', '$2y$10$8M4c8H7p5D3k1J9x6L2/OOw3Va6S1V5M4A1Z2B2C2D2E2F2G2H2I')
ON CONFLICT (email) DO NOTHING;

-- Set realistic passwords ('admin123', 'landlord123', 'tenant123')
UPDATE users SET password = '$2y$10$yiUOv0AFCzKmFCvE64FABe78WT5TxBPeuDYZfY3E5zV8C16opw6P.' WHERE email = 'admin@leon.com';
UPDATE users SET password = '$2y$10$GSLFR5sWD2fcM7f5vBMl1OuWhl08vnW89F5wwMCabOzJiTmJ9G3/2' WHERE email = 'landlord@leon.com';
UPDATE users SET password = '$2y$10$BamPgW3NSWanAP1JMtrWcu8pTb7EXuUNfQoVhu9B8Aqj49MFBK.Zi' WHERE email = 'tenant@leon.com';

-- Insert Initial Sample Houses
INSERT INTO houses (landlord_id, title, location, house_type, rent, deposit, description, amenities, status, approval_status, beds, baths, parking)
SELECT user_id, 'Modern 1 Bedroom Apartment - Ruaraka Ridge', 'Ruaraka, Thika Road, Nairobi', '1 Bedroom', 16000.00, 16000.00,
'A beautifully finished 1-bedroom apartment located in Ruaraka along Thika Road. Features ceramic tiled flooring, a spacious living room, fitted kitchen cabinets, modern shower fittings, private balcony, and constant borehole water supply. Perfect for working professionals and families.',
'High-speed WiFi, 24/7 Borehole Water, Security Guard, CCTV Surveillance, Private Balcony, Token Electricity, Garbage Collection',
'Vacant', 'approved', 1, 1, 1
FROM users WHERE email = 'landlord@leon.com'
AND NOT EXISTS (SELECT 1 FROM houses WHERE title = 'Modern 1 Bedroom Apartment - Ruaraka Ridge');

INSERT INTO houses (landlord_id, title, location, house_type, rent, deposit, description, amenities, status, approval_status, beds, baths, parking)
SELECT user_id, 'Executive 2 Bedroom Master Ensuite', 'Roysambu, TRM Drive, Nairobi', '2 Bedroom', 28000.00, 28000.00,
'Newly built executive 2-bedroom apartment with master ensuite. Situated directly behind Thika Road Mall (TRM) with quick access to supermarkets, public transport, and entertainment hubs. Ample parking, elevator access, backup generator for common areas, and modern open-plan American kitchen.',
'Perimeter Electric Fence, 24/7 Security Guard, High-speed Fiber, Elevator, Backup Generator, Borehole Water, Parking Bay',
'Vacant', 'approved', 2, 2, 1
FROM users WHERE email = 'landlord@leon.com'
AND NOT EXISTS (SELECT 1 FROM houses WHERE title = 'Executive 2 Bedroom Master Ensuite');

INSERT INTO houses (landlord_id, title, location, house_type, rent, deposit, description, amenities, status, approval_status, beds, baths, parking)
SELECT user_id, 'Spacious Student Bedsitter - Close to Campus', 'Ngara / Parklands, Nairobi', 'Bedsitter', 9500.00, 9500.00,
'Spacious and well-lit bedsitter with personal kitchenette counter, stainless steel sink, private indoor bathroom, and pre-installed instant water heater. In a secure gated perimeter with biometric access and caretaker on site.',
'City Council Water + Overhead Tanks, Instant Shower, Token Electricity Meter, Biometric Gate, Rooftop Hanging Lines',
'Vacant', 'approved', 1, 1, 0
FROM users WHERE email = 'landlord@leon.com'
AND NOT EXISTS (SELECT 1 FROM houses WHERE title = 'Spacious Student Bedsitter - Close to Campus');

-- Images
INSERT INTO house_images (house_id, image_path, is_primary)
SELECT house_id, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80', 1
FROM houses WHERE title = 'Modern 1 Bedroom Apartment - Ruaraka Ridge'
AND NOT EXISTS (SELECT 1 FROM house_images WHERE image_path LIKE '%photo-1560448204%');

INSERT INTO house_images (house_id, image_path, is_primary)
SELECT house_id, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', 1
FROM houses WHERE title = 'Executive 2 Bedroom Master Ensuite'
AND NOT EXISTS (SELECT 1 FROM house_images WHERE image_path LIKE '%photo-1600585154%');

INSERT INTO house_images (house_id, image_path, is_primary)
SELECT house_id, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', 1
FROM houses WHERE title = 'Spacious Student Bedsitter - Close to Campus'
AND NOT EXISTS (SELECT 1 FROM house_images WHERE image_path LIKE '%photo-1513694203%');
