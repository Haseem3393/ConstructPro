# ConstructPro - Setup Guide

## Phase 1 Completed ✅

Phase 1 (Setup + Auth + Roles) has been successfully completed. Here's what has been implemented:

### Backend Setup
- ✅ Node.js + Express + TypeScript project structure
- ✅ Prisma ORM with comprehensive database schema
- ✅ JWT authentication system
- ✅ Role-based middleware and authorization
- ✅ API endpoints for authentication and dashboard
- ✅ Seed data with default users
- ✅ All dependencies installed

### Frontend Setup
- ✅ React 18 + TypeScript + Vite project
- ✅ TailwindCSS + shadcn/ui styling system
- ✅ Zustand state management
- ✅ React Query for API calls
- ✅ Login page with role-based redirect
- ✅ Dashboard, Projects, Attendance, and Client Portal pages
- ✅ All dependencies installed

## Next Steps: Database Setup

To complete Phase 1, you need to set up a PostgreSQL database using Supabase:

### 1. Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project

### 2. Get Database Credentials
1. In your Supabase project, go to Settings → Database
2. Copy the connection string (URI format)
3. It should look like: `postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres`

### 3. Configure Backend
1. Open `backend/.env`
2. Replace the `DATABASE_URL` with your Supabase connection string:
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres?schema=public"
   ```
3. Keep the JWT_SECRET as is or change it for production

### 4. Initialize Database
Run these commands in the backend directory:

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with default users
npx prisma db seed
```

### 5. Start the Applications

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

## Testing the Application

1. Open `http://localhost:5173` in your browser
2. Use the demo credentials to test different roles:

### Admin (Haseem)
- Email: `haseem3393@gmail.com`
- Password: `Haseem@2004`
- Redirect: `/dashboard`

### Project Manager
- Email: `manager@munafcons.lk`
- Password: `Manager@1234`
- Redirect: `/projects`

### Supervisor
- Email: `supervisor@munafcons.lk`
- Password: `Super@1234`
- Redirect: `/attendance`

### Client
- Email: `client@munafcons.lk`
- Password: `Client@1234`
- Redirect: `/portal`

## What's Next (Phase 2)

Phase 2 will focus on:
- Projects CRUD operations
- Enhanced Dashboard with real data
- Project filtering and search
- Project detail pages with tabs
- Budget tracking with alerts

## Troubleshooting

### Database Connection Issues
- Ensure your DATABASE_URL is correct in backend/.env
- Check that your Supabase project is active
- Verify your password in the connection string

### Port Already in Use
- Change PORT in backend/.env if 5000 is busy
- Change frontend port in package.json if 5173 is busy

### Prisma Issues
- Run `npx prisma generate` if you get type errors
- Run `npx prisma migrate dev` if schema changes aren't applied

## Project Structure

```
construction-pm/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── types/
│   └── package.json
└── README.md
```

## Support

For issues or questions, refer to the main README.md or contact the development team.
