# Quick Start Guide: Sighting Management System

**Feature**: `001-sighting-management`  
**Created**: 2026-02-04  
**Setup Time**: ~5 minutes

**Tech Stack**: SolidJS (JavaScript frontend) + Cloudflare Workers (TypeScript backend) + D1 SQLite

---

## Prerequisites

- Node.js 18+ and pnpm installed
- Cloudflare account (free tier OK)
- Git for version control
- Text editor (VS Code recommended)

---

## Local Development Setup

### 1. Install Dependencies

```bash
# In repository root
pnpm install

# Install backend dependencies
cd cloudflare-worker
pnpm install

# Install frontend dependencies
cd ../solidjs
pnpm install

# Return to root
cd ..
```

### 2. Configure Cloudflare Credentials

```bash
# Authenticate with Cloudflare
wrangler login
```

This opens a browser to authorize Wrangler CLI. Click "Allow" to proceed.

### 3. Set Up Local Database (D1)

```bash
# From cloudflare-worker directory
cd cloudflare-worker

# Create local D1 database
wrangler d1 create sighting-dev --local

# Run migrations
wrangler d1 execute sighting-dev --file src/db/migrations/001_init.sql --local

# Verify tables created
wrangler d1 execute sighting-dev --command "SELECT name FROM sqlite_master WHERE type='table';" --local
```

Output should show:
```
┌──────────┐
│ name     │
├──────────┤
│ users    │
│ sightings│
└──────────┘
```

### 4. Configure Environment Variables

Create `.env.local` in `cloudflare-worker/` directory:

```env
# Local development
WORKERS_ENV=development

# Session KV namespace
KV_NAMESPACE_ID=sighting_sessions

# Frontend API endpoint
API_BASE_URL=http://localhost:8787
```

Create `.env.local` in `solidjs/` directory:

```env
# API endpoint for frontend
VITE_API_URL=http://localhost:8787
```

### 5. Update wrangler.jsonc

Ensure `cloudflare-worker/wrangler.jsonc` includes D1 and KV bindings:

```jsonc
{
  "name": "cloudflare-workers-openapi",
  "type": "javascript",
  "account_id": "YOUR_ACCOUNT_ID",
  "main": "src/index.ts",
  
  "env": {
    "development": {
      "d1_databases": [
        {
          "binding": "DB",
          "database_name": "sighting-dev",
          "database_id": "YOUR_DATABASE_ID",
          "path": ".wrangler/state/v3/d1"
        }
      ],
      "kv_namespaces": [
        {
          "binding": "SESSIONS",
          "id": "YOUR_KV_ID",
          "preview_id": "YOUR_KV_PREVIEW_ID"
        }
      ]
    }
  },
  
  "build": {
    "command": "npm run build",
    "cwd": "./",
    "watch_paths": ["src/**/*.ts"]
  },
  
  "env": {
    "development": {
      "route": "http://localhost:8787/*",
      "zone_id": ""
    }
  }
}
```

---

## Running the Application

### Terminal 1: Backend (Cloudflare Worker)

```bash
cd cloudflare-worker
pnpm dev
```

Output:
```
 ⛅️  wrangler (version X.X.X)
👂 Listening on http://localhost:8787
[wrangler:inf] GET /favicon.ico 304 Not Modified [100ms]
```

Swagger UI available at: **http://localhost:8787/**

### Terminal 2: Frontend (SolidJS + Vite)

```bash
cd solidjs
pnpm dev
```

Output:
```
VITE v7.X.X  ready in XXX ms

➜  Local:   http://localhost:3000/
➜  press h to show help
```

### Access the Application

Open browser: **http://localhost:3000/**

---

## Testing the Workflow

### 1. Sign Up

1. Click "Get Started" on homepage
2. Enter email: `test@example.com`
3. Enter password: `TestPassword123!`
4. Click "Sign Up"
5. Redirects to dashboard (empty state)

### 2. Create Sighting

1. Click "Add Sighting" button in navbar
2. Fill form:
   - Animal Name: "Red Fox"
   - Location: "Central Park, NYC"
   - Photo (optional): Choose JPEG/PNG file
3. Click "Create Sighting"
4. Redirects to dashboard, sighting appears in list

### 3. Edit Sighting

1. Click sighting card to open edit view
2. Change animal name to "Eastern Fox"
3. Click save
4. Sighting updated in list

### 4. Delete Sighting

1. Click delete button on sighting card
2. Confirm deletion
3. Sighting removed from dashboard

### 5. Sign Out

1. Click profile icon in navbar
2. Click "Sign Out"
3. Redirects to homepage

### 6. Sign In

1. Click "Log in" on homepage
2. Enter email: `test@example.com`
3. Enter password: `TestPassword123!`
4. Click "Sign In"
5. Redirects to dashboard, sighting still visible

---

## File Structure Overview

```
animal-identifier-2/
├── specs/001-sighting-management/     ← Feature documentation
│   ├── spec.md                         ← User stories & requirements
│   ├── plan.md                         ← This architecture plan
│   ├── data-model.md                   ← Database schema
│   ├── quickstart.md                   ← This file
│   ├── contracts/                      ← API OpenAPI specs
│   ├── checklists/
│   └── tasks.md                        ← Implementation tasks
│
├── cloudflare-worker/                  ← Backend
│   ├── src/
│   │   ├── index.ts                    ← Hono app entry
│   │   ├── types.ts                    ← Shared types
│   │   ├── endpoints/                  ← API route handlers
│   │   │   ├── auth/
│   │   │   ├── sightings/
│   │   │   └── upload/
│   │   ├── middleware/                 ← Auth, validation
│   │   └── db/
│   │       ├── schema.ts               ← Type definitions
│   │       └── migrations/             ← SQL migration files
│   ├── wrangler.jsonc                  ← Workers config
│   └── package.json
│
├── solidjs/                            ← Frontend
│   ├── src/
│   │   ├── components/                 ← UI components
│   │   │   ├── Navbar/
│   │   │   ├── SignUp/
│   │   │   ├── SignIn/
│   │   │   ├── SightingForm/
│   │   │   ├── Dashboard/
│   │   │   └── ...
│   │   ├── pages/                      ← Page components
│   │   ├── services/                   ← API client, auth
│   │   ├── index.jsx                   ← Entry point
│   │   └── styles.css                  ← Global styles
│   ├── vite.config.js
│   └── package.json
│
└── package.json                        ← Root workspace
```

---

## API Endpoints Reference

All endpoints require `Content-Type: application/json` unless noted.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account {email, password} → returns user + sets session cookie |
| POST | `/api/auth/signin` | Sign in {email, password} → returns user + sets session cookie |
| POST | `/api/auth/signout` | Sign out → clears session cookie |
| GET | `/api/auth/me` | Get current user (requires auth) → returns user |

### Sightings

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sightings` | Create sighting {animal_name, location, photo_url?} → returns sighting |
| GET | `/api/sightings` | List user's sightings (requires auth) → returns array |
| GET | `/api/sightings/:id` | Get sighting details (requires auth + ownership) |
| PATCH | `/api/sightings/:id` | Update sighting {animal_name?, location?, photo_url?} |
| DELETE | `/api/sightings/:id` | Delete sighting (soft delete) → returns 204 No Content |

### Photo Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/photo` | Upload photo (multipart) → returns {photo_url, photo_format, photo_size_bytes} |

### Documentation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Swagger UI (interactive API docs) |
| GET | `/openapi.json` | OpenAPI 3.1 schema |

---

## Common Issues & Troubleshooting

### Issue: "D1 database not found"

**Solution**: Run migrations:
```bash
wrangler d1 execute sighting-dev --file cloudflare-worker/src/db/migrations/001_init.sql --local
```

### Issue: "Cannot find module 'Zod' / auth middleware"

**Solution**: Install dependencies:
```bash
cd cloudflare-worker
pnpm install
```

### Issue: Frontend shows "API not responding"

**Solution**: Ensure backend running:
```bash
# In terminal running backend
pnpm dev
# Should output: 👂 Listening on http://localhost:8787
```

### Issue: Photo upload fails or times out

**Solution**: Ensure photo is <2MB and in valid format (JPEG/PNG/WebP). Check browser FileReader API support. For debugging, add console logs to SightingForm component to verify base64 conversion succeeds.

### Issue: Session expires too quickly

**Solution**: Check KV binding and TTL in `auth.ts`:
```typescript
const sessionTTL = 7 * 24 * 60 * 60; // 7 days in seconds
await SESSIONS.put(sessionId, JSON.stringify(session), { expirationTtl: sessionTTL });
```

---

## Performance Verification

### Bundle Size Check

```bash
cd solidjs
pnpm build

# Check dist/index.js size
ls -lh dist/index.js

# Should be <500KB
```

### API Response Time

Using curl:

```bash
# Sign-in (target: <500ms)
time curl -X POST http://localhost:8787/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123!"}'

# List sightings (target: <100ms)
time curl http://localhost:8787/api/sightings \
  -H "Cookie: session=YOUR_SESSION_ID"
```

### Lighthouse Accessibility Score

```bash
# Build frontend
cd solidjs
pnpm build
pnpm preview

# In another terminal, run Lighthouse
npm install -g lighthouse
lighthouse http://localhost:4173/ --chrome-flags="--headless=new"

# Check accessibility score (target: ≥90)
```

---

## Next Steps

1. **Implement Backend** (Phase 2 Tasks):
   - Create auth endpoints (signup, signin, signout)
   - Implement sighting CRUD endpoints with base64 photo handling

2. **Implement Frontend** (Phase 2 Tasks):
   - Create authentication UI components (SignUp, SignIn)
   - Create sighting management components (Form, Dashboard, Card) with FileReader for photo → base64 conversion
   - Wire up API calls in services layer

3. **Testing** (Optional per constitution):
   - Manual testing via Swagger UI
   - Integration testing via API client (e.g., Postman, Bruno)
   - Accessibility testing via Lighthouse

4. **Deployment**:
   - Deploy backend: `wrangler deploy --env production`
   - Deploy frontend: Build and push to CDN or static host
   - Configure D1 production database

---

**Setup Verification**: ✅ All prerequisites met?

```bash
# Run this to verify all tools installed
node --version         # Should be v18+
pnpm --version        # Should be v8+
git --version         # Should be v2.x+
wrangler --version    # Should be v4.x+
```

If all commands show version info, you're ready to proceed!

---

**Quickstart Status**: Ready | **Last Updated**: 2026-02-04
