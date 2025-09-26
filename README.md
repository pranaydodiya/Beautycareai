# Beautycareai — Metizcare (Full-Stack AI Skincare Platform)

A production-ready, full‑stack beauty/skincare platform with AI-driven face analysis, personalized tips and e‑commerce flows.

- Frontend: React (CRA), Redux, Tailwind/Bootstrap, deployed on Vercel
- Backend: Node.js + Express, MongoDB (Atlas), deployed on Render
- AI Service: Python (Flask) + DeepFace/TensorFlow, deployed on Fly.io
- Containerization: Docker & docker-compose for local/prod parity

## Table of Contents
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repository Layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Quick Start (Local)](#quick-start-local)
- [Run with Docker Compose](#run-with-docker-compose)
- [Deployment](#deployment)
  - [Frontend (Vercel)](#frontend-vercel)
  - [Backend (Render)](#backend-render)
  - [Python AI (Flyio)](#python-ai-flyio)
- [Health Checks](#health-checks)
- [Common Scripts](#common-scripts)
- [Troubleshooting](#troubleshooting)
- [Security & Ops](#security--ops)
- [License](#license)

## Architecture
```
Frontend (Vercel)
  ↕ (HTTPS)       \
Backend API (Render, Node/Express, MongoDB)
  ↕ (HTTP)         \
Python AI Service (Fly.io, Flask + DeepFace/TensorFlow)
```
- Frontend calls Backend for products, orders, auth, quiz, tips
- Backend calls Python service for face analysis endpoints
- MongoDB stores users, products, orders, quiz responses, tips

## Tech Stack
- Frontend: React 18, Redux, React Router, Ant Design/Bootstrap, CRA build
- Backend: Node 20, Express 4, Mongoose 8, JWT Auth, Multer uploads
- AI: Python 3.10, Flask, DeepFace, OpenCV, TensorFlow 2.15
- Infra: Docker, docker-compose, Vercel, Render, Fly.io, MongoDB Atlas

## Repository Layout
```
Metizcare/
├─ Beautycareai/
│  ├─ backend/                 # Node.js API (Express)
│  ├─ frontend/                # React app (CRA)
│  └─ python_service/          # AI/ML service (Flask + DeepFace)
├─ deployment/                 # Prepared deployment packages
├─ docker-compose.yml          # Local all-in-one stack
├─ docker-compose.prod.yml     # Production-ish compose
├─ MULTI_PLATFORM_DEPLOYMENT.md
├─ DEPLOYMENT.md
├─ MANUAL_DEPLOYMENT_GUIDE.md
├─ COMPLETE_DEPLOYMENT_GUIDE.md
└─ README.md (this file)
```

## Prerequisites
- Node.js 20+
- npm 9+ (or yarn)
- Python 3.10+
- Docker Desktop (for Docker flows)
- MongoDB Atlas (recommended) or local MongoDB

## Environment Variables
Set these on each platform (or local `.env`, not committed).

Backend (Render):
- `NODE_ENV` = `production`
- `MONGO_URI` = Atlas connection string (e.g. `mongodb+srv://user:pass@cluster.xxxx.mongodb.net/metizcare?retryWrites=true&w=majority`)
- `JWT_SECRET` = long random string (32–64 chars)
- `CORS_ORIGIN` = your Vercel URL
- `PYTHON_SERVICE_URL` = your Fly.io Python service URL
- Optional: `GEMINI_API_KEY`, `CLERK_SECRET_KEY`

Frontend (Vercel):
- `REACT_APP_BACKEND_URL` = Render backend URL
- `REACT_APP_CLERK_PUBLISHABLE_KEY` = your Clerk publishable key
- Optional: `REACT_APP_PYTHON_SERVICE_URL` = Fly.io Python URL

Python AI (Fly.io):
- `FLASK_ENV` = `production`
- `DEEPFACE_HOME` = `/cache/deepface`
- `BACKEND_URL` = Render backend URL
- `FRONTEND_URL` = Vercel URL

Notes:
- Do not commit `.env` files. Use platform env managers or Secret Files if required.
- If you need persistent uploads, prefer a cloud storage (e.g., Cloudinary); free instances have ephemeral disks.

## Quick Start (Local)
Install frontend and backend separately for local dev:

Backend
```bash
cd Beautycareai/backend
npm install
# set .env with MONGO_URI, JWT_SECRET, etc.
npm run server
```

Frontend
```bash
cd Beautycareai/frontend
npm install
npm start
```

Python AI Service
```bash
cd Beautycareai/backend/python_service
pip install -r requirements.txt
python start_deepface_service.py
```

## Run with Docker Compose
Bring up Mongo, Python AI, and Backend (plus Nginx for frontend if configured):
```bash
# from project root
docker-compose up -d
# logs
docker-compose logs -f
# stop
docker-compose down
```
Update `.env` equivalents in `docker-compose.yml` or pass via env files.

## Deployment
See detailed docs:
- `MULTI_PLATFORM_DEPLOYMENT.md` (strategy)
- `COMPLETE_DEPLOYMENT_GUIDE.md` (step-by-step)
- `DEPLOYMENT.md` / `MANUAL_DEPLOYMENT_GUIDE.md`

### Frontend (Vercel)
- Framework: Create React App
- Build Command: `npm run build`
- Output Directory: `build`
- Env: `REACT_APP_BACKEND_URL`, `REACT_APP_CLERK_PUBLISHABLE_KEY`

### Backend (Render)
Option A (Node runtime):
- Root Directory: `Beautycareai/backend`
- Install: `npm install`
- Build: (leave empty)
- Start: `npm start` (ensure server uses `process.env.PORT`)
- Health Check Path: `/`

Option B (Docker):
- Build Context: `Beautycareai/backend`
- Dockerfile Path: `Beautycareai/backend/Dockerfile`
- Health Check Path: `/`

Env: `NODE_ENV`, `MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN`, `PYTHON_SERVICE_URL`

### Python AI (Fly.io)
- `fly launch` in `Beautycareai/backend/python_service`
- Set secrets: `BACKEND_URL`, `FRONTEND_URL`, `FLASK_ENV`, `DEEPFACE_HOME`
- Scale as needed (consider region closest to users)

## Health Checks
- Backend: `/` (or implement `/health` returning 200)
- Python AI: `/health` (Flask route recommended)
- Frontend: root `/` should serve built assets

## Common Scripts
Backend (`Beautycareai/backend/package.json`):
- `npm run server` — dev server (nodemon)
- `npm start` — production server
- `npm run dev` — concurrent backend+frontend+python (local)

Frontend (`Beautycareai/frontend/package.json`):
- `npm start` — dev server
- `npm run build` — production build

Python Service (`Beautycareai/backend/python_service`):
- `python start_deepface_service.py` — launch AI service

## Troubleshooting
- CORS errors: ensure `CORS_ORIGIN` (backend) allows your Vercel URL.
- 502/timeout between backend and AI: verify `PYTHON_SERVICE_URL` and Fly app is running.
- Mongo connection: confirm `MONGO_URI` user/password and IP access list in Atlas.
- Large files/LFS: keep models out of git; download at build/run or host externally.

## Security & Ops
- Secrets: store in platform env/secret managers; rotate regularly.
- JWT: use strong `JWT_SECRET`; tokens expire (`30d` configured in code).
- Logging/Monitoring: use platform logs (Vercel/Render/Fly) and consider external monitoring if needed.

## License
MIT (see project headers or add a LICENSE file if missing).
