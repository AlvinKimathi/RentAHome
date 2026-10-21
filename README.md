# RentAHome - Rental House Vacancy Finder Management System

An end-to-end, full-stack web application built to eliminate the manual, exhausting, and expensive process of searching for rental houses by connecting prospective tenants directly with verified property owners across Kenya with zero broker markups.

---

## Key Features

### 1. Tenant Features
- **Search & Advanced Filtering:** Search by keyword, neighborhood (Ruaraka, Roysambu, Ngara, Kasarani, Kilimani, Westlands), house type (Bedsitter, Single Room, 1-Bed, 2-Bed, 3-Bed), and monthly price range (KES).
- **Comprehensive Property Pages:** High-resolution photo galleries, exact rent in KES, deposit amounts, specs (beds, baths, parking), full description, and verified amenities checklist (24/7 borehole water, tokens, security guard, WiFi).
- **Direct Landlord Contact:** Direct phone dialer and WhatsApp chat links with zero broker commission fees.
- **Viewing Scheduling:** Request inspection dates and time slots directly from the property page.
- **Tenant Dashboard:** Track submitted viewing requests and real-time landlord confirmation statuses.

### 2. Landlord Features
- **4-Step Post Vacancy Wizard:**
  1. Property Details (Title, House Type, Location, Description, Beds, Baths, Parking)
  2. Photo & Media Uploader (Drag-and-drop file upload or image URLs with live previews)
  3. Pricing & Amenities (Monthly Rent in KES, Deposit, Amenities checkboxes)
  4. Review & Instant Publication
- **Real-Time Status Management:** One-click toggle between **Vacant** and **Occupied** to keep the platform vacancy listings 100% fresh.
- **Landlord Dashboard:** Review all posted properties, track viewings, and accept or decline tenant appointment requests.

### 3. Control Panel Administrator Features
- **System Overview & Health:** Platform statistics on total properties, vacancies, occupancy rate, total landlords, tenants, and bookings.
- **Listing Moderation:** Approve, reject, or remove inappropriate property listings.
- **User Management:** View all registered accounts and activate or deactivate users.
- **Vacancy & Market Analytics:** Automated reports showing vacancy distributions and average rental prices by house type and location.

---

## Architecture & Technology Stack

- **Frontend:** React 18/19, TypeScript, Vite, Tailwind CSS v4, Lucide React (standard UI widgets, no emojis, matching the modern Figma Design System with `'Urbanist'` typography and floating blur navbar).
- **Backend:** PHP 8.2 REST API with PDO, prepared statements, and custom HMAC-SHA256 JWT authentication.
- **Database:** MariaDB / MySQL running in XAMPP (`geta_rental_db`) with relational integrity between `users`, `houses`, `house_images`, `bookings`, and `password_resets`.

---

## Default Demo Accounts

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@leon.com` | `admin123` | Control Panel: system moderation, analytics & user controls |
| **Landlord** | `landlord@leon.com` | `landlord123` | Mwangi Properties (manage listings & viewings) |
| **Tenant** | `tenant@leon.com` | `tenant123` | Kevin Ochieng (browse & book house inspections) |

*(You can also register new Tenant or Landlord accounts directly on the landing page portal).*

---

## Running the Application Locally

### 1. Database & MySQL
Ensure MariaDB/MySQL is running in XAMPP (Port 3306). Schema and seed files are located in `database/`:
- `database/schema.sql`
- `database/seed.sql`

### 2. Start the PHP Backend API
```powershell
& "C:\xampp\php\php.exe" -S 127.0.0.1:8000 -t "c:\Users\Admin\OneDrive\Desktop\Projects\Geta\backend\public"
```

### 3. Start the Frontend Application
```powershell
cd frontend
npm run dev -- --host
```
Open **`http://localhost:3000/`** in your browser.
