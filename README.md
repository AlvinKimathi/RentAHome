# RentAHome - Rental House Vacancy Finder

RentAHome is a modern web platform designed to help people in Kenya find vacant rental houses quickly and easily without paying broker fees. It connects tenants directly with landlords and property managers.

Live Website: **[https://rentahome.dpdns.org](https://rentahome.dpdns.org)**  
Alternative Link: **[https://www.rentahome.dpdns.org](https://www.rentahome.dpdns.org)**

---

## What RentAHome Does

### For Tenants
- **Find Available Homes:** Search through vacant houses in Nairobi estates such as Ruaraka, Roysambu, Ngara, Kasarani, Westlands, and Kilimani.
- **Filter by Your Needs:** Filter listings by neighborhood, monthly rent, and house type (Single Rooms, Bedsitters, 1 Bedroom, 2 Bedroom, 3 Bedroom).
- **Direct Landlord Contact:** Reach landlords directly through phone calls or WhatsApp with zero middleman charges.
- **Book House Viewings:** Select a convenient date and time to visit and inspect the house in person.
- **Tenant Dashboard:** Track all your booked viewings and see whether the landlord has confirmed them.

### For Landlords
- **Post Vacancies Easily:** A simple 4-step wizard to upload photos, enter rent, describe amenities (like borehole water, security, and electricity tokens), and publish your vacant house.
- **Manage House Status:** Quickly switch houses between "Vacant" and "Occupied" so tenants only see available homes.
- **Landlord Dashboard:** Review all your properties, see incoming inspection requests from tenants, and accept or decline appointments.

### For Administrators (Control Panel)
- **Review Listings:** Approve, review, or remove property listings to ensure quality and safety.
- **Manage Users:** Monitor tenant and landlord accounts with the ability to activate or suspend profiles.
- **Audit Logs:** View a live activity history of actions taken on the site by tenants and landlords.
- **Site Analytics:** Monitor visitor numbers, popular search areas, viewing inquiries, and daily traffic.

---

## Technology Behind the Project

- **Frontend:** Built with React, TypeScript, Vite, and Tailwind CSS. Responsive for both mobile phones and desktop computers.
- **Backend:** Fast, lightweight REST API built with PHP using PDO prepared statements and secure token-based authentication.
- **Database:** Relational database supporting both PostgreSQL (on cloud hosting) and MySQL / MariaDB (for local testing).
- **Hosting:** Docker container and static hosting running on Render connected to a custom DigitalPlat domain.

---

## How to Run the Project Locally

### 1. Database Setup
Start MySQL in XAMPP. Import the initial database files found in the `database` folder:
- `database/schema.sql`
- `database/seed.sql`

### 2. Start the Backend API
Run the built-in PHP server pointing to the backend public folder:
```powershell
php -S 127.0.0.1:8000 -t backend/public
```

### 3. Start the Frontend
Open another terminal, navigate into the frontend folder, and start the development server:
```powershell
cd frontend
npm install
npm run dev
```

Open **`http://localhost:3000`** in your browser.

---

## Contact & Support
- **Support Phone & WhatsApp:** +254 718 608582
- **Website:** https://rentahome.dpdns.org
