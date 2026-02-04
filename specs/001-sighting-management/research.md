# Research Summary: Sighting Management System

**Feature**: `001-sighting-management`  
**Created**: 2026-02-04  
**Purpose**: Document technology stack decisions and research findings

---

## Tech Stack Overview

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend Language | JavaScript (JSDoc type hints) | Simplicity, smaller bundle, no TypeScript compilation step needed for SolidJS |
| Frontend Framework | SolidJS 1.x + Vite 7.x | Fine-grained reactivity, small bundle size (~10KB), existing in repo |
| Backend Language | TypeScript 5.x | Type safety, contract validation, tooling support for Cloudflare Workers |
| Backend Framework | Cloudflare Workers + Hono 4.x | Zero cold-start edge compute, integrated platform, existing in repo |
| Database | Cloudflare D1 (SQLite) | Edge database, local dev experience, integrated with Workers |
| Session Store | Cloudflare KV | Fast (<10ms), auto-expiring keys, prevents centralized DB queries |
| Photo Storage | Cloudflare R2 | Object storage, signed URLs, integrated with Workers |
| Auth Method | Session-based (HTTP-only cookies) | Simple, XSS-resistant, server-side invalidation on sign-out |
| Password Hashing | bcryptjs (cost 12) | Industry standard, ~250ms per hash, prevents rainbow tables |
| API Framework | Chanfana 2.x (OpenAPI on Hono) | Contract-first development, auto-validates requests, existing in repo |
| Validation | Zod (backend) | TypeScript-first schemas, compile-time safety, minimal overhead |

---

## Frontend: SolidJS + JavaScript Decision

### Why SolidJS with JavaScript (not TypeScript)?

**Strengths**:
- **Fine-Grained Reactivity**: No virtual DOM overhead. Updates are surgical (only changed elements re-render).
- **Small Bundle**: ~10KB gzipped core. With Vite tree-shaking, our bundle target is <500KB (currently plenty of headroom).
- **JSX Syntax**: Identical to React. Lower onboarding friction for React developers.
- **JavaScript Simplicity**: No TypeScript compilation step, faster development iteration, JSDoc provides type hints where needed
- **Existing in Repo**: SolidJS already installed; reduces decision complexity and setup time.
- **Built-in Scoped Styles**: CSS modules support via Vite aligns with component co-location requirement.

**Weaknesses** (acceptable):
- Smaller ecosystem than React (but all needed libraries available: routing, state management via context)
- Smaller community (but sufficient documentation and examples for MVP)
- No compile-time type checking in frontend (mitigated by JSDoc comments and IDE intellisense)

### JavaScript vs TypeScript for Frontend

**Why JavaScript (not TypeScript)?**:
- ✅ Smaller bundle: JavaScript source has no type annotations to strip
- ✅ Faster feedback loop: No compilation step; Vite dev server updates instantly
- ✅ Simpler onboarding: JSDoc type hints are optional and lightweight
- ✅ Existing ecosystem patterns: SolidJS community uses JavaScript heavily
- ❌ Trade-off: No compile-time type safety (mitigated by JSDoc + IDE type hints)

**JSDoc Type Hints** (recommended for critical paths):
```javascript
/** @type {import('./types').Sighting} */
const sighting = await fetchSighting(id);

/**
 * Create a new sighting
 * @param {string} animalName - Name of the animal
 * @param {string} location - Location where spotted
 * @returns {Promise<{success: boolean, id: string}>}
 */
async function createSighting(animalName, location) { ... }
```

### Alternatives Considered for Frontend

**React + TypeScript**:
- ✅ Massive ecosystem, type safety
- ❌ Larger bundle (~40KB + React DOM) + state management overhead
- ❌ Virtual DOM overhead for frequent updates
- ❌ Overkill for MVP scope

**Vue 3 + TypeScript**:
- ✅ Excellent documentation and ecosystem
- ❌ Options API learning curve different from existing codebase
- ❌ Template syntax (not JSX) requires different mental model

**Plain HTML/JavaScript**:
- ❌ No reactive data binding; manual DOM manipulation is error-prone
- ❌ No component system; leads to code duplication

**Decision**: **SolidJS + JavaScript** balances performance, bundle size, and developer experience for MVP. Backend TypeScript (next section) provides strict type safety where it matters most (API contracts, data models).

---

## Backend: Cloudflare Workers + TypeScript Decision

### Why Cloudflare Workers with TypeScript?

**Strengths**:
- **Zero Cold-Start**: Runs on edge infrastructure globally. Request comes in → function runs immediately (no Lambda cold-start penalty).
- **Integrated Ecosystem**: D1 (database) + R2 (storage) + KV (cache/sessions) + Analytics Engine in same platform.
- **TypeScript Support**: Full TypeScript support with strict mode enforcement. Critical for API contract safety (Zod + Chanfana).
- **Existing in Repo**: Project already uses Wrangler, Chanfana, Hono.
- **Cost Effective**: Free tier includes 100k requests/day; pay-as-you-go thereafter (fractions of $).
- **DX**: Rapid feedback loop with `wrangler dev` for local development.

**Why TypeScript for Backend (not JavaScript)?**:
- ✅ Compile-time API contract validation (Zod schemas, Chanfana decorators)
- ✅ Type-safe database operations (D1 bindings with typed results)
- ✅ Static analysis catches bugs before runtime
- ✅ IDE support for complex middleware chains
- ✅ Chanfana OpenAPI framework designed for TypeScript
- ❌ Trade-off: One extra build step (TypeScript → JavaScript), but Wrangler handles transparently

**Weaknesses** (acceptable):
- Vendor lock-in to Cloudflare (mitigated by standard Node.js/Express-like framework with Hono)
- CPU time limits (~50ms for free tier) require efficient code
- No direct filesystem access (appropriate for stateless API design)

### Alternatives Considered

**AWS Lambda + API Gateway**:
- ✅ Mature, widely used, large ecosystem
- ❌ Cold-start latency (100-500ms), more complex setup
- ❌ Separate services for auth, storage, database (DynamoDB, S3, RDS)
- ❌ Higher operational overhead and cost for MVP

**Node.js Server (self-hosted)**:
- ❌ Requires infrastructure management (server costs, scaling, monitoring)
- ❌ Not suitable for edge deployment
- ✅ Familiar for many developers

**Google Cloud Run**:
- ✅ Serverless, auto-scaling
- ❌ Cold-start latency (2-5s)
- ❌ Separate services for storage (Cloud Storage), database (Cloud Firestore)

**Decision**: **Cloudflare Workers** minimizes operational burden and latency for MVP. Platform integration reduces setup complexity.

---

## Database: Cloudflare D1 Decision

### Why Cloudflare D1 (SQLite)?

**Strengths**:
- **Edge Compute**: Colocated with Workers. Query latency ~50-100ms (vs. 200-500ms for central PostgreSQL).
- **Local Development**: Wrangler CLI creates local SQLite for identical prod/dev experience.
- **No Ops**: Cloudflare handles backups, scaling, replication. No database server management.
- **ACID Transactions**: Full transaction support for sighting deletion + R2 cleanup (when implemented).
- **Integrated with KV**: Shares auth context with Worker request.
- **SQL Skills**: Developers familiar with PostgreSQL/MySQL can work with D1 SQLite dialect with minor adjustments.

**Weaknesses** (acceptable):
- SQLite not ideal for massive concurrency (100+ concurrent writers), but MVP targets 100-1000 users
- Per-region replication requires workarounds (P2 feature)
- No built-in full-text search (can implement via triggers/FTS5 in D1)

### Alternatives Considered

**PostgreSQL (self-hosted)**:
- ✅ Mature, powerful, industry standard
- ❌ Requires database server infrastructure (or managed service like Heroku)
- ❌ Query latency from edge Workers to central database (200-500ms)
- ❌ Higher operational overhead

**Supabase (PostgreSQL SaaS)**:
- ✅ Easy setup, Postgres power, good DX
- ❌ External service (Workers → HTTPS → Supabase adds latency)
- ❌ Potential data residency issues (P2)

**Firebase/Firestore**:
- ✅ Realtime database, simple API
- ❌ Vendor lock-in to Google Cloud
- ❌ Pricing can escalate quickly
- ❌ NoSQL model not ideal for relational data (users ↔ sightings)

**Decision**: **Cloudflare D1** aligns with Workers deployment model and meets MVP scale requirements without operational overhead.

---

## Session Management: KV + HTTP-Only Cookies Decision

### Why KV + Cookies (not JWT)?

**JWT Concerns**:
- Token stored in localStorage → XSS attack can steal token and make requests as user
- Revocation is difficult (token valid until expiry)
- Token refresh complexity (refresh tokens, access tokens, rotation)

**KV + HTTP-Only Cookies Benefits**:
- HTTP-Only flag prevents JavaScript access (XSS-safe)
- Secure flag ensures HTTPS-only transmission
- SameSite=Strict prevents CSRF attacks
- Server-side session invalidation on sign-out (immediate effect)
- Simple session lifecycle (create on sign-in, delete on sign-out)

### Session Storage Details

**Session Format** (in KV):
```json
{
  "user_id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "created_at": 1707000000,
  "expires_at": 1707604800
}
```

**KV Expiration**: 7 days (604800 seconds)
- KV automatically deletes expired sessions
- Session refresh on each sign-in extends expiry

**Cookie Headers**:
```
Set-Cookie: session={sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

**Security Properties**:
- `HttpOnly`: JavaScript cannot read cookie (prevents XSS token theft)
- `Secure`: Only sent over HTTPS (prevents MITM)
- `SameSite=Strict`: Not sent in cross-site requests (prevents CSRF)
- `Max-Age=604800`: Browser deletes after 7 days (matches KV TTL)

### Alternatives Considered

**JWT in localStorage**:
- ❌ XSS vulnerability (attacker steals token)
- ❌ No server-side revocation

**JWT in HTTP-Only Cookie** (hybrid):
- ✅ More secure than localStorage
- ❌ Refresh token complexity
- ❌ Revocation still difficult

**Decision**: **KV + HTTP-Only Cookies** provides optimal security (XSS-resistant, CSRF-resistant, revocable) with simplicity.

---

## Password Hashing: bcryptjs Decision

### Why bcryptjs (cost 12)?

**Bcrypt Strengths**:
- **Adaptive Hashing**: Cost parameter (12) means hashing takes ~250ms. Slows brute-force attacks.
- **Salting**: Automatic per-hash salt prevents rainbow tables.
- **Industry Standard**: Used by major platforms (GitHub, Stripe, etc.)
- **JavaScript Implementation**: No native dependency (pure JS).

**Cost 12 Justification**:
- Cost 10 = ~100ms per hash (too fast for modern GPUs)
- Cost 12 = ~250ms per hash (good balance: acceptable UX, slows attacks)
- Cost 14+ = >1s per hash (degrades sign-up/sign-in UX)

### Hashing Process

1. User signs up: `bcrypt.hash(password, 12)` → takes 250ms → 60-char hash stored in D1
2. User signs in: `bcrypt.compare(password, storedHash)` → takes 250ms → constant-time comparison (prevents timing attacks)
3. Hash never transmitted; only compared server-side

### Alternatives Considered

**PBKDF2**:
- ✅ Standard algorithm
- ❌ Less resistant to GPU brute-force (needs higher iterations)
- ❌ More complex to configure

**Argon2**:
- ✅ Modern, winner of Password Hashing Competition
- ❌ Requires native C binding (additional build complexity)
- ❌ Slower in JavaScript (not available in pure JS)

**scrypt**:
- ✅ Good security properties
- ❌ Slower than bcrypt (not necessary for MVP)

**Decision**: **bcryptjs (cost 12)** balances security and UX for MVP.

---

## API Validation: Zod Decision

### Why Zod?

**Strengths**:
- **TypeScript-First**: Schemas generate TypeScript types automatically (single source of truth).
- **Composable**: Define reusable schema pieces (common patterns like email, password strength).
- **Detailed Errors**: Validation errors include field path, code, and message.
- **Runtime Safety**: Validates at API boundary (frontend can't trick backend validation).
- **Lightweight**: ~14KB gzipped; minimal overhead.

**Integration with Chanfana**:
```typescript
// In endpoint handler
const SignUpRequest = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  confirmPassword: z.string()
});

// Chanfana auto-validates request against schema
// Returns 400 with detailed errors if validation fails
```

### Alternatives Considered

**joi**:
- ✅ Powerful, detailed errors
- ❌ Larger bundle (~20KB)
- ❌ Not as TypeScript-friendly

**Simple regex validation**:
- ❌ No type safety
- ❌ Error messages less helpful
- ❌ Harder to maintain complex validation rules

**Decision**: **Zod** provides type safety and excellent developer experience with minimal bundle cost.

---

## Photo Storage: Base64 Data URL in Database Decision

### Why Base64 Data URLs (not object storage)?

**Simplified Architecture**:
- **Single Endpoint**: POST /api/sightings includes photo data in request body (no separate upload endpoint)
- **Atomic Writes**: Photo and metadata stored in same database row (no orphaned files possible)
- **Easier Testing**: Photos included in test fixtures without external dependencies
- **Frontend Responsibility**: Browser handles file → base64 conversion (CPU shift from server)

**Trade-offs Accepted**:
- **Data Size**: Base64 encoding increases size ~33% (1.33x original). 2MB photo → ~2.6MB base64 string in database
- **Query Performance**: Large BLOB data in result sets (mitigated by explicit SELECT columns in queries)
- **Bandwidth**: All photo data travels through HTTP request/response (vs. separate download stream)

**Why 2MB Limit**:
- Balances reasonable wildlife photo quality with database row size
- 2MB original → ~2.6MB base64 string; keeps individual records ≤3MB
- Database row limits (SQLite): typically ≥10MB practical limit, but smaller rows = faster queries
- D1 pricing: $0.50/10GB/month; at 2.6MB average, storage cost negligible vs. complexity reduction

### Photo Handling Flow (Frontend → Backend)

1. Browser user selects image file (JPEG/PNG/WebP, client validates <2MB)
2. Frontend uses FileReader API to convert File → base64 string: `data:image/jpeg;base64,/9j/4AAQSkZJ...`
3. POST /api/sightings with photo_url field set to base64 data URL string
4. Backend validates: base64 string length ≤3MB, format matches `data:image/*;base64,...`
5. Backend stores photo_url directly in sightings table
6. Frontend displays photo by setting `<img src={photoUrl}>` (browsers natively support data: URLs)

### Alternatives Considered

**Cloudflare R2 with Signed URLs** (original design):
- ✅ Keeps database lean; scales to terabytes
- ✅ Separate upload stream (better performance on mobile)
- ✅ CDN edge caching of photos
- ❌ Requires separate endpoint (two API calls)
- ❌ Risk of orphaned objects if sighting deleted before upload completes
- ❌ Adds R2 operational complexity (bucket config, TTL cleanup, cleanup costs)
- **Rejected for MVP**: Unnecessary complexity when single atomic endpoint works

**AWS S3 Pre-Signed URLs**:
- ✅ Industry standard
- ❌ Requires AWS account setup beyond Cloudflare ecosystem

**Firebase Cloud Storage**:
- ✅ Integrated auth
- ❌ Requires Google account (mismatch with email/password auth)

**Decision**: **Base64 data URLs in D1** for MVP simplicity + atomicity. Future: migrate to R2 if storage volume justifies (P2 enhancement).

---

## API Documentation: OpenAPI 3.1 via Chanfana

### Why OpenAPI?

**Benefits**:
- **Contract-First Development**: Define endpoints before coding implementation
- **Auto-Documentation**: Swagger UI generated automatically from schema
- **Validation**: Chanfana decorators validate all incoming requests against schema
- **Client Generation**: OpenAPI schema can generate client SDKs (P2)
- **Versioning**: Schema versions match API versions (breaking changes → MAJOR version bump)

### Versioning Strategy

**Current Version**: 1.0.0
- New endpoints or non-breaking field additions → MINOR version (1.1.0)
- Breaking changes (removed fields, type changes) → MAJOR version (2.0.0)
- Bug fixes or clarifications → PATCH version (1.0.1)

**Example Changes**:
- Add `tags` field to sightings: 1.0.0 → 1.1.0 ✅ (additive, backward-compatible)
- Rename `location` to `place`: 1.0.0 → 2.0.0 (breaking, requires client updates)
- Fix typo in error message: 1.0.0 → 1.0.1 (no schema change)

---

## Development Workflow

### Local Development

1. **Clone + Install**:
   ```bash
   git clone ...
   npm install
   ```

2. **Start Services**:
   ```bash
   # Terminal 1
   cd cloudflare-worker && npm dev

   # Terminal 2
   cd solidjs && npm dev
   ```

3. **Access Applications**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8787
   - Swagger: http://localhost:8787/

4. **Development Loop**:
   - Modify backend code → Wrangler auto-reloads
   - Modify frontend code → Vite HMR auto-reloads browser
   - View errors in console immediately

### Deployment Strategy

**Backend**:
```bash
cd cloudflare-worker
wrangler deploy --env production
```

**Frontend**:
```bash
cd solidjs
npm build                          # Generates dist/
wrangler pages deploy dist/         # Deploy to Cloudflare Pages
```

---

## Performance Targets & Monitoring

### Performance Targets (from spec)

| Metric | Target | Implementation Strategy |
|--------|--------|--------------------------|
| Sign-in | 95% < 500ms | KV session lookup (~10ms) + bcryptjs verify (~250ms) + D1 query (~50ms) = ~310ms |
| Dashboard load | <1s | D1 index on (user_id, deleted_at) + sort by created_at DESC |
| Form validation | <100ms | Zod schema validation runs synchronously in Worker (sub-10ms) |
| Photo upload | <2s on 3G | R2 upload is async; UI shows progress spinner |
| FCP | ≤1.5s on 3G | Vite code-splitting, lazy-load sighting routes, minification |
| Accessibility | ≥90 | ARIA labels, semantic HTML, keyboard navigation |
| Bundle size | ≤500KB | Vite tree-shaking, SolidJS (~10KB) + component code (~200KB) + libraries (~50KB) |

### Monitoring Strategy

**Workers Analytics Engine**:
- Request latency histogram (p50, p95, p99)
- Error rates by endpoint
- CPU time distribution

**D1 Metrics** (manual):
- Slow query logs (>50ms queries)
- Index usage

**Frontend Monitoring** (P2):
- Web Vitals (CLS, LCP, FID) via analytics library
- Error tracking via Sentry or similar

---

## Future Enhancements (P2+)

- **Password Reset**: Implement forgot password flow with email verification
- **OAuth2**: Add social sign-in (GitHub, Google)
- **Full-Text Search**: SQLite FTS5 for searching sightings
- **Pagination**: Cursor-based pagination for large sighting lists
- **Image Optimization**: Resize photos to multiple sizes (thumbnail, medium, full)
- **Geolocation**: Automatic geocoding of manual location strings
- **User Profiles**: Public profile pages showing user's sightings
- **Sighting Comments**: Community engagement feature
- **Mobile App**: Native iOS/Android apps using same APIs
- **Real-Time Notifications**: WebSocket updates when new sightings in user's area
- **Rate Limiting**: Prevent abuse of auth endpoints

---

## Conclusion

The selected tech stack prioritizes:
1. **Developer Experience**: Minimal setup, rapid feedback, existing tools
2. **Performance**: Edge compute (Workers), edge database (D1), no cold-start
3. **Security**: HTTP-only cookies, bcryptjs hashing, CORS/SameSite protection
4. **Simplicity**: Integrated platform (no juggling 5 vendors), small dependencies
5. **Scalability**: Designed to grow from 100 to 10k users with minimal changes

All decisions are documented and justified. Alternatives were considered and rationale recorded. The stack is production-ready for MVP launch.

---

**Research Status**: ✅ Complete | **Date**: 2026-02-04
