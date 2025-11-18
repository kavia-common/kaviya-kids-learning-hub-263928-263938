# Kaviya Kids Learning Hub - Frontend

This React app communicates with the backend via a centralized Axios client and uses an AuthContext to store JWTs.

## Backend API Integration

- Base URL: `REACT_APP_API_BASE_URL` (default: `http://localhost:3001`)
- JWT is persisted in localStorage and attached as `Authorization: Bearer <token>` via an Axios interceptor.

Services:
- authService: `POST /signup`, `POST /login`
- dashboardService: `GET /dashboard/:id`
- quizService: `GET /quiz/:subject`, `POST /submit-quiz`
- parentService: `GET /parent/:id`
- rewardsService: `GET /rewards/:id`

## Configure Environment

1. Copy `.env.example` to `.env`:
   REACT_APP_API_BASE_URL=http://localhost:3001

2. Ensure backend CORS is enabled and running at the configured URL.

## Quick Test

- Start backend on port 3001.
- Start frontend:
  npm start
- Visit:
  - /auth to signup/login
  - /dashboard after login
  - /quiz/math for a quiz
  - /parent for parent dashboard
  - /rewards for pet and stickers

## Notes

- If backend response shapes differ, adjust the field mapping in the pages/services.
- Do not hardcode secrets; use env variables.
