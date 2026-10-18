# Deploying Smart Mess & KFC on Render

This guide walks you through deploying the **Smart Mess & KFC** platform on [Render](https://render.com) using free-tier services.

---

## 📋 Architectural Overview on Render

| Service Component | Render Service Type | Root Directory | Build Command | Start / Publish | Free Tier Plan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend API + Socket.IO** | Web Service | `backend` | `npm install` | `npm start` | Free (`plan: free`) |
| **Frontend Web App** | Static Site | `frontend` | `npm install && npm run build` | `dist` | Free |
| **Database** | MongoDB Atlas (External) | — | — | — | Free (M0 Sandbox) |
| **AI Microservice (Optional)** | Web Service (Docker) | `backend/ai-service` | Docker build | `uvicorn main:app` | Standard (Paid) |

> [!NOTE]
> The Express backend includes built-in implementations of the AI Headcount Forecasting (WMA regression, seasonality multipliers, and kitchen batch calculations). All **8 role portals** function completely even without the Docker AI microservice running.

---

## 🛠️ Step 1: Set Up Free MongoDB Atlas Database

Render does not offer a free managed MongoDB instance, so MongoDB Atlas (free forever M0 cluster) is used:

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new cluster (select **M0 Free**).
3. Under **Security → Database Access**:
   - Create a database user (e.g. `smartmess_admin`) and set a strong password.
   - Assign the **Read and write to any database** role.
4. Under **Security → Network Access**:
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere (`0.0.0.0/0`)** so Render's dynamic IP addresses can connect.
5. Under **Deployment → Database → Connect**:
   - Choose **Drivers** (Node.js).
   - Copy your connection string:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/smart-mess-kfc?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your database user credentials.

---

## 🚀 Step 2: Deploy to Render

You can deploy using either the **Render Blueprint (Recommended)** or **Manual Dashboard Setup**.

### Option A: Deploy via Blueprint (Fastest)

1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Blueprint**.
3. Connect your repository: `https://github.com/TEAM3C4GT/Smart_Mess_Kiet`.
4. Render will read `render.yaml` and configure both services automatically.
5. In the configuration prompt, provide the missing environment values:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `ALLOWED_ORIGINS`: Set to `https://smart-mess-frontend.onrender.com` (or your frontend site's Render URL).
   - `VITE_API_URL`: Set to `https://smart-mess-backend.onrender.com` (or your backend web service URL).
6. Click **Apply**. Render will build and deploy both services!

---

### Option B: Deploy Manually via Render Dashboard

If you prefer configuring each service step-by-step:

#### 1. Deploy the Backend Web Service

1. On the Render Dashboard, click **New +** → **Web Service**.
2. Connect the `TEAM3C4GT/Smart_Mess_Kiet` GitHub repository.
3. Configure the settings:
   - **Name**: `smart-mess-backend`
   - **Region**: Select the region closest to you (e.g., Singapore or Frankfurt).
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Expand **Advanced** and add the following **Environment Variables**:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production optimizations & security |
   | `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
   | `JWT_SECRET` | *(Click "Generate" or enter a 32+ char key)* | Used for JWT authentication tokens |
   | `JWT_EXPIRES_IN` | `7d` | Token expiry duration |
   | `DNS_SERVERS` | `8.8.8.8,1.1.1.1` | Ensures SRV DNS lookups work on cloud network |
   | `ALLOWED_ORIGINS` | `https://smart-mess-frontend.onrender.com` | Whitelist frontend domain for CORS |
5. Set **Health Check Path** to: `/health`
6. Click **Create Web Service**.
7. Note down your backend URL (e.g., `https://smart-mess-backend.onrender.com`).

---

#### 2. Deploy the Frontend Static Site

1. On the Render Dashboard, click **New +** → **Static Site**.
2. Connect the `TEAM3C4GT/Smart_Mess_Kiet` repository.
3. Configure the settings:
   - **Name**: `smart-mess-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Expand **Advanced** and add the **Environment Variable**:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://smart-mess-backend.onrender.com` | Base URL of your deployed backend |
5. Under **Redirects/Rewrites**:
   - Add a rewrite rule for React Router Single Page App:
     - **Type**: `Rewrite`
     - **Source**: `/*`
     - **Destination**: `/index.html`
6. Click **Create Static Site**.
7. Once deployed, copy your frontend URL (e.g., `https://smart-mess-frontend.onrender.com`).
8. *Note: If your frontend URL differs from what you entered in the backend's `ALLOWED_ORIGINS`, update the backend environment variable and click **Manual Deploy → Deploy latest commit**.*

---

## 🌱 Automatic Database Seeding

The server includes an **automatic seeder**:
- On initial launch, when the backend connects to MongoDB, it checks if `User` accounts exist.
- If the database is empty, it automatically runs an idempotent seed populating:
  - 40 Student accounts across 8 rooms (Blocks D & E)
  - Staff & governance accounts (Admin, Mess Incharge, KFC Staff, Principal, etc.)
  - Weekly breakfast, lunch, snacks, and dinner menus
  - KFC Express canteen inventory & pricing
  - 7-day historical attendance and turnout figures
- You do **not** need to run any manual database commands!

---

## 🧪 Post-Deployment Verification

### 1. Verify Backend Health
Open `https://<your-backend>.onrender.com/health` in your browser. You should receive:
```json
{
  "status": "OK",
  "message": "Smart Mess & KFC Express Server Running",
  "database": "Connected",
  "timestamp": "2026-10-18T..."
}
```

### 2. Verify Portals & Logins
Open your frontend URL (`https://<your-frontend>.onrender.com`) and test logging in:

| Role | Username / Identifier | Password | Destination Portal |
| :--- | :--- | :--- | :--- |
| **Campus Admin** | `admin@gmail.com` | `123456789` | `/dashboards` |
| **Student (Lead)** | `23B21A4501` | `23B21A4501` | `/student` |
| **Mess Incharge** | `nithin.mess@gmail.com` | `123456789` | `/mess-incharge` |
| **KFC Staff** | `nithin.kfcstaff@gmail.com` | `123456789` | `/kfc-staff` |

---

## ❓ Frequently Asked Questions & Troubleshooting

### Why does the free web service take ~30-50 seconds to respond on first load?
Render's free tier automatically spins down web services after 15 minutes of inactivity. When a new request arrives, Render spins the service back up ("cold start"). Subsequent requests will be near-instant.

### CORS Error in Browser Console (`Origin ... not permitted by CORS policy`)
Ensure `ALLOWED_ORIGINS` in your backend environment variables exactly matches your frontend URL (without trailing slashes), e.g.:
```text
ALLOWED_ORIGINS=https://smart-mess-frontend.onrender.com
```

### MongoDB Connection Timeout (`querySrv ECONNREFUSED` or `ETIMEDOUT`)
Ensure:
1. `0.0.0.0/0` is allowed in MongoDB Atlas Network Access.
2. `DNS_SERVERS=8.8.8.8,1.1.1.1` is configured in the backend environment variables.
3. Your database username and password in the connection string contain properly URL-encoded special characters (if any).
