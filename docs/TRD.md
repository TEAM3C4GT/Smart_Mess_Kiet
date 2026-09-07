# Smart Mess & KFC Management System — TRD

## 10. Technical Requirements Document — Architecture
### 10.1 Technology Stack
- **Frontend**: React 18 (Vite), shadcn/ui, Tailwind CSS, Recharts
- **State/Data**: TanStack Query, Zustand
- **Realtime**: Socket.IO
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Atlas) + Mongoose
- **AI Microservice**: Python + FastAPI, Prophet/XGBoost, scikit-learn
- **Auth**: JWT (access + refresh), bcrypt
- **Caching/Queue**: Redis
- **Media**: Cloudinary
- **Notifications**: Nodemailer (email) + Web Push / FCM
- **DevOps**: Docker, GitHub Actions, Render/Railway/Vercel

### 10.2 System Architecture Diagram
Layered architecture: client, Express API services, MongoDB, and a decoupled Python AI microservice.

### 10.3 Why a Separate AI Microservice?
Forecasting and NLP work is best done in Python's ecosystem.
- Core mess-flow works even if AI service is down.
- Models can be retrained nightly without redeploying main app.
- Separation of concerns for the team.

### 10.4 Role-Based Access Control (RBAC)
Roles: Student, Room Lead, Floor Incharge, Block Coordinator, Mess Incharge, Principal, KFC Staff, Admin.
Intermediate roles are intentionally read-only on counts.

## 11. API Design
### 11.1 Core REST Endpoints
- `POST /api/auth/login`
- `GET /api/menu/:date`
- `POST /api/selections`
- `GET /api/selections/me`
- `GET /api/aggregations/room/:roomId` (and floor/block/mess)
- `POST /api/aggregations/:id/flag`
- `POST /api/kfc/orders`
- `PATCH /api/kfc/orders/:id/status`
- `GET /api/analytics/principal`
- `GET /api/ai/forecast/:scope/:date`
- `GET /api/ai/anomalies`
- `POST /api/ai/chat`

### 11.2 Socket.IO Events
- `selection:updated`
- `aggregation:flagged`
- `kfc:orderStatus`
- `menu:published`

## 12. AI Module — Technical Design
### 12.1 Demand Forecasting Engine
- Features: historical selections, turnout, day-of-week, calendar flags, weather.
- Model: Facebook Prophet / XGBoost regressor.

### 12.2 Anomaly & Fraud Detection
Statistical z-score / IQR-based outlier detection, plus rule engine.

### 12.3 Smart Menu Recommendations
Collaborative + content-based hybrid.

### 12.4 Conversational Assistant
Lightweight intent-matching + LLM API call.

### 12.5 Wastage Impact & Gamification Score
`wastageSaved = (previousBaselineCookQty - aiSuggestedCookQty) * avgPortionCost`

## 13. Database Design & Schema
Collections:
- `Users`
- `MealSelections`
- `Aggregations`
- `MenuItems`
- `KFCOrders`
- `Feedback`
- `AIForecasts`
- `Notifications`, `AuditLogs`

MongoDB aggregation pipelines handle the roll-ups.

## 14. Dashboards & Analytics (Recharts)
- Room Lead/Floor Incharge: Radial/Progress bar, Bar chart, List.
- Mess Incharge: Grouped bar chart, Line chart, Table.
- Principal: Line chart (wastage saved), Heatmap (submission rate), Bar chart (KFC footfall), Pie/Donut (Meal-type distribution), Leaderboard table.

## 15. Security & Compliance
- JWT access tokens + HTTPOnly refresh tokens.
- RBAC middleware.
- Input validation (Zod/Joi).
- Redis-backed rate limiting.
- Audit trails in `AuditLogs`.
- HTTPS everywhere, environment variables for secrets.

## 16. Success Metrics / KPIs
- Daily submission rate > 95% before cutoff.
- Food wastage reduction ↓ 30% within 2 months.
- Forecast accuracy > 90%.
- Average KFC order-to-ready time < 5 minutes.
- Anomaly response time < 30 minutes.
- Student satisfaction > 4.0/5.

## 17. Assumptions, Constraints & Risks
- Campus Wi-Fi is reliable.
- AI forecasting needs 4-6 weeks to build accurate models.
- Graceful fallbacks configured for AI microservice downtime.

## 18. Future Enhancements
- Online/UPI payment.
- Native mobile app (React Native).
- Hostel fee billing integration.
- Voice-based chatbot (WhatsApp).
