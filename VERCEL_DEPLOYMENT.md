# 🚀 Vercel Full-Stack Deployment Guide

Deploy the **Smart Mess & KFC Institutional Campus OS** completely on **Vercel** as a unified full-stack application.

This setup hosts:
- **Frontend**: Vite + React 18 Single Page Application (SPA) served via Vercel's global Edge CDN.
- **Backend API**: Express REST API running as **Vercel Serverless Functions** (`/api/*`).
- **Mess Guide AI**: Built-in serverless assistant with live database lookups + optional Google Gemini API support (no GPU server required).
- **Scheduled Tasks**: Automated Vercel Cron job triggering weekly digests (`0 8 * * 1`).
- **Real-Time Data**: Instant cross-tab sync (`BroadcastChannel`) + 4-second reactive polling fallback.

---

## 📋 Prerequisites

1. **Vercel Account**: [Sign up on Vercel](https://vercel.com/signup) (Hobby / Free Tier works 100%).
2. **MongoDB Atlas Database** (Free M0 Cluster):
   - [MongoDB Atlas Signup](https://www.mongodb.com/cloud/atlas/register)
   - Create a free Shared Cluster (M0).
   - In **Network Access**, add `0.0.0.0/0` (Allow access from anywhere).
   - In **Database Access**, create a user and save the password.
   - Click **Connect** → **Drivers (Node.js)** → copy the connection string:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/smart-mess-kfc?retryWrites=true&w=majority
     ```

---

## ⚡ Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Import the Repository
1. Go to your [Vercel Dashboard](https://vercel.com/new).
2. Click **Add New...** → **Project**.
3. Select your GitHub repository: `https://github.com/TEAM3C4GT/Smart_Mess_Kiet`.

### Step 2: Configure Project Settings
- **Project Name**: `smart-mess-kiet` (or any custom name)
- **Framework Preset**: `Other` (or leave default; `vercel.json` configures everything)
- **Root Directory**: `./` (leave blank / root)
- **Build and Output Settings**: Automatically handled by `vercel.json`:
  - Build Command: `npm run build --workspace=frontend`
  - Output Directory: `frontend/dist`

### Step 3: Add Environment Variables
Expand **Environment Variables** in the Vercel project setup and add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/smart-mess-kfc` | Your MongoDB Atlas connection URI |
| `JWT_SECRET` | `smart_mess_jwt_secret_production_key_2026_xyz` | Random secure string (32+ chars) |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `NODE_ENV` | `production` | Production mode |
| `DNS_SERVERS` | `8.8.8.8,1.1.1.1` | Ensures Atlas `mongodb+srv://` resolves without timeout |

#### Optional Variables
| Key | Value | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | *(Your Google AI Studio API Key)* | Enables live generative LLM responses for the Mess Guide assistant directly on Vercel |
| `ALLOWED_ORIGINS` | `https://your-project.vercel.app` | Whitelist specific origin (defaults to all in serverless) |
| `SMTP_HOST` | *(e.g. `smtp.gmail.com`)* | For weekly digest emails |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | *(Your email)* | SMTP email |
| `SMTP_PASS` | *(Your app password)* | SMTP password |

### Step 4: Click Deploy!
Click **Deploy**. Vercel will install workspace dependencies, build the frontend Vite bundle, and deploy the serverless API handlers in ~1-2 minutes.

---

## 💻 Method 2: Deploy via Vercel CLI

If you prefer using the command line:

```bash
# 1. Install Vercel CLI globally
npm i -g vercel

# 2. Login to your account
vercel login

# 3. Deploy to production
vercel --prod
```

When prompted:
- **Set up and deploy?**: `y`
- **Which scope?**: *(Select your account)*
- **Link to existing project?**: `n`
- **Project name?**: `smart-mess-kiet`
- **Directory located?**: `./`

Then configure your environment variables in the Vercel dashboard or via CLI:
```bash
vercel env add MONGODB_URI production
vercel env add JWT_SECRET production
vercel env add NODE_ENV production
vercel env add DNS_SERVERS production
```

---

## 📦 Automatic Database Initialization (Seeder)

The database initializes itself **automatically**:
- On the first request to the deployed application, the serverless handler detects if the MongoDB database is empty.
- If empty, it executes an idempotent seed using the JSON records in `seed-data/` (`users.json`, `students.json`, `rooms.json`, `menus.json`, `kfc_menu.json`, `attendance.json`, `wastage.json`).
- If you ever want to re-run or inspect the seeder manually, you can use the admin endpoint:
  ```bash
  POST https://<your-project>.vercel.app/api/seeder/run
  ```

---

## 🧪 Verifying the Deployment

Once deployed, verify your application:

1. **Health Check**:
   Visit `https://<your-project>.vercel.app/health` or `https://<your-project>.vercel.app/api/health`.
   Expected response:
   ```json
   {
     "status": "OK",
     "message": "Smart Mess & KFC Express Server Running",
     "database": "Connected",
     "timestamp": "2026-10-18T..."
   }
   ```

2. **Frontend UI**:
   Open `https://<your-project>.vercel.app/` in your browser.

3. **Log in with any test account**:
   - **Student**: `student1` / `password123`
   - **Room Lead**: `roomlead1` / `password123`
   - **Floor Incharge**: `floorincharge1` / `password123`
   - **Block Coordinator**: `blockcoordinator1` / `password123`
   - **Mess Incharge**: `messincharge` / `password123`
   - **KFC Staff**: `kfcstaff` / `password123`
   - **Principal**: `principal` / `password123`
   - **Campus Admin**: `admin` / `password123`

---

## 🛠️ Architecture Highlights on Vercel

```
[ Incoming User Request ]
         │
         ▼
[ Vercel Edge Network ]
   ├── /api/*   ──────► [ Serverless Function: api/index.js (Express) ]
   │                             │
   │                             ├── MongoDB Atlas (M0 Cluster)
   │                             └── Built-in Mess Guide Assistant (DB + Gemini)
   │
   ├── /health  ──────► [ Express Health Handler ]
   │
   └── /*       ──────► [ Static Vite Build: frontend/dist/index.html ]
```

- **Single Domain**: No CORS hurdles. All frontend calls use relative `/api/...` paths.
- **Serverless Scaling**: Functions scale to zero when idle and auto-scale under load.
- **Zero Server Maintenance**: No background EC2 or droplet instances to maintain.
