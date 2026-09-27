# Higgsfield AI Clone

A Vite + React frontend and Express API for a cinematic AI studio MVP inspired by Higgsfield.

## Features

- landing page / marketing shell
- authenticated login and registration
- protected studio dashboard
- image generation flow with demo provider
- video studio flow prepared and connected to shared generation architecture
- Supabase-ready repository layer with local JSON fallback

## Local development

1. Install dependencies:
   npm install
2. Copy the example environment file:
   copy .env.example .env
3. Update the values in .env for your local or hosted Supabase and JWT secret.
4. Start the app:
   npm run dev

The frontend runs on http://localhost:5173 and the backend API runs on http://localhost:4000.

## Production build

npm run build

## Backend

npm run server

## Deployment guidance

### Option A: Vercel + Render/Railway

- Frontend: deploy the Vite app to Vercel
- Backend: deploy the Express API to Render or Railway
- Add environment variables in the deployment provider
- Set VITE_API_URL or equivalent in the frontend if needed

### Option B: Single host

- Use a proxy or host the Express API and frontend on the same server
- Keep the backend secret values only on the server

## Required assignment checklist

- public GitHub repository
- .agent-logs committed in the repo
- live HTTPS deployment URL
- walkthrough video with camera on
- final submission form filled with repo link and live link

## Notes

- the app uses a demo provider by default
- Supabase integration is prepared and schema is in supabase-schema.sql
- do not expose API keys or secrets in the frontend
