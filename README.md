# Gipjazes - Short-Form Video Platform

This project is a monorepo for the Gipjazes platform, featuring a React Native mobile app and a Node.js API backend.

## Project Structure

- **apps/mobile**: React Native application for iOS and Android.
  - `src/components/VideoFeed.tsx`: The main infinite scroll feed.
  - `src/components/VideoItem.tsx`: Individual video player component.
- **apps/api**: Node.js backend services.
  - `src/routes/video.ts`: Video upload and metadata processing endpoints.
  - `src/db.ts`: Database connection utility.
- **database**: Database schemas and migrations.
  - `schema.sql`: PostgreSQL schema for Users, Videos, and social graph.
- **ARCHITECTURE.md**: Detailed system architecture documentation.

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    - Configure PostgreSQL connection in `.env`.
    - Set up AWS S3 credentials for video storage.

3.  **Run Development Servers**:
    - Mobile: `cd apps/mobile && npm start`
    - API: `cd apps/api && npm run dev`

## Deployment

### Backend (API)
The API is containerized using Docker and ready for deployment to **Google Cloud Run** or any container-based platform.
1. Build the image: `cd apps/api && docker build -t gipjazes-api .`
2. Follow the detailed deployment workflow in `.agent/workflows/deploy-api.md`.

### Database
Ensure you have a production PostgreSQL instance (e.g., Supabase, Neon, or GCP Cloud SQL). Run the migrations using:
```bash
cd apps/api && npm run db:migrate
```

### Mobile
1. Update `PROD_URL` in `apps/mobile/src/services/api.ts` with your live API endpoint.
2. Build for production:
   - Android: `cd apps/mobile && npm run android -- --variant release`
   - iOS: Use Xcode to Archive and Distribute the app.

