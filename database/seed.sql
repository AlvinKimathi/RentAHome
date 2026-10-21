-- ====================================================================
-- Rental House Vacancy Finder Management System Seed Data
-- ====================================================================

USE `geta_rental_db`;

-- 1. Insert Users
-- Passwords:
-- admin@leon.com -> admin123
-- landlord@leon.com -> landlord123
-- sarah.landlord@geta.com -> landlord123
-- tenant@leon.com -> tenant123
-- mary.tenant@geta.com -> tenant123

INSERT INTO `users` (`user_id`, `full_name`, `phone`, `email`, `role`, `password`) VALUES
(1, 'Leon Whitaker (Admin)', '+254 700 123 456', 'admin@leon.com', 'admin', '$2y$10$yiUOv0AFCzKmFCvE64FABe78WT5TxBPeuDYZfY3E5zV8C16opw6P.'),
(2, 'Mwangi Property Holdings', '+254 712 345 678', 'landlord@leon.com', 'landlord', '$2y$10$GSLFR5sWD2fcM7f5vBMl1OuWhl08vnW89F5wwMCabOzJiTmJ9G3/2'),
(3, 'Sarah Kamau Properties', '+254 722 987 654', 'sarah.landlord@geta.com', 'landlord', '$2y$10$GSLFR5sWD2fcM7f5vBMl1OuWhl08vnW89F5wwMCabOzJiTmJ9G3/2'),
(4, 'Kevin Ochieng', '+254 733 456 789', 'tenant@leon.com', 'tenant', '$2y$10$BamPgW3NSWanAP1JMtrWcu8pTb7EXuUNfQoVhu9B8Aqj49MFBK.Zi'),
(5, 'Mary Wanjiku', '+254 744 567 890', 'mary.tenant@geta.com', 'tenant', '$2y$10$BamPgW3NSWanAP1JMtrWcu8pTb7EXuUNfQoVhu9B8Aqj49MFBK.Zi');

-- 2. Insert Houses
INSERT INTO `houses` (`house_id`, `landlord_id`, `title`, `location`, `house_type`, `rent`, `deposit`, `description`, `amenities`, `status`, `approval_status`, `beds`, `baths`, `parking`) VALUES
(1, 2, 'Modern 1 Bedroom Apartment - Near KCA University', 'Ruaraka, Thika Road, Nairobi', '1 Bedroom', 16000.00, 16000.00, 
 'A beautifully finished 1-bedroom apartment located 5 minutes walking distance from KCA University Main Campus. Features ceramic tiled flooring, a spacious living room, fitted kitchen cabinets, modern shower fittings, private balcony, and constant borehole water supply. Perfect for university faculty, working professionals, and mature students.', 
 'High-speed WiFi, 24/7 Borehole Water, Security Guard, CCTV Surveillance, Private Balcony, Token Electricity, Garbage Collection', 
 'Vacant', 'approved', 1, 1, 1),

(2, 2, 'Executive 2 Bedroom Master Ensuite', 'Roysambu, TRM Drive, Nairobi', '2 Bedroom', 28000.00, 28000.00,
 'Newly built executive 2-bedroom apartment with master ensuite. Situated directly behind Thika Road Mall (TRM) with quick access to supermarkets, public transport, and entertainment hubs. Ample parking, elevator access, backup generator for common areas, and modern open-plan American kitchen.',
 'Perimeter Electric Fence, 24/7 Security Guard, High-speed Fiber, Elevator, Backup Generator, Borehole Water, Parking Bay', 
 'Vacant', 'approved', 2, 2, 1),

(3, 3, 'Spacious Student Bedsitter - Close to Campus', 'Ngara / Parklands, Nairobi', 'Bedsitter', 9500.00, 9500.00,
 'Spacious and well-lit bedsitter with personal kitchenette counter, stainless steel sink, private indoor bathroom, and pre-installed instant water heater. In a secure gated perimeter with biometric access and caretaker on site.',
 'City Council Water + Overhead Tanks, Instant Shower, Token Electricity Meter, Biometric Gate, Rooftop Hanging Lines', 
 'Vacant', 'approved', 1, 1, 0),

(4, 3, 'Luxury 3 Bedroom Maisonette with Garden', 'Kilimani, Argwings Kodhek, Nairobi', '3 Bedroom', 65000.00, 65000.00,
 'Stunning 3-bedroom luxury townhouse located in a prestigious gated community in Kilimani. Features polished hardwood floors, expansive master bedroom with walk-in closet, private garden, detached servant quarters (DSQ), and solar water heating.',
 'Private Garden, Swimming Pool Access, Gym, Solar Water Heating, 24/7 Intercom & Security, Dedicated Parking for 2 Cars, High-speed Fiber', 
 'Vacant', 'approved', 3, 3, 2),

(5, 2, 'Affordable Single Room - Clean & Secure', 'Kasarani, Clay City, Nairobi', 'Single Room', 5500.00, 5500.00,
 'Clean, newly painted single room in a secure compound along Kasarani-Mwiki Road. Clean communal tiled washrooms maintained daily, concrete compound, lockable metal gate, and reliable water supply with large reservoir storage.',
 'Tiled Flooring, 24/7 Water Reservoir, Perimeter Wall with Razor Wire, Caretaker on Premises', 
 'Vacant', 'approved', 1, 1, 0),

(6, 3, 'Contemporary Urban Studio Bedsitter', 'Westlands, Muthithi Road, Nairobi', 'Bedsitter', 18000.00, 18000.00,
 'High-end furnished studio bedsitter in the heart of Westlands. Features minimalist concrete aesthetic, soundproof windows, high ceilings, custom cabinetry, and panoramic city views.',
 'Keycard Access, High-speed Fiber WiFi, Rooftop Terrace, CCTV, Elevator, Full Backup Generator', 
 'Occupied', 'approved', 1, 1, 1);

-- 3. Insert House Images
INSERT INTO `house_images` (`image_id`, `house_id`, `image_path`, `is_primary`) VALUES
(1, 1, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80', 1),
(2, 1, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', 0),
(3, 1, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', 0),

(4, 2, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', 1),
(5, 2, 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80', 0),
(6, 2, 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=80', 0),

(7, 3, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', 1),
(8, 3, 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80', 0),

(9, 4, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', 1),
(10, 4, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', 0),
(11, 4, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80', 0),

(12, 5, 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80', 1),
(13, 5, 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80', 0),

(14, 6, 'https://images.unsplash.com/photo-1502005229762-ae1b466420f9?auto=format&fit=crop&w=1200&q=80', 1),
(15, 6, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80', 0);

-- 4. Insert Bookings / Viewing Requests
INSERT INTO `bookings` (`booking_id`, `house_id`, `tenant_id`, `booking_date`, `booking_time`, `message`, `status`) VALUES
(1, 1, 4, '2026-10-25', '10:00 AM', 'Hello, I am a student at KCA University looking to move in by November 1st. I would like to view the 1-bedroom apartment.', 'confirmed'),
(2, 2, 4, '2026-10-26', '02:30 PM', 'Interested in checking out the parking space and security arrangement for this 2-bedroom property.', 'pending'),
(3, 3, 5, '2026-10-27', '11:00 AM', 'Inquiring if water is available continuously throughout the week. Would love to inspect tomorrow.', 'pending');
