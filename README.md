# ConstructPro - Construction Project Management System

**Client:** Munaf & Sons Contractors (Pvt) Ltd, Colombo 03  
**Admin User:** Haseem (Owner)  
**Date:** June 2026

## Project Overview

A comprehensive construction project management system to replace WhatsApp-based tracking with proper digital tools for:
- Project tracking and budget management
- Worker attendance and payroll
- Material inventory management
- Client portal for progress updates
- Real-time reporting and analytics

## Tech Stack

**Frontend:**
- React 18 + TypeScript + Vite
- TailwindCSS + shadcn/ui
- Zustand (state management)
- React Query (TanStack) for API

**Backend:**
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL (Supabase)
- JWT Authentication

**Deployment:**
- Vercel (Frontend)
- Railway (Backend)

## Project Structure

```
construction-pm/
├── backend/          # Node.js + Express API
├── frontend/         # React + Vite frontend
└── README.md         # This file
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (Supabase account)
- npm or yarn

### Setup

1. **Clone and setup directories**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Environment Variables**
   - Copy `.env.example` to `.env` in both backend and frontend
   - Configure Supabase credentials
   - Set JWT secret

3. **Database Setup**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Run Development Servers**
   ```bash
   # Backend (port 5000)
   cd backend && npm run dev

   # Frontend (port 5173)
   cd frontend && npm run dev
   ```

## Default Users

| Role | Email | Password |
|------|-------|----------|
| Admin | haseem3393@gmail.com | Haseem@2004 |
| Project Manager | manager@munafcons.lk | Manager@1234 |
| Supervisor | supervisor@munafcons.lk | Super@1234 |
| Client | client@munafcons.lk | Client@1234 |

## Development Phases

- **Phase 1:** Setup + Auth + Roles (Week 1)
- **Phase 2:** Projects + Dashboard (Week 2)
- **Phase 3:** Tasks + Milestones + Team (Week 3)
- **Phase 4:** Workers + Attendance (Week 4)
- **Phase 5:** Materials + Expenses (Week 5)
- **Phase 6:** Reports + Client Portal + Deploy (Week 6)

## Key Features

- Role-based access control (Admin, Manager, Supervisor, Client)
- Real-time budget tracking with alerts
- Worker attendance with overtime calculation
- Material inventory management
- Automated milestone-based payment tracking
- Client portal for project visibility
- Mobile-responsive design

## License

Private project for Munaf & Sons Contractors
