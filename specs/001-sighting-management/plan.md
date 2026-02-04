# Implementation Plan: Sighting Management System

**Branch**: `001-sighting-management` | **Date**: 2026-02-04 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-sighting-management/spec.md`

## Summary

Implement a complete wildlife sighting management platform with user authentication, CRUD operations for sightings, photo upload, and personalized dashboards. The system enables wildlife enthusiasts to document animal observations with location and timestamps, manage their records, and maintain a digital wildlife journal. Core MVP delivers email/password authentication, single-photo sighting creation/editing, and dashboard list view with sorting and deletion.

**Primary Requirements**:
- User authentication: email/password sign-up and sign-in with session persistence
- Sighting creation: form with animal name, location, auto-timestamp, optional photo (JPEG/PNG/WebP, max 5MB)
- Dashboard: list user's sightings sorted by date (newest first) with edit/delete capabilities
- Navigation: persistent "Add Sighting" button with auth-aware routing
- Validation: form field validation with clear, positioned error messages
- UX: loading states for async operations, empty state guidance, accessibility (WCAG AA ≥90)

---

## Technical Context

**Language/Version**: TypeScript 5.x (frontend & backend), Node.js 18+ runtime (Cloudflare Workers)  
**Primary Dependencies**:
- Frontend: SolidJS 1.x + Vite 7.x for bundling and HMR
- Backend: Cloudflare Workers (Hono 4.x + Chanfana 2.x for OpenAPI)
- Database: Cloudflare D1 (SQLite edge database)
- Auth: Session-based (HTTP-only cookies via Workers KV for session store)
- Storage: Cloudflare R2 (object storage for photo uploads)

**Storage**: Cloudflare D1 SQLite database (users, sightings tables)  
**Testing**: Tests NOT created per constitution (Testing Expectations section)  
**Target Platform**: Web browser + Cloudflare edge infrastructure (workers + D1 + R2)  
**Project Type**: Full-stack web application (frontend + backend)  
**Performance Goals**:
- Sign-in: 95% complete within 500ms
- Dashboard load: <1 second
- Form validation: <100ms response
- Photo upload: <2 seconds for 5MB on 3G

**Constraints**:
- End-to-end workflow: <3 minutes (sign-up → sign-in → create sighting → view dashboard)
- Frontend bundle: ≤500KB gzipped
- API response: p95 <200ms
- Accessibility: ≥90 Lighthouse score
- FCP: ≤1.5s on 3G network

**Scale/Scope**: MVP for 100-1000 concurrent users; single tenant per session; unlimited sightings per user (pagination deferred to P2)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Type Safety First**: All TypeScript in strict mode; Zod schemas for API validation (backend endpoints validate requests/responses)
- [x] **Component-Driven UI**: Frontend components follow `comp.jsx` + `style.css` co-location pattern (NavBar, SignIn, SignUp, SightingForm, Dashboard, Card)
- [x] **API Contract Integrity**: OpenAPI 3.1 schema defined via Chanfana; semantic versioning (v1.0.0); breaking changes require MAJOR bump
- [x] **UX Consistency**: Interactive elements have visual feedback (hover/focus states); forms validate with error messages positioned near fields; loading indicators shown
- [x] **Progressive Enhancement**: Core homepage renders without JavaScript; sighting form submits via standard multipart/form-data HTTP POST; auth via secure cookies
- [x] **Developer Simplicity**: Zero external dependencies beyond SolidJS/Hono (no additional frameworks); config files documented; one-command setup: `pnpm install && pnpm dev`

**All gates PASS** - No violations. No complexity tracking needed.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-sighting-management/
├── spec.md                          # Feature specification (user stories, requirements)
├── plan.md                          # This file (architecture, data model, contracts outline)
├── research.md                      # Phase 0 output (tech decisions documented)
├── data-model.md                    # Phase 1 output (database schema)
├── quickstart.md                    # Phase 1 output (setup and running guide)
├── contracts/                       # Phase 1 output (OpenAPI endpoints)
│   ├── auth.openapi.json           # Sign-up, sign-in, sign-out endpoints
│   └── sightings.openapi.json      # CRUD sightings, list, photo upload
├── checklists/
│   └── requirements.md              # Specification quality checklist
└── tasks.md                         # Phase 2 output (implementation tasks)
```

### Source Code (repository root)

```text
cloudflare-worker/
├── src/
│   ├── index.ts                     # Hono app setup, OpenAPI registry, route definitions
│   ├── types.ts                     # Shared types (User, Sighting, API responses)
│   └── endpoints/
│       ├── auth/
│       │   ├── signup.ts            # POST /api/auth/signup
│       │   ├── signin.ts            # POST /api/auth/signin
│       │   └── signout.ts           # POST /api/auth/signout
│       ├── sightings/
│       │   ├── create.ts            # POST /api/sightings (with photo upload)
│       │   ├── list.ts              # GET /api/sightings
│       │   ├── get.ts               # GET /api/sightings/:id
│       │   ├── update.ts            # PATCH /api/sightings/:id
│       │   └── delete.ts            # DELETE /api/sightings/:id
│       └── upload/
│           └── photo.ts             # POST /api/upload/photo (returns signed R2 URL)
├── middleware/
│   ├── auth.ts                      # Session verification middleware
│   └── validation.ts                # Request validation (Zod schemas)
├── db/
│   ├── schema.ts                    # D1 schema definitions (users, sightings tables)
│   └── migrations/
│       ├── 001_init.sql             # Create users, sightings tables
│       └── 002_add_soft_delete.sql  # Add deleted_at column
└── wrangler.jsonc                   # Workers config (D1 binding, R2 binding, KV binding)

solidjs/
├── src/
│   ├── index.jsx                    # Entry point, App wrapper, routing setup
│   ├── styles.css                   # Global styles (design system, spacing grid)
│   ├── components/
│   │   ├── Navbar/
│   │   │   ├── comp.jsx             # Nav bar with "Add Sighting" button
│   │   │   └── style.css
│   │   ├── SignUp/
│   │   │   ├── comp.jsx             # Sign-up form (email, password validation)
│   │   │   └── style.css
│   │   ├── SignIn/
│   │   │   ├── comp.jsx             # Sign-in form (email, password)
│   │   │   └── style.css
│   │   ├── SightingForm/
│   │   │   ├── comp.jsx             # Create/edit sighting form (animal, location, photo)
│   │   │   └── style.css
│   │   ├── Dashboard/
│   │   │   ├── comp.jsx             # User's sightings list with edit/delete
│   │   │   └── style.css
│   │   ├── SightingCard/
│   │   │   ├── comp.jsx             # Sighting list item (thumbnail, details, actions)
│   │   │   └── style.css
│   │   ├── LoadingSpinner/
│   │   │   ├── comp.jsx             # Reusable loading indicator
│   │   │   └── style.css
│   │   └── ErrorBoundary/
│   │       └── comp.jsx             # Error handling wrapper
│   ├── pages/
│   │   ├── Home.jsx                 # Public homepage (hero, features, CTA)
│   │   ├── Auth.jsx                 # Sign-in/Sign-up page wrapper
│   │   ├── CreateSighting.jsx       # Create sighting page
│   │   └── UserDashboard.jsx        # User dashboard page
│   └── services/
│       ├── api.js                   # API client functions (fetch with error handling)
│       ├── auth.js                  # Auth service (login, logout, session check)
│       ├── sightings.js             # Sightings service (CRUD API calls)
│       └── storage.js               # Local storage helpers (session, form state)
├── vite.config.js                   # Vite config with SolidJS plugin
└── jsconfig.json                    # JS config (paths, strict mode)
```

**Structure Decision**: 

This structure implements the specified tech stack with clear separation of concerns:

**Frontend (SolidJS)**:
- Components co-located with styles following constitution principle II (Component-Driven UI)
- Pages layer separate from reusable components (home, auth, dashboard, create sighting)
- Services layer for API communication and auth state management (no business logic in components)
- Global styles with 4px/8px grid system for consistency (constitution principle IV)

**Backend (Cloudflare Workers)**:
- Endpoints organized by feature (auth, sightings, upload) with individual handler files
- Middleware layer for auth verification and request validation (Zod schemas per constitution principle I)
- DB schema separate from logic; migrations tracked for reproducibility
- Types file shared between endpoints for consistency

**Database (D1)**:
- SQLite backend provides local development experience without requiring PostgreSQL
- Schema version-controlled via migration files
- Soft deletes tracked via deleted_at column (audit trail per spec assumption #7)

**Storage (R2)**:
- Photos uploaded to R2 with signed URLs returned to frontend
- Metadata (size, format, timestamp) stored in sightings table
- Cleanup of orphaned R2 objects on sighting deletion (deferred to P2)

---

## Technology Decisions & Rationale

### Why This Stack?

**SolidJS (frontend)**:
- Fine-grained reactivity without virtual DOM overhead → faster rendering
- JSX syntax identical to React (easier onboarding for React developers)
- Small bundle size (~10KB gzipped) fits within 500KB constraint
- Built-in scoped styling support aligns with component co-location requirement

**Cloudflare Workers (backend)**:
- Zero cold-start serverless compute at edge → <200ms response times
- Integrated with D1, R2, and KV (no external service dependencies)
- TypeScript support with strict mode enabled
- OpenAPI support via Chanfana for contract-first development

**Cloudflare D1 (database)**:
- SQLite edge database eliminates query latency vs. central PostgreSQL
- Integrated with Workers (KV for session store)
- Local development with Wrangler CLI (same schema as production)
- Supports transactions for session management

**Session-Based Auth (not JWT)**:
- Per constitution assumption #5: HTTP-only cookies prevent XSS token theft
- Session state in KV allows server-side invalidation (sign-out)
- Simpler for MVP than JWT refresh token rotation

### Dependencies (Minimal)

**Frontend**:
- SolidJS (core framework)
- Vite (build tool, already in repo)
- No additional form libraries (native HTML + validation)
- No state management library (SolidJS reactivity sufficient)
- No HTTP client library (native fetch)

**Backend**:
- Hono (web framework, already in repo)
- Chanfana (OpenAPI decorator, already in repo)
- Zod (schema validation, already in repo)
- @cloudflare/workers-types (TypeScript types)

**Rationale**: Constitution principle VI (Developer Simplicity) - no duplicating existing dependencies, leverage what's already installed.

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Photo upload size validation fails client-side | Implement server-side size check in upload endpoint; return 413 Payload Too Large if exceeded |
| Session expires during sighting edit | Catch 401 Unauthorized on save; prompt user to sign-in and preserve form data in localStorage |
| D1 migration fails in production | Test migrations locally with Wrangler first; version migrations sequentially (001_, 002_, etc.) |
| Frontend bundle exceeds 500KB | Use Vite analyze plugin to identify large dependencies; tree-shake unused code |
| Photo upload to R2 fails | Return 502 Bad Gateway; log to Workers Analytics; notify user with retry button |
| Race condition on sighting deletion | Use PATCH with optimistic locking (updated_at timestamp); return 409 Conflict if stale |

---

## Data Flow Overview

### Authentication Flow

1. User signs up: POST `/api/auth/signup` {email, password} → D1 INSERT users → session created in KV → HTTP-only cookie set
2. User signs in: POST `/api/auth/signin` {email, password} → bcryptjs hash verify → session created → cookie set
3. User signs out: POST `/api/auth/signout` → session deleted from KV → cookie cleared
4. Session validation: All requests check middleware → verify cookie in KV → attach user_id to request context

### Sighting CRUD Flow

1. **Create**: User submits form → POST `/api/sightings` with multipart photo file → validate auth, fields, file size → store in R2 → INSERT sightings row → return sighting object
2. **Read**: GET `/api/sightings/:id` → verify user_id matches owner → return sighting + signed R2 URL for photo
3. **List**: GET `/api/sightings` → verify auth → query D1 WHERE user_id = ? AND deleted_at IS NULL → sort by created_at DESC → return paginated array
4. **Update**: PATCH `/api/sightings/:id` with optional new photo → verify ownership + updated_at not stale → UPDATE row → if new photo, delete old R2 object
5. **Delete**: DELETE `/api/sightings/:id` → verify ownership → PATCH row SET deleted_at = NOW() (soft delete) → return 204 No Content

### Photo Upload Flow

1. User selects file → SolidJS form component validates (JPEG/PNG/WebP, <5MB)
2. Submit → POST `/api/upload/photo` with file → backend validates again → upload to R2 → return signed URL (10 min expiry)
3. Signed URL included in sighting creation payload
4. After sighting created, R2 object persists; if sighting deleted, schedule R2 object cleanup (P2)

---

## Performance Strategy

**Frontend**:
- Code-split sightings routes: Dashboard, CreateSighting, EditSighting components lazy-loaded
- Image thumbnail optimization: Use CloudFlare Image Optimization API on signed R2 URLs (resize to 300px for list view)
- Caching: localStorage for session token; IndexedDB for offline-first draft sightings (P2)

**Backend**:
- D1 query optimization: Indexes on (user_id, deleted_at) for list queries; (id, user_id) for ownership checks
- R2 signed URLs cached in-memory for 5 minutes (signature valid 10 min, refreshed at 5 min mark)
- Gzip response bodies for JSON (Hono handles automatically)

**Monitoring**:
- Workers Analytics Engine logs: request latency, error rates, 5xx occurrences
- D1 query logs: slow query detection (>50ms queries)
- R2 analytics: upload/download bandwidth, object count

---

## Next Steps (Phases)

**Phase 0 (Research)**: Generate `research.md` documenting tech stack rationale, Cloudflare platform capabilities, bcryptjs password hashing, session security patterns. *(Placeholder - research.md auto-generated)*

**Phase 1 (Design)**:
1. Generate `data-model.md` with D1 schema (users, sightings, migrations)
2. Generate API contracts in `contracts/` folder (auth.openapi.json, sightings.openapi.json)
3. Generate `quickstart.md` with setup instructions and running locally
4. Update agent context (copy into `.specify/memory/agent-context-copilot.md` if applicable)

**Phase 2 (Tasks)**:
1. Generate `tasks.md` with implementation tasks organized by user story
2. Begin development following task sequence (Phase 1 setup → Phase 2 foundational → Phase 3+ user stories)

---

**Version**: 1.0.0 | **Created**: 2026-02-04 | **Status**: Ready for Phase 0 Research
