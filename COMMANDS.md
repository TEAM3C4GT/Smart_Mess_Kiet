# Project Command Cheat-Sheet (Smart Mess & KFC)

A quick-reference guide for all Git, Development, and Architecture commands.

---

## 1. Git Commands

### Check Repository Status
```bash
git status
```

### Stage All Tracked & New Files (Ignoring `.gitignore` entries)
```bash
git add .
```

### Commit Staged Changes
```bash
git commit -m "feat: student multi-dashboard sync, kfc order history bars, and clean gitignore"
```

### Check Commit Log
```bash
git log --oneline -n 5
```

### Push to Remote Repository
```bash
# Push to current branch (e.g. main)
git push origin main

# Or if upstream is set:
git push
```

### Create and Switch to a New Branch
```bash
git checkout -b feature/kfc-history-bar
```

---

## 2. Development Servers

### Start Frontend Dev Server (Port 3000)
```bash
cd frontend
npm run dev
```

### Start Backend Express API Server (Port 5000)
```bash
cd backend
npm run dev
```

### Build Frontend for Production
```bash
cd frontend
npm run build
```

---

## 3. Archify & Architecture Diagram Commands

### Run Archify Static Server (Port 8080)
```bash
# In project root:
powershell -Command "Start-Process powershell -ArgumentList '-NoExit', '-Command', 'npx -y serve -p 8080 archify'"
```
Open in browser: [http://localhost:8080/](http://localhost:8080/)

---

## 4. Default Portal Login Credentials

| Role | Roll Number / Email | Password | URL Path |
| :--- | :--- | :--- | :--- |
| **Student (Nithin)** | `23B21A4225` | `23B21A4225` | `/student` |
| **Student (Visalya)** | `23JN1A4543` | `23JN1A4543` | `/student` |
| **KFC Staff** | `nithin.kfcstaff@gmail.com` | `123456789` | `/kfc-staff` |
| **Room Lead** | `nithin.roomlead@gmail.com` | `123456789` | `/room-lead` |
| **Floor Incharge** | `nithin.floor@gmail.com` | `123456789` | `/floor-incharge` |
| **Mess Incharge** | `nithin.mess@gmail.com` | `123456789` | `/mess-incharge` |
| **Block Coordinator**| `nithin.block@gmail.com` | `123456789` | `/block-coordinator` |
| **Principal** | `nithin.principal@gmail.com` | `123456789` | `/principal` |
| **Campus Admin** | `admin@gmail.com` | `123456789` | `/dashboards` |
