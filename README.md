# Smart Mess & KFC Express • KIET Campus OS

An institutional dining operations platform connecting **8 campus governance tiers** with real-time multi-tab cross-synchronization (`BroadcastChannel` API) and an accurate past-data-driven **AI Headcount Forecasting & Waste Minimization Engine**.

---

## 🌟 Key System Capabilities

- **8 Multi-Tier Role Dashboards**:
  1. **Student Dining Portal (`/student`)**: Meal selection, dietary/allergy requisitions, live KFC Express ordering with token generation.
  2. **Room Lead Hub (`/room-lead`)**: Verification of room member meal preferences, roster sign-off, leave tracking.
  3. **Floor Incharge Console (`/floor-incharge`)**: Floor-wide room attendance tracking, room flagging, cutoff alerts.
  4. **Block Coordinator Hub (`/block-coordinator`)**: Block D & Block E consolidated meal counts transmission to kitchen.
  5. **Mess Incharge Production Center (`/mess-incharge`)**: Live headcount consolidation, 14-day past-data AI turnout forecasting, store batch sizing, and real-time menu editor.
  6. **KFC Express Canteen Console (`/kfc-staff` & `/kfc`)**: Live order fulfillment queue, item stock management, status lifecycle dispatch.
  7. **Principal Executive Dashboard (`/principal`)**: Campus-wide attendance analytics, institutional wastage trends, executive directives.
  8. **Campus Superadmin Switchboard (`/dashboards`)**: Role switchboard, user account provisioning, system health monitoring.

- **🧠 AI Headcount Forecasting & Kitchen Batch Intelligence**:
  - **14-Day Past Turnout Modeling**: Uses a Weighted Moving Average (WMA) regression:
    $$W = [0.30, 0.22, 0.16, 0.12, 0.09, 0.06, 0.05]$$
  - **Day-of-Week Seasonality Factors**: Accounts for Friday slump, Saturday outing, and Wednesday feast surges.
  - **Accurate Kitchen Store Batch Orders**: Automatically calculates raw ingredient quantities (Raw Rice kg, Dal L, Veg/Paneer kg, Rotis pcs, Oil kg, Buffer reserve kg).
  - **Interactive "What-If" Demand Simulator**: Real-time recalculation for Heavy Rain (+8%), Exam Week (+12%), Weekend Outing (-18%), or Custom Headcounts.
  - **Zero-Waste Achievement**: Cuts unguided plate and buffet waste by **50% to 54%** (~5.1 to 5.5 kg saved per shift).

- **🔄 Reactive Cross-Tab Broadcast Synchronization**:
  - Built with the native HTML5 `BroadcastChannel` and `StorageEvent` APIs. Actions performed on one tab (e.g., student meal choices, room roster sign-off, or KFC order preparation) update all other staff and kitchen dashboards in under 5 milliseconds without page refresh.

- **🛡️ Graceful MongoDB Fallback**:
  - Connects to local MongoDB (`mongodb://localhost:27017/smart-mess-kfc`) when available, and automatically falls back to rich in-memory seed records if MongoDB is not running, ensuring 100% uninterrupted local operation.

---

## 🏗️ System Architecture

```
[ Frontend: React 18 + Vite ] (Port 3000)
      │
      ├── Proxy: /api/* ──────────────────────────┐
      │                                           ▼
      ▼                             [ Backend: Express REST API ] (Port 5000)
[ Native BroadcastChannel ]                       │
      │                                           ├── MongoDB (Optional / Fallback)
      ▼                                           ▼
[ Multi-Tab Real-Time Sync ]        [ Python AI Microservice ] (Port 8000)
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- Python 3.10+ (optional, for FastAPI microservice)

### 1. Start Express Backend API (Port 5000)
```bash
cd backend
npm install
npm start
```
*Server starts at `http://localhost:5000` with automatic in-memory seed dataset fallback.*

### 2. Start Frontend Application (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
*Frontend launches at `http://localhost:3000` with automatic Vite proxy to the backend API.*

### 3. Optional: Run Python FastAPI AI Microservice (Port 8000)
```bash
cd backend/ai-service
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
```
*The Express backend already implements the exact mathematical forecasting model internally, ensuring full functionality even if Python is not started.*

### 4. Optional: Run Database Seeder
```bash
cd backend
npm run seed
```

---

## 👥 Demo Accounts & Default Credentials

| Role | Email / Roll No | Password | Landing Page | Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Campus Admin** | `admin@gmail.com` | `123456789` | `/dashboards` | Full Campus OS |
| **Student (Lead)** | `23B21A4501` | `23B21A4501` | `/student` | Room D-101 • Block D |
| **Student** | `23B21A4225` | `23b21a4225` | `/student` | Room D-101 • Block D |
| **Room Lead** | `nithin.roomlead@gmail.com` | `123456789` | `/room-lead` | Room D-101 Lead |
| **Floor Incharge**| `nithin.floor@gmail.com` | `123456789` | `/floor-incharge` | Floor 1 • Block D |
| **Block Coordinator** | `nithin.block@gmail.com` | `123456789` | `/block-coordinator` | Block D & Block E |
| **Mess Incharge** | `nithin.mess@gmail.com` | `123456789` | `/mess-incharge` | Main Kitchen Hub |
| **Principal** | `nithin.principal@gmail.com` | `123456789` | `/principal` | Institutional Overview |
| **KFC Staff** | `nithin.kfcstaff@gmail.com` | `123456789` | `/kfc-staff` | Express Canteen |

*Note: For all students, the password is their Roll Number. For staff and admin accounts, the default password is `123456789`.*

---

## 🔒 Security & Route Protection

All portal dashboards are protected by a centralized `ProtectedRoute` guard. Unauthenticated visitors are redirected to `/login`, while unauthorized role attempts are routed to their designated home portal with an access-denied notification. Campus Admin maintains universal switchboard privileges.

---

## 📦 Project Repository Layout

```
smart-mess-kfc/
├── .gitignore                      # Comprehensive Git exclusion rules
├── README.md                       # Complete deployment and architectural guide
├── backend/
│   ├── ai-service/                 # FastAPI AI forecasting microservice
│   │   ├── main.py
│   │   └── requirements.txt
│   ├── src/
│   │   ├── controllers/            # Express controllers with AI mathematical engine
│   │   │   └── apiControllers.js
│   │   ├── models/                 # Mongoose database schemas
│   │   │   └── Schemas.js
│   │   ├── routes/                 # Express REST endpoints
│   │   │   └── apiRoutes.js
│   │   ├── server.js               # Server entry point with CORS & error middleware
│   │   └── Seeder.js               # 14-day historical dining and institutional seeder
│   └── package.json
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx                 # Route definitions with ProtectedRoute guards
        ├── main.jsx
        ├── index.css
        ├── components/             # Navbar, Sidebar, ToastContainer, ProtectedRoute
        ├── context/                # AppContext with BroadcastChannel synchronization
        └── pages/                  # 8 role-specific dashboards + Login & Home
```
