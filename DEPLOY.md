# KAPS AI — Vercel Deployment Guide

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/karan-patel11/credit-analyzer)

## Manual Deployment Steps

1. Push code to GitHub
2. Go to vercel.com and import the repository
3. Leave the Root Directory at the repository root so Vercel uses the checked-in `vercel.json`
4. If you need to override the settings manually, use:
   - Framework Preset: Vite
   - Root Directory: .
   - Build Command: cd frontend && npm run build
   - Output Directory: frontend/dist
   - Install Command: cd frontend && npm install
5. Add environment variables in Vercel dashboard:
   - VITE_API_URL = (your backend URL, or leave empty for demo mode)
   - VITE_DEMO_MODE = true (recommended for portfolio demos)
6. Click Deploy

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| VITE_API_URL | Backend API URL | http://localhost:8000 |
| VITE_DEMO_MODE | Use mock data instead of live API | true |

## Demo Mode vs Live Mode

The app ships with Demo Mode ON by default for Vercel deployment.
This means it works without any backend — perfect for portfolio demos.

To use Live Mode, set VITE_DEMO_MODE=false and provide a running backend URL.

## Backend Deployment (Optional)

The Python backend requires MySQL and Redis which are not included in Vercel.
For a full deployment, deploy the backend separately to:
- Railway (recommended — supports MySQL + Redis)
- Render
- AWS ECS
- Any VM/VPS

Then set VITE_API_URL to your backend URL in Vercel environment variables.

## Local Development

```bash
# Start backend services
docker compose up -d

# Start frontend
cd frontend
npm install
npm run dev
```

## Project Structure

- frontend/ — React + Vite app (deploys to Vercel)
- backend/ — FastAPI + Python (deploys separately)
- k8s/ — Kubernetes manifests (for production backend)
- tests/ — 69 tests currently passing locally
