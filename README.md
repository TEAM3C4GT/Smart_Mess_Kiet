# Smart Mess Kiet • KIET Campus OS

An institutional dining operations platform connecting **8 campus governance tiers** with real-time cross-tab synchronization, a JWT-secured REST API, an LLM-powered **"Mess Guide"** assistant, and a past-data-driven **AI Headcount Forecasting & Waste Minimization Engine**.

---

## 🌟 Key System Capabilities

- **8 Multi-Tier Role Dashboards**:
  1. **Student Dining Portal (`/student`)**: Meal opt-in/opt-out with cutoff countdown & AI-suggested defaults, live KFC Express ordering with token tracking, meal history, alerts.
  2. **Room Lead Hub (`/room-lead`)**: Roommate roster, per-meal Eat/Skip toggles, leave marking, time-bounded proxy editing window, kitchen requisition upload.
  3. **Floor Incharge Console (`/floor-incharge`)**: Floor-wide room monitoring, flag rooms, low-participation view, transmit meal sheets to the mess kitchen.
  4. **Block Coordinator Hub (`/block-coordinator`)**: Block D & E consolidation, submission charts, floor/room-lead oversight, send consolidated counts to the mess.
  5. **Mess Incharge Production Center (`/mess-incharge`)**: Locked headcounts vs AI-predicted turnout, "quantity to cook" ingredient planning, menu editor, actual attendance recording, anomaly alerts.
  6. **KFC Express Canteen Console (`/kfc-staff` & `/kfc`)**: Live order queue, preparing/ready queues, menu & stock counters, sales summary, order history.
  7. **Principal Executive Dashboard (`/principal`)**: Read-only campus analytics, wastage trends, turnout heatmap, KFC footfall, anomaly/escalation log, CSV export.
  8. **Campus Superadmin Switchboard (`/dashboards`)**: Role switchboard + user account provisioning and system health monitoring.

- **🧠 AI Headcount Forecasting & Kitchen Batch Intelligence**:
  - **7-Day Weighted Moving Average (WMA)** regression over recent turnout, blended with the current selection count.
    $$W = [0.05, 0.06, 0.09, 0.12, 0.16, 0.22, 0.30] \quad (\text{oldest} \to \text{newest})$$
  - **Day-of-Week Seasonality Factors**: accounts for Friday slump, Saturday outing, and Wednesday feast surges.
  - **Scenario Simulation**: applies multipliers for Heavy Rain (+8%), Exam Week (+12%), Weekend Outing (−18%), Festival Feast (+15%), or a custom headcount.
  - **Kitchen Batch Sizing**: converts the buffer-adjusted prep target into raw ingredient quantities (Raw Rice kg, Dal L, Veg/Paneer kg, Rotis pcs, Oil/Spices kg, Buffer reserve kg).
  - **Wastage Minimization**: compares static over-preparation against AI-guided prep to report kg saved, ₹ saved, and % waste reduction.
  - **Confidence Scoring**: MAPE-derived confidence with a symmetric confidence interval.

- **💬 Mess Guide — RAG + LLM Assistant**:
  - Floating assistant on every dashboard (hidden on `/login`), **scope-aware** across 9 contexts (home, student, room-lead, floor-incharge, block-coordinator, mess, principal, kfc, admin).
  - Retrieval-augmented generation (MiniLM embeddings over project docs + schemas) feeding a fine-tuned **Qwen2.5-1.5B-Instruct** model served via **llama.cpp (GGUF)** or **Ollama**.
  - **14 tool-calls**: read tools (menu, forecast, historical, anomalies, wastage, KFC menu/orders, headcount, block performance, principal analytics) execute server-side with the caller's JWT; write tools (`set_meal_selection`, `place_kfc_order`, `cancel_kfc_order`) and `navigate` return **pending actions** the client confirms.

- **🔄 Multi-Layer Reactive Synchronization**:
  1. **Socket.IO `data:changed`** — the server broadcasts after every successful mutating REST call (via audit middleware); clients throttle-refresh all feeds.
  2. **4-second polling fallback** — keeps dashboards fresh even if the socket drops.
  3. **HTML5 `BroadcastChannel` + `storage`/`focus` events** — instant same-origin cross-tab sync of KFC orders, menus, notifications, rosters, and flags.

- **🛡️ Security, Audit & Resilience**:
  - **JWT (HS256) Bearer auth** with bcrypt password hashing, role-based access control, and per-record student-ownership guards.
  - **Immutable audit ledger** — every state-changing request is recorded (actor, method, path, status, IP, sanitized body); update/delete on audit logs is hard-blocked.
  - **Rate limiting** on login and chat endpoints; whitelisted CORS.
  - **Graceful degradation** — the server boots even if MongoDB is unreachable, and several read endpoints return sensible defaults when collections are empty.

---

## 🏗️ System Architecture

```
[ Frontend: React 18 + Vite + Tailwind v4 ]  (Port 3000)
      │
      ├── /api/*  ───────────────────────────┐
      ├── /socket.io (WebSocket) ────────┐    │
      ▼                                  │    ▼
[ BroadcastChannel / Storage (cross-tab) ]  [ Backend: Express + Socket.IO ] (Port 5000)
                                             │   ├── JWT Auth + RBAC + Audit Ledger
                                             │   ├── MongoDB (Mongoose)
                                             │   ├── Weekly Digest (node-cron + nodemailer)
                                             │   └── Chat proxy ──► [ FastAPI AI Service ] (Port 8000)
                                             │                        ├── Forecast Engine (WMA)
                                             │                        └── Mess Guide (RAG + LLM + tools)
                                             └──► MongoDB (Atlas / local)
```

- **Frontend → Backend**: relative `/api` calls proxied by Vite (dev) or `VITE_API_URL` (prod); Socket.IO for live updates.
- **Backend → AI Service**: `POST /api/chat` proxies to `${AI_SERVICE_URL}/chat`; confirmed writes execute back inside Express using the shared `tools_schema.json`.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+) and npm (v9+)
- MongoDB (local `mongodb://localhost:27017/smart-mess-kfc` or an Atlas URI)
- Python 3.10+ (optional, for the FastAPI AI microservice)

### 1. Start Express Backend API (Port 5000)
```bash
cd backend
npm install
cp .env.example .env      # then set MONGODB_URI + JWT_SECRET
npm run seed              # load demo data from ../seed-data
npm start                 # or: npm run dev  (node --watch)
```
*Server starts at `http://localhost:5000`; health check at `/health`.*

### 2. Start Frontend Application (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
*Frontend launches at `http://localhost:3000` with automatic Vite proxy to the backend API and Socket.IO.*

### 3. Optional: Run the FastAPI AI Microservice (Port 8000)
```bash
cd backend/ai-service
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
```
*Serves the headcount forecast engine and the Mess Guide (`/chat`). The Express backend mirrors the forecasting math internally, so predictive endpoints still respond if Python is offline — but the Mess Guide chat requires this service.*

### 4. Optional: Build Frontend for Production
```bash
cd frontend
npm run build
```

---

## ☁️ Cloud Deployment Options

### ⚡ Option A: Everything on Vercel (Recommended)
You can deploy the entire platform — frontend, serverless REST API, AI guide assistant, and automated cron jobs — **100% on Vercel**:
- Unified repository setup (single Vercel project)
- Auto-routing: `/api/*` to Express serverless function, all other routes to React SPA
- Automatic MongoDB database seeding on first boot
- No CORS configuration or domain mismatch

👉 **Read the complete guide in [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)**.

### 🐳 Option B: Render Blueprint Deployment
Deploy via Docker and persistent web services on Render.
👉 **Read the guide in [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)**.

---

## 👥 Demo Accounts & Default Credentials

**Students** log in with their **roll number** (as both identifier and password). **Staff/Admin** use the default password `123456789`.

| Role | Email / Roll No | Password | Landing Page | Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Campus Admin** | `admin@gmail.com` | `123456789` | `/dashboards` | Full Campus OS |
| **Student (Lead)** | `23B21A4501` | `23B21A4501` | `/student` | Room D-101 • Block D |
| **Student** | `23B21A4225` | `23B21A4225` | `/student` | Room D-101 • Block D |
| **Room Lead** | `nithin.roomlead@gmail.com` | `123456789` | `/room-lead` | Room D-101 Lead |
| **Floor Incharge** | `nithin.floor@gmail.com` | `123456789` | `/floor-incharge` | Floor 1 • Block D |
| **Block Coordinator** | `nithin.block@gmail.com` | `123456789` | `/block-coordinator` | Block D & Block E |
| **Mess Incharge** | `nithin.mess@gmail.com` | `123456789` | `/mess-incharge` | Main Kitchen Hub |
| **Principal** | `nithin.principal@gmail.com` | `123456789` | `/principal` | Institutional Overview |
| **KFC Staff** | `nithin.kfcstaff@gmail.com` | `123456789` | `/kfc-staff` | Express Canteen |

*Note: the seed data contains 40 students across 8 rooms (Blocks D & E) plus additional room-lead, floor-incharge, and block-coordinator accounts. Login also accepts convenience shorthands (e.g. `admin`, `kfc`, `d101`).*

---

## 🔒 Security & Route Protection

- **Backend**: stateless JWT (HS256) verification, `requireRole(...)` RBAC where `Admin` and `Principal` are universal super-roles, and `enforceStudentOwnership(...)` so students can only read/write their own records.
- **Frontend**: every portal is wrapped in a centralized `ProtectedRoute` guard. Unauthenticated visitors are redirected to `/login`; wrong-role attempts are routed to their own home portal. Tokens are stored role-scoped in `sessionStorage` and `localStorage` so multiple portal sessions can coexist.
- **Audit**: `realtimeAndAudit` middleware records every mutating request into an append-only `AuditLog` collection and triggers the Socket.IO broadcast.

---

## 📦 Project Repository Layout

```
smart-mess-kfc/
├── README.md                       # This guide
├── COMMANDS.md                      # Git / dev command cheat-sheet
├── render.yaml                      # Render Blueprint (backend + AI + static frontend)
├── seed-data/                       # JSON seed datasets (gitignored)
├── backend/
│   ├── src/
│   │   ├── server.js                # Bootstrap: CORS, health, cron digest, graceful shutdown
│   │   ├── realtime.js              # Socket.IO gateway (data:changed broadcasts)
│   │   ├── Seeder.js                # CLI seed entry (npm run seed)
│   │   ├── seederService.js         # Idempotent upsert seeder core
│   │   ├── controllers/             # apiControllers, chatController, systemControllers
│   │   ├── middleware/              # authMiddleware (JWT + RBAC), auditMiddleware
│   │   ├── models/                  # Schemas.js (15 models), AuditLog.js
│   │   ├── routes/apiRoutes.js      # All REST endpoints
│   │   └── services/digestService.js # Weekly email digest (nodemailer)
│   ├── ai-service/                  # FastAPI: forecasting engine + Mess Guide
│   │   ├── main.py                  # WMA + day-of-week + scenario forecast API
│   │   ├── chat_api.py              # /chat : RAG → LLM → tool executor
│   │   ├── llm.py                   # Ollama / llama.cpp (GGUF) backends
│   │   ├── retriever.py             # MiniLM RAG over project docs
│   │   ├── tools.py / build_index.py
│   │   ├── training/                # Unsloth QLoRA fine-tune pipeline + tools_schema.json
│   │   ├── Dockerfile / requirements.txt
│   └── package.json
└── frontend/
    ├── index.html
    ├── vite.config.js               # Dev proxy for /api and /socket.io
    ├── components.json              # shadcn/ui config
    └── src/
        ├── App.jsx                  # Routes + ProtectedRoute guards + ChatWidget
        ├── context/AppContext.jsx   # Store + API client + Socket.IO + BroadcastChannel
        ├── components/              # Navbar, Sidebar, ChatWidget, ProtectedRoute, ui/ (shadcn)
        ├── pages/                   # 9 pages (login + 8 role dashboards)
        └── lib/utils.js
```

---

## ⚙️ Environment Variables

| Variable | Service | Purpose |
| :--- | :--- | :--- |
| `PORT` | Backend | HTTP port (default `5000`) |
| `MONGODB_URI` | Backend | MongoDB connection string |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Backend | Token signing key (required in prod) and TTL (default `7d`) |
| `ALLOWED_ORIGINS` | Backend | Comma-separated CORS whitelist |
| `DNS_SERVERS` | Backend | Custom resolvers for `mongodb+srv://` SRV lookups |
| `AI_SERVICE_URL` | Backend | Base URL of the FastAPI service (default `http://localhost:8000`) |
| `DIGEST_CRON` | Backend | Weekly digest schedule (default `0 8 * * 1`) |
| `SMTP_HOST/PORT/USER/PASS`, `MAIL_FROM`, `DIGEST_TO` | Backend | Outbound email for the weekly digest (logs only if unset) |
| `VITE_API_URL` | Frontend | Backend base URL for production builds |
| `BACKEND_API_URL` | AI Service | Express API base (default `http://localhost:5000/api`) |
| `LLM_BACKEND` | AI Service | `ollama` (default) or `llamacpp` |
| `OLLAMA_URL` / `OLLAMA_MODEL` | AI Service | Ollama endpoint and model tag |
| `MODEL_PATH` / `N_CTX` / `N_GPU_LAYERS` / `MAX_TOKENS` / `TEMPERATURE` | AI Service | llama.cpp GGUF path and generation params |

---

## ⚡ Non-Functional Requirements (NFRs)

| Category | Requirement Specification | Implementation & Verification |
| :--- | :--- | :--- |
| **Performance & Latency** | Sub-100ms API response time; near-instant cross-tab synchronization. | Socket.IO push after each mutation, throttled client refresh, and native `BroadcastChannel` for zero-refresh state propagation across terminals. |
| **Scalability & Concurrency** | 2,000+ resident students, 80+ room leads, simultaneous canteen order peaks. | Modular Express controllers, indexed MongoDB collections, and lightweight in-memory rollups. |
| **High Availability & Resilience** | Continuous availability during meal rushes; graceful database tolerance. | Server boots even when MongoDB is unreachable; read endpoints fall back to sensible defaults; graceful `SIGTERM`/`SIGINT` shutdown. |
| **Data Integrity & Consistency** | Accurate kitchen inventory and order reconciliation with anti-hoarding rules. | Daily order limits, 1 active order per student, a 2-minute cancellation window with inventory restoration, and an append-only audit ledger. |
| **Usability & Clean Aesthetics** | High-contrast light theme; mobile-first responsiveness. | Tailwind CSS v4 with a curated slate/blue palette, shadcn/ui primitives, accessible controls, and stepper indicators. |
| **Security & Access Control** | Strict RBAC across 8 governance tiers; prevention of privilege escalation; traceability. | JWT HS256 + `requireRole` + `enforceStudentOwnership` middleware, rate-limited auth/chat, whitelisted CORS, and immutable audit logs. |

---

