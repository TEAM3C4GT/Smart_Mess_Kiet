# Smart Mess & KFC Management System — PRD

## 1. Executive Summary
Lateral-entry students join the college mid-course and move into semi-residential accommodation, but today their daily meal intent (whether they will eat breakfast, lunch, snacks, or dinner) is captured informally — by word of mouth, WhatsApp groups, or paper registers. This causes over-cooking, under-cooking, long queues, and no visibility for the Principal into mess efficiency or cost.

This project delivers a web application where every student selects tomorrow's meals in one tap. That selection automatically rolls up through Room Lead → Floor Incharge → Block Coordinator → Mess Incharge → Principal, so the kitchen always cooks for the right number of people and every supervisory level sees exactly what it needs to see — no manual counting, no phone calls.

Alongside the mess flow, students can order snacks and food from the KIET Food Court (KFC) directly in the app, pay cash at the counter, and skip the queue by pre-ordering.

An AI Mess Intelligence layer sits underneath both flows: it forecasts how many students will actually turn up (versus how many merely selected), flags unusual reporting patterns, recommends menu items to students based on taste history, answers quick questions through a chatbot, and turns "food saved" into a simple wastage-impact score the Principal can show off in reports.

**One-line pitch:** "One tap tells the whole mess hierarchy what tomorrow looks like — and an AI layer makes sure that number is actually right."

## 2. Problem Statement & Background
### 2.1 Current State
- Lateral-entry students are semi-residential and their meal attendance is unpredictable — no digital system tracks who is eating what, and when.
- Meal counts travel up the hierarchy manually (phone calls, registers, verbal headcounts), which is slow, error-prone, and untraceable.
- The mess kitchen either over-prepares (wastage, cost) or under-prepares (shortage, complaints) because it never has an accurate next-day number.
- The Principal has no dashboard — mess performance, cost, and wastage are invisible until something goes wrong.
- The campus food court (KFC) runs on walk-in queues only; students waste time standing in line for a snack between classes.

### 2.2 Why Now
The volume of lateral-entry / semi-residential students is growing every intake, and manual coordination does not scale. A digital, role-based, data-driven system removes guesswork at every layer and gives the institution a foundation to plan food budgets, reduce wastage, and improve student satisfaction.

## 3. Goals & Objectives
- **↓ 30%** Target reduction in food wastage within 2 months of rollout
- **< 10s** Time for a student to submit tomorrow's meal plan
- **100%** Meal-count visibility at every hierarchy level, in real time
- **< 5 min** Target KFC order-to-ready time via pre-ordering

### 3.1 Primary Objectives
1. Give students a one-screen way to declare next-day meal intent (breakfast / lunch / snacks / dinner).
2. Automatically aggregate that intent up the hierarchy without manual re-entry at any level.
3. Give the Principal a real-time, chart-driven view of mess operations across all blocks.
4. Let students pre-order KFC food court items and pay cash at pickup, cutting queue time.
5. Use AI to forecast real turnout (not just selections), catch reporting anomalies, and reduce wastage measurably.

## 4. Scope
### 4.1 In Scope (v1.0)
- Student meal-selection flow with next-day cutoff and edit window.
- Role-based dashboards for Room Lead, Floor Incharge, Block Coordinator, Mess Incharge, Principal.
- Real-time aggregation pipeline with exception flagging.
- KFC Food Court digital menu, cart, in-app ordering, cash-at-counter payment, token/pickup flow.
- AI Mess Intelligence: demand forecasting, anomaly detection, menu recommendations, chatbot, wastage-impact scoring.
- Notifications (in-app + email) for cutoff reminders, order-ready alerts, and anomaly escalations.
- Analytics dashboards using Recharts for Mess Incharge and Principal.

### 4.2 Out of Scope (v1.0)
- Online/UPI payments for KFC orders (confirmed as cash-at-counter for this version).
- Hostel fee billing or mess-fee deduction integration.
- Native mobile apps (v1.0 ships as a responsive web app / installable PWA).
- Multi-campus / multi-college support.

## 5. User Personas & Roles
- **Student (Lateral Entry / Semi-Residential)**: Quickly tell the mess what meals they'll eat tomorrow, and order a snack from KFC without queuing.
- **Room Lead**: See at a glance how many students in their room have submitted, and nudge stragglers before cutoff.
- **Floor Incharge**: Monitor floor-level submission rate and totals; escalate rooms with unusually low participation.
- **Block Coordinator**: Consolidate all floors in the block into one number per meal, sent to the Mess Incharge on time.
- **Mess Incharge**: Know the exact/predicted headcount per meal so the kitchen buys and cooks the right quantity.
- **Principal**: A single dashboard showing mess efficiency, wastage trends, satisfaction, and KFC footfall — without asking anyone.
- **KFC (Food Court) Staff**: See incoming pre-orders as they arrive, prepare them, and hand over against a token when the student pays cash.

## 6. Product Requirements — Functional Modules
### 6.1 Student Module — Meal Selection
- Daily card shows tomorrow's menu with toggle switches (shadcn `Switch`/`Checkbox`) for each meal.
- Single "Confirm Selection" action submits all four meals at once; confirmation toast on success.
- Selections are editable until a configurable cutoff time (default 9:00 PM the previous day).
- Missed cutoffs get an AI-suggested default based on their last 2-week pattern (flagged as `source: "ai-default"`).
- Personal submission history and streak tracking.

### 6.2 Room Lead / Floor Incharge / Block Coordinator Dashboards
- Scoped view showing submitted vs. pending count, per-meal totals, and live progress bar.
- One-tap "Remind pending students" action.
- Anomaly banner if the AI layer detects an unusual dip/spike.
- All counts are read-only roll-ups.

### 6.3 Mess Incharge Console
- Final locked headcount per meal, per block, at cutoff — plus AI predicted actual turnout.
- Suggested quantity-to-cook per dish.
- Menu management: create/update tomorrow's menu items, upload images.
- Post-meal actual-attendance entry.

### 6.4 Principal Dashboard
- Analytics-only, read-only view (Recharts): trend lines for wastage, submission-rate heatmaps, KFC footfall.
- Drill-down filters.
- Downloadable summary report.
- Anomaly and escalation log.

### 6.5 KFC Food Court Module
- Digital menu with categories, price, availability toggle, images.
- Cart + "Place Order" flow; generates a token number.
- Payment mode: Cash at counter.
- Live order status pushed to the student in real time via Socket.IO.
- Staff-side queue view sorted by order time.

### 6.6 AI Mess Intelligence Suite
- Demand Forecasting: Predicts actual turnout per meal per block using historical patterns, day-of-week, exams/holidays, and weather.
- Anomaly & Fraud Detection: Flags statistically unusual patterns.
- Smart Menu Recommendations: Nudges students with suggestions based on history.
- Conversational Assistant: Chatbot answering common queries.
- Wastage Impact & Gamification Score: Converts food saved into a friendly "meals-equivalent saved" number.

### 6.7 Notifications
- Cutoff reminder.
- Escalation alerts for anomalies.
- KFC order-status pushes.
- Weekly digest email summarizing wastage and forecast accuracy.

## 7. Non-Functional Requirements
- **Performance**: Meal-selection submission responds in < 500 ms P95; dashboards load initial data in < 2s on campus Wi-Fi.
- **Scalability**: Supports 5,000+ concurrent students without degradation.
- **Availability**: 99.5% uptime target.
- **Real-time updates**: Dashboard counts refresh live via Socket.IO within 2 seconds.
- **Usability**: Student flow completable in <= 3 taps; mobile-first layout.
- **Accessibility**: WCAG 2.1 AA color contrast on all shadcn components.
- **Auditability**: Every count change, override, or admin action is logged immutably.
- **Data retention**: History retained for at least 1 academic year.

## 8. User Stories & Acceptance Criteria
- As a student, I want to select tomorrow's meals in one screen...
- As a student, I want to edit my selection before cutoff...
- As a Room Lead, I want to see who hasn't submitted...
- As the Mess Incharge, I want the AI-predicted turnout alongside the raw count...
- As the Principal, I want a wastage trend chart...
- As a student, I want to pre-order a snack from KFC...
- As a Floor Incharge, I want to be alerted if a room's numbers look wrong...

## 9. Non-Technical Process Flow Document
### 9.1 Daily Meal Selection Flow
1. Mess Incharge publishes menu.
2. Students receive reminder and toggle meals.
3. Edits allowed until cutoff (9:00 PM).
4. System locks selections at cutoff.
5. AI-suggested defaults filled for missing students.

### 9.2 Hierarchy Aggregation Flow — Decision: Auto-Aggregation with Exception Flagging
Auto-aggregation with exception-based escalation is used. Counts roll up automatically, supervisors only act on exceptions flagged by AI or humans.

### 9.3 KFC Food Court Ordering Flow
1. Browse menu and add to cart.
2. Place order, get token number.
3. Staff prepares and marks "Ready" -> instant notification.
4. Student shows token, pays cash, picks up food.
5. Staff marks "Picked Up".

### 9.4 AI Intelligence Flow (Plain-Language View)
Watches past student behavior, learns patterns, and gives Mess Incharge a smarter number while watching for anomalies.
