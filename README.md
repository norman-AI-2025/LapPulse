# LabPulse ⚡
### Automated Laboratory Space Reservation & Hardware Lending Management System
**Faculty of Computer Science & Information Technology (FCSIT), Universiti Malaya**

---

## 🏛️ System Overview
**LabPulse** is a responsive web application designed specifically for the Faculty of Computer Science & Information Technology (FCSIT) at Universiti Malaya. It modernizes computer lab reservation, physical attendance verification, and high-value hardware asset lending (such as NVIDIA Jetson Orin Nano kits and Rigol oscilloscopes).

### 🌟 Key Design & Aesthetics
- **Apple Bento Grid Layout**: Minimalist cards with rounded borders (`rounded-2xl` / `rounded-3xl`), soft ambient blur, high-contrast typography, and subtle shadows.
- **Dynamic Island / Pill Navigation**: Floating navbar featuring live active session indicators, role switcher, and quick status badges.
- **Responsive Architecture**: Fluid layout tested across mobile viewports, tablets, and desktop workstations.

---

## 👥 User Roles & Role-Based Access Control (RBAC)
Quickly toggle between preconfigured UM profiles via the navbar dropdown:

1. **Student** — *Norman Lee Weng Hong (Matric: 25005870)*
   - Browse FCSIT labs & filter by category (AI, Networking, SE, IoT).
   - Reserve 2-hour lab slots with instant concurrency conflict detection.
   - Borrow hardware dev kits with digital equipment passports.
   - View dynamic cryptographic QR passes with 6-character fallback codes (e.g. `LP-7842`).
   - Monitor the 15-minute physical check-in grace period countdown timer.
   - Join waitlists for fully booked slots.

2. **Lecturer / Supervisor** — *Prof. Madya Dr. Amir Rudin*
   - Review pending coursework & Final Year Project (FYP) high-resource reservation requests (e.g., RTX 4090 GPU nodes in Lab AI-1).
   - 1-Click "Endorse" or "Decline" with supervisor remarks.
   - Audit historical FYP endorsements.

3. **Laboratory Technical Officer (Admin)** — *En. Faizal (FCSIT Lab Admin)*
   - **Scan & Verify Station**: Camera viewfinder animation & instant 6-character code verification.
   - **Mandatory Condition Audit Checklist**:
     - `[x] Chassis & Ports Intact`
     - `[x] Accessories & Cables Included`
     - `[x] Powers on without error`
   - Real-time condition grading (`Excellent`, `Good`, `Minor Scratches`, `Needs Service`) directly updating equipment health scores.
   - Live space utilization heatmaps, peak traffic distribution (08:00 - 18:00), and incident management.

---

## 🧩 Core Functional Modules

### Module A: Smart Laboratory Space Booking & Conflict Engine
- **Concurrency Validation**: Automatically checks slot availability (`08:00 - 10:00`, `10:00 - 12:00`, etc.) and prevents double-booking of any slot marked `Approved` or `Active`.
- **Conflict Warning Banner**: Alerts users in real-time if a slot is already taken, displaying current occupant details and offering a 1-click "Join Waitlist for this Slot" option.
- **FYP Endorsement Pipeline**: High-resource facilities route directly to the academic supervisor dashboard.

### Module B: Hardware Lending & Digital Equipment Passports
- **FCSIT Hardware Vault**: Real-time stock counts for NVIDIA Jetson Orin Nano Kits, Raspberry Pi 4B Labs, Rigol DS1054Z Digital Oscilloscopes, Intel RealSense cameras, and ESP32 IoT Nodes.
- **Equipment Passports**: Detailed modal displaying Serial Numbers, Operational Health Ratings (e.g. 98%), Loan Count, Active Borrower, Maintenance Logs, and Reported Defects.
- **Turnkey FYP Bundles**: Pre-configured hardware stacks:
  - *AI Vision Edge Kit* (Jetson Orin + RealSense Cam)
  - *Smart Campus IoT Kit* (Raspberry Pi 4 + ESP32 Node)
  - *Hardware Signal Debugging Kit* (Rigol Oscilloscope + Arduino Mega Starter Pack)

### Module C: Dynamic QR Verification & Physical Condition Auditing
- **Dynamic QR Passes**: Generates cryptographic QR codes containing session metadata and a prominent 6-character alphanumeric code (`LP-XXXX`).
- **Turnstile Check-In**: Officers verify codes to transition reservations from `Approved` to `Active`.
- **Return Checklist**: Enforces mandatory physical condition checklist before hardware check-in or issuance.

### Module D: Smart Waitlist & No-Show Management
- **15-Minute Grace Period Countdown**: Active countdown watchdog. If physical QR check-in is not confirmed within 15 minutes of slot start, slots are surrendered.
- **Dynamic Reallocation**: Automatically awards forfeited slots to the #1 waitlisted candidate, generating a new pass in real time.

### Module E: Administrative Reporting & Telemetry
- Weekly booking totals, asset utilization rate (%), active loans, and maintenance alerts.
- Peak hours visual density chart across 8 AM - 6 PM traffic.
- Actionable operational table with quick filters for `Pending Approval`, `Active In-Session`, `Overdue Loans`, and `Maintenance Alerts`.

---

## 🛠️ Tech Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom Apple Bento blur & glassmorphic utilities
- **Icons**: Lucide React
- **QR Engine**: `qrcode` (Vector canvas rendering)
- **State & Persistence**: React Context API with persistent `localStorage` synchronization
- **Feedback & Polish**: Canvas Confetti celebrations & floating toast notifications

---

## 🚀 Running Locally
```bash
# 1. Install dependencies
npm install

# 2. Start Vite dev server
npm run dev

# 3. Production build
npm run build
```
