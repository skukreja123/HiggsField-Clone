# Higgsfield AI Clone

A cinematic AI studio MVP inspired by Higgsfield, built with a React frontend and an Express backend. The app includes a premium landing page, secure authentication, a protected studio dashboard, and a generation system designed for image generation with video-ready architecture.

## Overview

This project simulates a premium AI creative platform where users can:

- browse a marketing landing page
- register and sign in securely
- create AI image concepts in a protected studio
- explore generation history and outputs
- use a provider-based generation service for future expansion into video generation

The app is designed to be practical for a 24-hour assignment while still keeping the architecture extensible.

## Live deployment

- Frontend (Vercel): https://higgsfield-mu.vercel.app
- Backend API (Render): https://higgsfield-clone.onrender.com
- Health check: https://higgsfield-clone.onrender.com/api/health

## Tech Stack

- Frontend: React 19 + Vite
- Backend: Express 5
- Auth: JWT + bcrypt
- Database: Supabase hosted PostgreSQL
- API integration: Stability AI
- Fallback strategy: demo-generation provider for graceful fallback

## Features

- premium dark-theme landing page
- auth flow with register/login/logout
- protected studio route
- image generation flow with creative controls
- video mode scaffolded in frontend/backend architecture for future expansion
- generation history and result gallery
- provider abstraction with `GenerationService`
- responsive design for desktop and tablet views
- secure backend environment-variable configuration

## Project Structure

```text
.
├── src/
│   ├── components/
│   ├── contexts/
│   ├── lib/
│   ├── pages/
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── server/
│   ├── providers/
│   ├── repositories/
│   ├── services/
│   ├── auth.js
│   ├── config.js
│   └── index.js
├── public/
├── .env.example
├── .env
├── supabase-schema.sql
├── render.yaml
├── vercel.json
├── package.json
├── vite.config.js
├── README.md
└── CAPTURE-TEST.md
```

## Local Development

### 1) Install dependencies

```bash
npm install
```

### 2) Create environment file

```bash
copy .env.example .env
```

If you are on macOS/Linux:

```bash
cp .env.example .env
```

### 3) Configure environment values

Update `.env` with your local secrets and database values.

Example:

```env
PORT=4000
JWT_SECRET=your-secure-secret
SESSION_TTL=86400
IMAGE_PROVIDER=stability
VIDEO_PROVIDER=demo
STABILITY_API_KEY=your-key
STABILITY_API_URL=https://api.stability.ai
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4) Start the app

```bash
npm run dev
```

This starts:

- frontend: http://localhost:5173
- backend API: http://localhost:4000

### 5) Health check

```bash
curl http://localhost:4000/api/health
```

Expected response:

```json
{"ok":true,"service":"higgsfield-api"}
```

## Production Build

```bash
npm run build
```

## Server-only command

```bash
npm run server
```

## Backend API

The backend exposes auth and generation APIs under `/api`.

### Auth routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Generation routes

- `POST /api/generations`
- `GET /api/generations`
- `GET /api/generations/:id`
- `POST /api/generations/:id/regenerate`

### Health route

- `GET /api/health`

## Deployment (Vercel + Render)

This project is configured for a frontend/backend split:

- Frontend: Vercel
- Backend: Render

### Frontend environment variables for Vercel

```env
VITE_API_URL=https://your-render-service.onrender.com
```

### Backend environment variables for Render

```env
PORT=10000
JWT_SECRET=your-secure-secret
SESSION_TTL=86400
IMAGE_PROVIDER=stability
VIDEO_PROVIDER=demo
STABILITY_API_KEY=your-key
STABILITY_API_URL=https://api.stability.ai
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ALLOWED_ORIGINS=https://your-vercel-project.vercel.app
```

### Render deployment notes

- set the start command to `npm start`
- health check route is `/api/health`
- backend is expected to respond with `{"ok":true,"service":"higgsfield-api"}`

### Vercel deployment notes

- framework: Vite
- build command: `npm run build`
- output directory: `dist`
- add `VITE_API_URL` to connect the frontend to the Render backend

## Supabase Schema

The project includes a minimal schema for the assignment in `supabase-schema.sql`.

Required tables:

- `users`
- `generations`
- `generation_results`

This is designed to keep the data model minimal while still matching the app's auth and generation flow.

## Provider Architecture

The generation system is structured for extension:

- `GenerationService`
- `ImageGenerationProvider`
- `VideoGenerationProvider`

This allows the app to support multiple AI providers and keep the data model ready for future video AI extension without blocking the current image-generation MVP.

## Notes

- the app uses the Stability provider when a valid key is configured
- if the provider is unavailable or credits are exhausted, a fallback demo provider is used so the app remains functional
- secrets and API keys must never be exposed in the frontend
- video generation is intentionally prepared but not fully implemented as a premium production video pipeline yet

## Assignment Checklist

This repo is structured for the assignment constraints:

- landing page implemented
- auth implemented
- protected studio dashboard implemented
- image generation flow implemented
- video frontend/backend architecture prepared
- Supabase-ready schema included
- environment-driven configuration used
- build verified locally

## License

This project is intended for educational and assignment use. Update or remove this section if you are publishing the repo under a different license.
