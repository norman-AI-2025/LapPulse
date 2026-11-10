# LabPulse ⚡
### Automated Laboratory Space Reservation & Hardware Lending Management System
**Faculty of Computer Science & Information Technology (FCSIT), Universiti Malaya**

---

## 📋 Overview
**LabPulse** is a responsive web application designed specifically for the Faculty of Computer Science & Information Technology (FCSIT) at Universiti Malaya (UM). It automates and unifies laboratory space reservations, physical attendance verification via turnstiles, and high-value hardware asset lending (such as NVIDIA Jetson Orin Nano kits and Rigol oscilloscopes).

Designed with Apple-grade Bento aesthetics, real-time Concurrency Conflict Detection, live 15-minute grace period watchdog timers, and dedicated Officer Scanner Stations.

---

## 🚀 Quick Start Guide (When Pulling from GitHub)

Follow these steps to set up and run the project locally after cloning the repository.

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher (Recommended: `v20.x` LTS)
- **npm**: `v9.0.0` or higher (bundled with Node.js)
- **Git**

Verify your versions:
```bash
node -v
npm -v
```

---

### 2. Clone the Repository
```bash
git clone https://github.com/normanleewenghong/LapPulse.git
cd LapPulse
```

---

### 3. Install Dependencies
Install all required Node modules and type definitions:
```bash
npm install
```

---

### 4. Configure Environment Variables
Copy the template `.env.example` file to create your `.env`:

```bash
cp .env.example .env
```

Open `.env` in your editor and configure your Supabase project credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

> **Note:** If Supabase credentials are not provided or you are working offline, LabPulse will seamlessly fall back to client-side persistent storage (`localStorage`), allowing full offline functionality and end-to-end testing without breaking.

---

### 5. Setup Supabase Database (Optional for Cloud Sync)
If you are deploying or connecting to a live Supabase backend:

1. Log into your [Supabase Dashboard](https://supabase.com).
2. Open the **SQL Editor** tab in your project.
3. Open the [`supabase_schema.sql`](./supabase_schema.sql) file located in the project root.
4. Copy and paste the entire script into the Supabase SQL editor and run it.
5. This automatically provisions the required tables, Row-Level Security (RLS) policies, indexes, and initial FCSIT lab/hardware seeds.

---

### 6. Start the Development Server
```bash
npm run dev
```

The application will start locally at:
👉 **`http://localhost:5173/`**

---

### 7. Production Build & Verification
To test the production build locally:
```bash
# Type check and build bundle
npm run build

# Preview production build
npm run preview
```

---

## 🔑 Default Persona & Test Accounts

You can log in directly using the pre-configured FCSIT user personas:

| Role | Name | Email / Matric / Staff ID | Default Password | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Norman Lee Weng Hong | `25005870` or `norman@siswa.um.edu.my` | Any / `password123` | Book lab spaces, borrow dev kits, view QR passes, monitor 15m timer |
| **Lecturer / Supervisor** | Prof. Madya Dr. Amir Rudin | `STAFF-FCSIT` or `amirrudin@um.edu.my` | Any / `password123` | Endorse coursework & FYP high-resource requests, reserve labs |
| **Lab Technical Officer** | En. Faizal (FCSIT Lab Admin) | `OFFICER-FCSIT` or `faizal.admin@um.edu.my` | Any / `password123` | Operations Hub, Attention Queue, Scanner Station, Telemetry & Reports |

---

## 📂 Project Structure

```
LapPulse/
├── public/                 # Static assets & icons
├── src/
│   ├── components/
│   │   ├── admin/          # Officer Operations Hub & Scanner Station
│   │   ├── audit/          # System audit trail logs
│   │   ├── auth/           # Login & Registration authentication forms
│   │   ├── common/         # Reusable Bento cards, gauges, QR cards, modals
│   │   ├── hardware/       # Hardware lending vault & digital equipment passports
│   │   ├── labs/           # 23 FCSIT lab spaces & interactive timetable schedules
│   │   ├── layout/         # Dynamic Island navigation bar & breadcrumbs
│   │   ├── notifications/  # Messages & system reminders module
│   │   ├── reports/        # Equipment defect & maintenance reporting
│   │   ├── student/        # My Passes, active countdown timers, token codes
│   │   └── telemetry/      # Space utilization telemetry & analytics
│   ├── context/
│   │   └── LabPulseContext.tsx   # Centralized app state, RBAC, Supabase sync
│   ├── lib/
│   │   └── supabase.ts     # Supabase client initialization
│   ├── types/              # TypeScript interfaces for labs, loans, bookings, users
│   ├── utils/              # Audio chimes, date math, QR generator helpers
│   ├── App.tsx             # Root application view router
│   └── main.tsx            # Application entrypoint
├── supabase_schema.sql     # PostgreSQL database migration script
├── .env.example            # Environment variables template
├── package.json            # Project dependencies & build scripts
├── tailwind.config.js      # Tailwind styling & color tokens
└── vite.config.ts          # Vite build config
```

---

## 🌟 Key Workflows & Features

1. **15-Minute Check-In Watchdog Timer**:
   - When a booking's scheduled time begins, a 15-minute countdown starts automatically.
   - Staff/students must present their personal QR pass at the entrance turnstile or scanner station within 15 minutes.
   - If not scanned within the grace period, the slot is automatically cancelled and released to the waitlist candidate.

2. **Camera-Based Officer Scanner Station**:
   - Technical officers and counter turnstiles scan student/staff QR passes via web camera or manual token code entry (`LP-XXXX`).
   - Verifies check-in, check-out, hardware loan pickup, and equipment return condition inspection.

3. **Officer Operations Hub (Messages Tab)**:
   - **Immediate Attention Queue**: Filters overdue hardware, grace-expired slots, and pending approvals with 1-click notice dispatch or revocation.
   - **Reserved Spaces Directory**: Real-time view of lab occupancy and booked slots.
   - **Booked & Issued Hardware Directory**: Light-themed tracking table of all active hardware loans.
   - **Export Center**: Instant CSV export and printable operational audit reports.

---

## 🛠️ Common Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Launch local development server with Hot Module Replacement (HMR) |
| `npm run build` | Run TypeScript check (`tsc -b`) and generate optimized production bundle |
| `npm run preview` | Spin up a local server to preview the built `dist/` directory |

---

## 💡 Troubleshooting

- **Camera permissions blocked in Scanner Station**:
  Ensure your browser has granted camera access to `localhost`. If using HTTPS/deployment, camera APIs require a secure context (`https://`). Alternatively, you can type the 6-character token code (e.g., `LP-7842`) into the input box to verify passes immediately.
- **Port 5173 is already in use**:
  Run `npx kill-port 5173` or Vite will automatically increment to the next open port (e.g., `5174`).
- **Supabase credentials in `.gitignore`**:
  Your actual `.env` file containing live secrets is protected by `.gitignore` and will never be committed to source control. Always share credentials securely or provision separate staging keys.

---

## 📄 License
Developed for the **Faculty of Computer Science & Information Technology (FCSIT), Universiti Malaya**. All rights reserved.
