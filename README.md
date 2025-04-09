# KeyDraft - Employee Productivity Tracking System

KeyDraft is a web application designed to help businesses track employee productivity. This MVP focuses on core time tracking, basic task management, and minimal reporting.

## Features

- User Authentication (Login/Logout)
- Time Tracking (Start/Stop, Break Tracking)
- Task Management (Creation, Assignment, Status)
- Reporting (Daily Summaries, Hour Tracking)
- Admin Dashboard (Employee Status, Productivity Metrics)

## Tech Stack

### Frontend
- React with TypeScript
- Material UI
- Vite
- React Router
- Axios

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

## Setup Instructions

1. Clone the repository
2. Set up the database:
   ```bash
   # Create a PostgreSQL database named 'keydraft'
   createdb keydraft
   ```

3. Backend Setup:
   ```bash
   cd backend
   npm install
   # Update .env file with your database credentials
   npm run prisma:generate
   npm run prisma:migrate
   npm run dev
   ```

4. Frontend Setup:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/keydraft?schema=public"
PORT=3000
JWT_SECRET="your-super-secret-key-change-this-in-production"
```

## Development

- Backend runs on http://localhost:3000
- Frontend runs on http://localhost:5173

## License

ISC 