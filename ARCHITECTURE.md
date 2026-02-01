# Gipjazes - System Architecture & Tech Stack

## 1. App Identity & Core Features
**Name**: Gipjazes
**Mission**: A high-performance, short-form vertical video social platform (TikTok clone).

### Key Features
- **The Feed**: Infinite scroll vertical video feed using `FlashList` for performance.
- **Creator Studio**: In-app recording, trimming, and filters via `FFmpeg`.
- **Social Core**: User profiles, real-time interactions, 'Following' vs 'For You' algorithms.
- **Music Integration**: Searchable audio library linking tracks to videos.

## 2. Technical Architecture

### Frontend (Mobile)
- **Framework**: React Native (0.73+) with TypeScript.
- **Video Player**: `react-native-video` (v6.0.0-alpha for caching/performance).
- **List Virtualization**: Shopify's `@shopify/flash-list` for smooth 60fps scrolling.
- **State Management**: Zustand or TanStack Query.
- **Navigation**: React Navigation (Native Stack).

### Backend (API & Microservices)
- **Runtime**: Node.js (v20+).
- **Framework**: Express.js (or NestJS if complexity grows).
- **Architecture**: Microservices pattern (Auth Service, Feed Service, Transcoding Service).
- **Communication**: REST API for client-server; RabbitMQ/Redis for async processing (metadata generation).

### Database Layer
- **Relational Data (PostgreSQL)**: User profiles, authentication, social graph (followers), likes, comments.
- **Metadata (MongoDB)**: Video metadata, hashtags, analytics events (flexible schema).
- **Caching (Redis)**: Feed caching, session management, real-time counters.

### Storage & Delivery
- **Object Storage**: AWS S3 (Buckets for Raw Uploads, Processed HLS/DASH streams, Thumbnails).
- **CDN**: AWS CloudFront for low-latency global content delivery.
- **Transcoding**: AWS MediaConvert or self-hosted FFmpeg workers triggered by S3 upload events.

## 3. High-Level Data Flow (Video Upload)
1. **Client** requests a pre-signed S3 URL from API.
2. **Client** uploads raw video directly to S3 Bucket (Input).
3. **S3 Event** triggers a Lambda/Worker function.
4. **Worker** processes video (transcodes to HLS, generates thumbnail, extracts metadata).
5. **Worker** updates MongoDB with video metadata and PostgreSQL with post reference.
6. **CloudFront** serves the HLS stream to users.

## 4. Monorepo Structure
We utilize a workspace-based monorepo (using Yarn/NPM Workspaces or Turborepo).

```
/gipjazes-monorepo
├── apps
│   ├── mobile          # React Native App
│   ├── web             # (Optional) Next.js Web App
│   └── api             # Node.js API Gateway / Services
├── packages
│   ├── ui              # Shared UI components
│   ├── config          # Shared TSConfig, ESLint, etc
│   └── utils           # Shared validation/helper logic
└── database            # SQL Migration scripts
```
