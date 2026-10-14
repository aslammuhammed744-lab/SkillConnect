# SkillConnect India 🇮🇳
### Skill Exchange & Local Service Provider Platform

A complete web application connecting skilled local professionals and customers across India for both monetary bookings and direct skill-for-skill (barter) exchanges.

---

## 🚀 How to Run the Application

You can run this project in any of the following ways:

### Option 1: Using npm (Recommended)
Open your terminal in this folder and run:
```bash
npm run dev
```
or
```bash
npm start
```
Then open [http://localhost:8080](http://localhost:8080) in your web browser.

### Option 2: Using Python directly
```bash
python3 -m http.server 8080
```
Then visit [http://localhost:8080](http://localhost:8080).

### Option 3: Direct Browser Access
Double-click `index.html` to open it in Chrome, Safari, Edge, or Brave.

---

## 🔐 Default Login Credentials

### 1. Platform Administrator
- **Name:** Afsal Haneef
- **ID:** `ADM-001`
- **Email:** `admin@skillconnect.in`
- **Password:** `Admin@2026`
- **Permissions:** Full control, user & worker oversight, platform metrics, booking audits.

---

### 2. Customer / Client
- **Name:** Rahul Verma
- **ID:** `USR-001`
- **Email:** `user@skillconnect.in`
- **Password:** `User@2026`
- **Permissions:** Book services, propose barter skill exchanges, track real-time booking status, rate workers.

---

### 3. Service Providers / Workers (10 Verified Workers)
Every worker has an isolated inbox and receives only requests & notifications targeted specifically to them:

| Worker Name | Worker ID | Email | Password | Primary Skill | Hourly Rate |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Rajesh Sharma** | `WRK-101` | `rajesh@skillconnect.in` | `Rajesh@101` | Electrical Repairs | ₹350/hr |
| **Anita Deshmukh** | `WRK-102` | `anita@skillconnect.in` | `Anita@102` | Plumbing & Fitting | ₹300/hr |
| **Vikram Singh** | `WRK-103` | `vikram@skillconnect.in` | `Vikram@103` | Carpentry & Furniture | ₹400/hr |
| **Sunita Patel** | `WRK-104` | `sunita@skillconnect.in` | `Sunita@104` | Home Deep Cleaning | ₹250/hr |
| **Mohammed Tariq**| `WRK-105` | `tariq@skillconnect.in` | `Tariq@105` | AC & Appliance Tech | ₹450/hr |
| **Priya Nair** | `WRK-106` | `priya@skillconnect.in` | `Priya@106` | Painting & Decor | ₹350/hr |
| **Amitabh Ghosh** | `WRK-107` | `amitabh@skillconnect.in` | `Amitabh@107` | Masonry & Construction | ₹500/hr |
| **Deepa Sundaram**| `WRK-108` | `deepa@skillconnect.in` | `Deepa@108` | Landscaping & Gardening| ₹300/hr |
| **Karan Malhotra**| `WRK-109` | `karan@skillconnect.in` | `Karan@109` | Pest Control Expert | ₹400/hr |
| **Sneha Joshi** | `WRK-110` | `sneha@skillconnect.in` | `Sneha@110` | Roofing & Waterproofing| ₹450/hr |

---

## 🌟 Key Platform Features

1. **Targeted Request Isolation**:
   - Customer requests and notifications route **only** to the specific worker selected.
   - Other workers' inboxes and notification bells remain clean and private.

2. **Dual Booking Engine**:
   - **Monetary Services**: Pay-per-service with transparent hourly rates and clear invoicing.
   - **Barter Skill Exchange**: Direct exchange of skills (e.g., offer Web Design in exchange for Electrical Wiring) without cash exchange.

3. **Interactive Geo-Location Map**:
   - Leaflet.js-powered real-time interactive worker map pins with distance filtering and direct booking modals.

4. **Dedicated Portals**:
   - **Customer Portal**: Search, filter, book, propose barter, track booking statuses (`Pending`, `Accepted`, `In Progress`, `Completed`).
   - **Worker Portal**: Review private incoming leads, accept/decline jobs, manage schedule and earnings.
   - **Admin Portal**: Platform statistics, dispute management, user directory, system health.

5. **Aesthetic White Theme**:
   - Minimalist obsidian black and clean white design with high contrast, glassmorphism badges, and fluid responsive layouts.

---

## 📁 Project Structure

```
SkillConnect/
├── index.html        # Main HTML layout & application shell
├── styles.css        # Complete White Theme responsive styling
├── app.js            # Core interactive application logic & state machine
├── data.js           # Seed data (workers, users, admin, bookings, reviews)
├── diagrams.js       # System flow specifications & architecture specs
├── package.json      # Node/npm scripts configuration
├── README.md         # Documentation & guide
└── assets/           # High-resolution media assets
    ├── barter.png    # Barter skill exchange banner
    ├── hero.png      # Platform hero banner
    └── map_bg.png    # Map interface background
```
