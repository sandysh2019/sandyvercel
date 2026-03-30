# Portfolio CMS (Frontend + Backend)

Full-stack portfolio website with:
- React + TypeScript frontend (`src`)
- Express API backend (`backend`)
- MongoDB (primary) with JSON fallback (`data/database.json`)
- Admin panel for portfolio, messages, and settings

## Important: Database Type

This project now supports both:
- **MongoDB** when `USE_MONGODB=true`
- **JSON fallback** when `USE_MONGODB=false`

Data access layer: `backend/database/index.js`

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
VITE_API_URL=http://localhost:3001/api
PORT=3001
NODE_ENV=development
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGIN=http://localhost:5173
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me
USE_MONGODB=true
MONGODB_DB_NAME=portfolio_cms
MONGODB_URI=your-mongodb-uri
```

Optional (for future email automation):

```bash
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

## Setup

```bash
npm install
```

## Run Locally

Run backend:

```bash
npm run server
```

Run frontend:

```bash
npm run dev
```

Or run both together:

```bash
npm run fullstack
```

## Build

```bash
npm run build
```

## Deploy

### Free Demo Hosting
- Frontend: Netlify or Vercel
- Backend: Render or Railway
- Set `VITE_API_URL` to deployed backend `/api` URL
- Set `CORS_ORIGIN` to deployed frontend domain

### Paid Production
- Frontend: Vercel Pro / Netlify Pro
- Backend: AWS ECS / Fly.io / Railway Pro
- Add reverse proxy + HTTPS + process manager
- Move from JSON file DB to managed DB (MongoDB/PostgreSQL)
- Store secrets in provider-managed secret store
