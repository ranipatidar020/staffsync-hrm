# StaffSync — Modern Human Resource Management Solution

MERN-stack HRM demo: employee directory, attendance, leave requests, announcements, learning.
React (Vite) frontend + Express/Node API + MongoDB (Mongoose). In production the Express server also serves the built React app, so the whole thing runs as **one** service.

## Run locally
```bash
# 1. Backend (needs MongoDB running locally, or an Atlas URI in backend/.env)
cd backend && cp .env.example .env && npm install && npm run dev      # http://localhost:5000

# 2. Frontend (new terminal) — /api is proxied to :5000
cd frontend && npm install && npm run dev                              # http://localhost:5173
```
Demo data is inserted automatically the first time the database is empty.

## API
`GET /api/health` · `GET|POST /api/employees` · `GET|POST /api/leaves` · `PATCH /api/leaves/:id/status`
`GET|POST /api/attendance` · `GET|POST /api/announcements`

## Deploy
See DEPLOYMENT.md (GitHub → MongoDB Atlas → Render).

> Demo only: no login/JWT/roles yet, so anyone with the link can edit data. Add authentication before real use.
