# Implementation Tasks: Sighting Management System

**Feature**: `001-sighting-management` | **MVP Scope** | **Status**: Ready for Development  
**Feature Branch**: `001-sighting-management`  
**Tech Stack**: SolidJS (JavaScript frontend) + Cloudflare Workers (TypeScript backend) + D1 SQLite  
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Data Model**: [data-model.md](data-model.md)

---

## Overview

This document contains all implementation tasks for the Sighting Management System MVP. Tasks are organized by phase (Setup → Foundational → User Stories → Polish) and marked with execution strategy indicators.

**Execution Strategy**: 
- **[P]** = Parallelizable (can run simultaneously with other [P] tasks in same phase)
- **[US1/US2/US3/US4]** = Associated user story
- Sequential dependencies shown in "Phase Dependencies" section

**MVP Scope**: All user stories (US1-4) are P1 priority and included in MVP.  
**Total Tasks**: 67 tasks across 6 phases

---

## Phase Dependencies & Execution Order

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational Prerequisites)
    ├→ Phase 3 (US1: Authentication)
    ├→ Phase 4 (US2: Create Sighting) [depends on US1]
    ├→ Phase 5 (US3: Dashboard) [depends on US1]
    └→ Phase 6 (US4: Navigation) [can run parallel with US2-3]
    ↓
Phase 7 (Polish & Cross-Cutting)
```

**Parallel Execution Examples**:
- **US1 & US4 Frontend**: SignUp/SignIn components (US1) can be built in parallel with Navbar (US4)
- **US2 & US3**: SightingForm (US2) and Dashboard (US3) are independent; can build simultaneously
- **Backend Endpoints**: Auth endpoints (US1) and Sightings endpoints (US2-3) are independent files

---

## Phase 1: Project Setup

**Goal**: Initialize project structure, install dependencies, configure tooling  
**Acceptance Criteria**:
- ✅ Both frontend and backend projects initialize with correct dependencies
- ✅ Git feature branch created and committed
- ✅ Environment files configured for local development
- ✅ Build and dev commands verified working

**Tests**: Manual verification of build/dev commands

---

### Setup Tasks

- [ ] T001 Initialize Cloudflare Worker backend project in `cloudflare-worker/` with wrangler, Hono, Chanfana, Zod, bcryptjs
- [ ] T002 Initialize SolidJS frontend project in `solidjs/` with Vite, SolidJS, JSDoc configuration
- [ ] T003 Create git feature branch `001-sighting-management` if not already created, verify branch exists
- [ ] T004 Configure `cloudflare-worker/.env.local` with D1 database ID, KV namespace ID, session TTL settings
- [ ] T005 Configure `solidjs/.env.local` with API_BASE_URL pointing to local Cloudflare Workers dev server
- [ ] T006 Create `cloudflare-worker/wrangler.jsonc` with D1 and KV bindings (remove any R2 references)
- [ ] T007 Create `cloudflare-worker/tsconfig.json` with strict mode enabled (type safety per constitution)
- [ ] T008 Create `solidjs/jsconfig.json` with path aliases for components, pages, services directories
- [ ] T009 Verify `npm install` (or `pnpm install`) runs successfully in both frontend and backend directories
- [ ] T010 Verify `pnpm dev` runs successfully in backend; outputs local worker URL (http://localhost:8787)
- [ ] T011 Verify `pnpm dev` runs successfully in frontend; outputs Vite dev server URL (http://localhost:5173)
- [ ] T012 Commit setup to feature branch with message "setup: initialize backend and frontend projects"

---

## Phase 2: Foundational Infrastructure

**Goal**: Set up database, auth middleware, API client, type definitions  
**Acceptance Criteria**:
- ✅ D1 database migrations run successfully (users, sightings tables created)
- ✅ KV namespace ready for session storage
- ✅ TypeScript types defined for all API request/response schemas
- ✅ Auth middleware validates sessions correctly
- ✅ Frontend API client ready for integration with endpoints

**Tests**: D1 schema verification, middleware unit tests (optional), API client smoke tests

---

### Database & Migration Tasks

- [ ] T013 [P] Create `cloudflare-worker/src/db/schema.ts` with TypeScript definitions for users, sightings, sessions tables (matching D1 schema from data-model.md)
- [ ] T014 [P] Create `cloudflare-worker/src/db/migrations/001_init.sql` with CREATE TABLE statements for users, sightings, indexes per data-model.md
- [ ] T015 [P] Create `cloudflare-worker/src/db/migrations/002_add_soft_delete.sql` (or include in 001_init.sql) to add deleted_at columns
- [ ] T016 [P] Implement D1 migration runner function in `cloudflare-worker/src/db/migrate.ts` to run .sql files in order
- [ ] T017 [P] Verify migrations run on worker startup; test local D1 database has tables with correct schema
- [ ] T018 [P] Create database seeding function (optional for tests) in `cloudflare-worker/src/db/seed.ts` with sample users and sightings

### Type & Schema Definitions

- [ ] T019 [P] Create `cloudflare-worker/src/types.ts` with TypeScript interfaces: User, Sighting, SignupRequest, SigninRequest, CreateSightingRequest, UpdateSightingRequest, ErrorResponse
- [ ] T020 [P] Create Zod schemas in `cloudflare-worker/src/validation/schemas.ts` for: email format, password strength (8+ chars, 1 uppercase), animal_name (1-200 chars), location (1-500 chars), photo_url base64 format validation
- [ ] T021 [P] Create `cloudflare-worker/src/validation/validators.ts` with reusable validation functions: validateEmail(), validatePassword(), validatePhotoUrl()
- [ ] T022 [P] Create `solidjs/src/types.js` (JSDoc) with type definitions for API requests/responses (User, Sighting, form data)

### Auth Middleware & KV Integration

- [ ] T023 [P] Create `cloudflare-worker/src/middleware/auth.ts` with middleware function: getSessionFromCookie(), validateSession(), extractUserIdFromSession()
- [ ] T024 [P] Implement session creation in KV: function setSession(userId, sessionId, ttl) → stores in KV with 7-day expiration
- [ ] T025 [P] Implement session retrieval in KV: function getSession(sessionId) → retrieves from KV, returns user_id or null if expired
- [ ] T026 [P] Implement session deletion in KV: function deleteSession(sessionId) → removes from KV on logout
- [ ] T027 [P] Test auth middleware: verify valid sessions pass, expired sessions reject, missing cookie rejects

### API Client & Services

- [ ] T028 [P] Create `solidjs/src/services/api.js` with fetch-based API client: request(method, endpoint, body), handle errors, return JSON response
- [ ] T029 [P] Create `solidjs/src/services/auth.js` with functions: signup(email, password), signin(email, password), signout(), getCurrentUser(), checkSession()
- [ ] T030 [P] Create `solidjs/src/services/sightings.js` with functions: createSighting(name, location, photoUrl), updateSighting(id, changes), getSighting(id), listSightings(), deleteSighting(id)
- [ ] T031 [P] Create `solidjs/src/services/storage.js` with localStorage helpers: saveSession(token), loadSession(), clearSession(), saveFormDraft(data), loadFormDraft()

### Global Styles & Design System

- [ ] T032 [P] Create `solidjs/src/styles.css` with global styles: reset/normalize, color variables (primary, error, success), spacing grid (4px base, 8px/16px/24px), typography scales, form element defaults
- [ ] T033 [P] Create `solidjs/src/components/ErrorBoundary/comp.jsx` to wrap app and handle uncaught errors gracefully
- [ ] T034 [P] Create `solidjs/src/components/LoadingSpinner/comp.jsx` and `style.css` with animated spinner component (used for async operations)
- [ ] T035 [P] Create `solidjs/src/pages/Home.jsx` with public homepage: hero section, features list, sign-up CTA button

### Routing & App Wrapper

- [ ] T036 [P] Create `solidjs/src/index.jsx` with main app entry point: define routes (/, /signup, /signin, /dashboard, /create-sighting), set up Router, wrap in ErrorBoundary
- [ ] T037 [P] Create routing utility in `solidjs/src/utils/routing.js`: functions redirectToSignin(), redirectToDashboard(), getAuthStatus()
- [ ] T038 [P] Implement protected route wrapper (redirect unauthenticated users to signin): `<ProtectedRoute>`
- [ ] T039 [P] Commit foundational infrastructure to feature branch with message "feat: setup database, auth middleware, API clients, routing"

---

## Phase 3: User Story 1 - User Account Authentication (P1)

**User Story Goal**: Users can sign up with email/password, sign in, maintain session across refreshes, and sign out  
**Independent Test Criteria**:
- ✅ New user can sign up with valid email/password
- ✅ Duplicate email is rejected with error message
- ✅ Weak password is rejected with requirements shown
- ✅ User can sign in with correct credentials
- ✅ Session persists across page refresh
- ✅ User can sign out and session is cleared

**Acceptance Scenarios**: Spec.md User Story 1 (5 scenarios)

---

### Backend: Authentication Endpoints

- [ ] T040 [US1] Create `cloudflare-worker/src/endpoints/auth/signup.ts`: POST /api/auth/signup handler
  - Validates email format (Zod schema)
  - Validates password strength (8+ chars, 1 uppercase, Zod schema)
  - Checks for duplicate email (query D1 users table)
  - Hashes password with bcryptjs (cost 12)
  - Inserts user into D1 users table
  - Returns 201 with user object (id, email, created_at)
  - Error responses: 400 validation, 409 duplicate email, 500 server error

- [ ] T041 [US1] Create `cloudflare-worker/src/endpoints/auth/signin.ts`: POST /api/auth/signin handler
  - Validates email, password format (Zod)
  - Queries D1 for user by email
  - Compares password hash with bcryptjs.compare()
  - Creates session in KV with random sessionId
  - Sets HTTP-only cookie with sessionId
  - Updates last_login_at timestamp in D1
  - Returns 200 with user object (id, email, created_at, last_login_at)
  - Error responses: 400 validation, 401 invalid credentials, 500 server error

- [ ] T042 [US1] Create `cloudflare-worker/src/endpoints/auth/signout.ts`: POST /api/auth/signout handler
  - Validates session from cookie
  - Deletes session from KV
  - Clears HTTP-only cookie (Set-Cookie with max-age=0)
  - Returns 204 No Content or 200 with success message
  - Error responses: 401 not authenticated, 500 server error

- [ ] T043 [US1] Create `cloudflare-worker/src/endpoints/auth/me.ts`: GET /api/auth/me handler
  - Validates session from middleware
  - Queries D1 for current user by user_id
  - Returns 200 with user object
  - Error responses: 401 not authenticated, 500 server error

- [ ] T044 [US1] Create `cloudflare-worker/src/index.ts` main app setup: register auth endpoints with Hono, mount OpenAPI routes, configure CORS

### Frontend: Authentication Components & Forms

- [ ] T045 [US1] [P] Create `solidjs/src/components/SignUp/comp.jsx` with signup form
  - Input fields: email, password, confirmPassword
  - Real-time validation feedback (below each field)
  - Password strength indicator (e.g., "Password strength: Strong")
  - Submit button with loading state (disabled + spinner during submit)
  - Error message display (general + field-specific)
  - Success message on signup
  - Link to sign-in page
  - File: `solidjs/src/components/SignUp/style.css` with form styling

- [ ] T046 [US1] [P] Create `solidjs/src/components/SignIn/comp.jsx` with signin form
  - Input fields: email, password
  - Remember me checkbox (optional, stores email in localStorage)
  - Submit button with loading state
  - Error message display
  - Link to sign-up page
  - File: `solidjs/src/components/SignIn/style.css`

- [ ] T047 [US1] [P] Create `solidjs/src/pages/Auth.jsx` page wrapper for SignUp/SignIn
  - Route parameter or query param to determine which form (signup vs signin)
  - Redirect to dashboard if already authenticated
  - File wraps SignUp and SignIn components

### Frontend: Auth State Management & Session Persistence

- [ ] T048 [US1] [P] Create auth context/store in `solidjs/src/stores/auth.js` with:
  - Global state: currentUser, isAuthenticated, isLoading
  - Actions: setUser(), clearUser(), checkSession(), setLoading()
  - Initialization: call checkSession() on app mount to restore from server

- [ ] T049 [US1] [P] Create `solidjs/src/utils/sessionCheck.js` function that calls GET /api/auth/me on app mount to verify active session
  - If user is authenticated, populate auth store
  - If 401 returned, user is not authenticated (redirect to home/signin as needed)

### Frontend: Navigation with Auth Awareness

- [ ] T050 [US1] [P] Create `solidjs/src/components/Navbar/comp.jsx` with navigation bar
  - Display authenticated user's email (from auth store) if logged in
  - Show "Sign Out" button if authenticated
  - Show "Sign In" link if not authenticated
  - "Add Sighting" button (US4, conditional on auth status)
  - Responsive design (mobile hamburger menu optional for MVP)
  - File: `solidjs/src/components/Navbar/style.css`

### Testing & Integration

- [ ] T051 [US1] [P] Test signup flow manually: register with valid email/password, verify user created in D1
- [ ] T052 [US1] [P] Test duplicate email: attempt signup with existing email, verify 409 error message
- [ ] T053 [US1] [P] Test weak password: attempt signup with weak password, verify validation error with requirements
- [ ] T054 [US1] [P] Test signin flow: sign in with correct credentials, verify session cookie set, user info returned
- [ ] T055 [US1] [P] Test session persistence: sign in, refresh page, verify user still logged in (session from cookie)
- [ ] T056 [US1] [P] Test signout: sign out, verify session deleted from KV, cookie cleared
- [ ] T057 [US1] Commit US1 tasks to feature branch with message "feat(US1): user authentication (signup, signin, signout, session)"

---

## Phase 4: User Story 2 - Create Sighting Record (P1)

**User Story Goal**: Authenticated users can create sightings with animal name, location, optional photo, server-determined timestamp  
**Independent Test Criteria**:
- ✅ Form validates animal name and location (required)
- ✅ Timestamp auto-populated (cannot edit)
- ✅ Photo optional; accepts JPEG/PNG/WebP only
- ✅ Photo size validated <2MB before conversion
- ✅ Photo converted to base64 and sent with sighting data
- ✅ Sighting created in D1 with all fields
- ✅ Success message shown; user can add another or return to dashboard

**Acceptance Scenarios**: Spec.md User Story 2 (7 scenarios)

---

### Backend: Sighting Creation Endpoint

- [ ] T058 [US2] Create `cloudflare-worker/src/endpoints/sightings/create.ts`: POST /api/sightings handler
  - Validates session from middleware (must be authenticated)
  - Validates request body (Zod schema):
    - animal_name: required, 1-200 chars
    - location: required, 1-500 chars
    - photo_url: optional, must match base64 data URL format if present, length ≤2.9MB
  - Generates server timestamp (unixepoch)
  - Inserts into D1 sightings table (id, user_id, animal_name, location, timestamp_sighted, photo_url, created_at, updated_at)
  - Returns 201 with created sighting object
  - Error responses: 400 validation error, 401 not authenticated, 500 server error

### Frontend: Sighting Form Component

- [ ] T059 [US2] [P] Create `solidjs/src/components/SightingForm/comp.jsx` with form
  - Input fields: animal_name (text), location (text)
  - Auto-populated timestamp display (read-only, shows current server time format)
  - Photo upload field (file input, optional)
  - Real-time validation for animal_name, location
  - Photo validation: format check (image/* MIME types), size check (<2MB)
  - FileReader conversion: when photo selected, convert to base64 and display preview
  - Submit button with loading state
  - Error messages displayed near fields
  - Success message after submission with option to "Add Another" or "View Dashboard"
  - File: `solidjs/src/components/SightingForm/style.css` with form + image preview styling

- [ ] T060 [US2] [P] Create photo conversion utility in `solidjs/src/utils/photoConverter.js`:
  - Function: fileToBase64(file) → Promise<string> (uses FileReader API)
  - Function: validatePhotoFile(file) → {valid: boolean, error?: string} (checks MIME type, size <2MB)
  - Function: getImagePreviewUrl(base64String) → data URL for <img> preview

### Frontend: Sighting Creation Flow Integration

- [ ] T061 [US2] [P] Create `solidjs/src/pages/CreateSighting.jsx` page
  - Only accessible if authenticated (protected route)
  - Displays SightingForm component
  - On submit, calls sightings.createSighting() API service
  - Redirects to dashboard on success or shows error
  - Handles network errors with retry option

### Testing & Integration

- [ ] T062 [US2] [P] Test form validation: submit without animal name, verify error message appears
- [ ] T063 [US2] [P] Test form validation: submit without location, verify error message
- [ ] T064 [US2] [P] Test timestamp: form loads, verify timestamp is auto-populated and read-only
- [ ] T065 [US2] [P] Test photo validation: select non-image file, verify format error
- [ ] T066 [US2] [P] Test photo validation: select image >2MB, verify size error
- [ ] T067 [US2] [P] Test photo conversion: select valid image, verify preview displays base64 as image
- [ ] T068 [US2] [P] Test sighting creation: fill form with valid data + photo, submit, verify sighting appears in D1, success message shown
- [ ] T069 [US2] [P] Test sighting creation without photo: submit form without photo, verify sighting created with photo_url = null
- [ ] T070 [US2] Commit US2 tasks to feature branch with message "feat(US2): sighting creation with base64 photo storage"

---

## Phase 5: User Story 3 - View & Manage Sightings Dashboard (P1)

**User Story Goal**: Authenticated users see dashboard listing all their sightings with edit/delete capabilities, sorted by date  
**Independent Test Criteria**:
- ✅ Dashboard lists all user's sightings (not other users')
- ✅ Sightings sorted by date (newest first)
- ✅ Each sighting shows: animal name, location, date/time, photo thumbnail
- ✅ User can click sighting to open edit view
- ✅ User can edit animal name, location, photo
- ✅ User can delete sighting with confirmation
- ✅ Empty state shown if no sightings
- ✅ Dashboard loads in <1 second

**Acceptance Scenarios**: Spec.md User Story 3 (7 scenarios)

---

### Backend: Sightings List & Detail Endpoints

- [ ] T071 [US3] Create `cloudflare-worker/src/endpoints/sightings/list.ts`: GET /api/sightings handler
  - Validates session (authenticated)
  - Queries D1: SELECT * FROM sightings WHERE user_id = ? AND deleted_at IS NULL ORDER BY created_at DESC
  - Returns 200 with array of sighting objects
  - Optional pagination (limit, offset) in query params for future, not required for MVP

- [ ] T072 [US3] Create `cloudflare-worker/src/endpoints/sightings/get.ts`: GET /api/sightings/:id handler
  - Validates session
  - Queries D1 for sighting by id and user_id (ownership check)
  - Returns 404 if not found or not owned by user
  - Returns 200 with sighting object

### Backend: Update & Delete Endpoints

- [ ] T073 [US3] Create `cloudflare-worker/src/endpoints/sightings/update.ts`: PATCH /api/sightings/:id handler
  - Validates session
  - Validates request body (Zod): animal_name (optional), location (optional), photo_url (optional)
  - Checks ownership (user_id matches)
  - Updates sighting in D1: SET animal_name=?, location=?, photo_url=?, updated_at=? WHERE id=? AND user_id=?
  - Returns 200 with updated sighting object
  - Error responses: 400 validation, 401 not authenticated, 403 not owner, 404 not found, 500 server error

- [ ] T074 [US3] Create `cloudflare-worker/src/endpoints/sightings/delete.ts`: DELETE /api/sightings/:id handler
  - Validates session
  - Checks ownership
  - Soft delete: UPDATE sightings SET deleted_at=unixepoch() WHERE id=? AND user_id=?
  - Returns 204 No Content
  - Error responses: 401, 403, 404, 500

### Frontend: Dashboard & Sighting List

- [ ] T075 [US3] [P] Create `solidjs/src/pages/UserDashboard.jsx` page
  - Only accessible if authenticated (protected route)
  - Fetches sightings list on mount via sightings.listSightings()
  - Displays sightings in list or grid
  - Shows loading spinner while fetching
  - Shows empty state if no sightings: "No sightings yet. Create your first sighting!"
  - Passes sightings to SightingCard component for each item

- [ ] T076 [US3] [P] Create `solidjs/src/components/Dashboard/comp.jsx` wrapper component (optional) or incorporate logic in UserDashboard.jsx
  - Manages dashboard state: sightings list, loading, error
  - Handles sighting deletion with confirmation dialog
  - File: `solidjs/src/components/Dashboard/style.css`

- [ ] T077 [US3] [P] Create `solidjs/src/components/SightingCard/comp.jsx` sighting list item component
  - Display fields: animal_name, location, timestamp_sighted (formatted), photo thumbnail
  - Photo display: if photo_url is base64 data URL, show as <img> (browsers support data: URLs natively)
  - Edit button → opens edit modal or navigates to edit page
  - Delete button → shows confirmation, then calls deleteSighting()
  - File: `solidjs/src/components/SightingCard/style.css` with card styling, photo thumbnail sizing

### Frontend: Sighting Edit View

- [ ] T078 [US3] [P] Create `solidjs/src/pages/EditSighting.jsx` page
  - Route param: sighting ID
  - Fetch sighting details on mount via sightings.getSighting(id)
  - Populate form fields with current values
  - Uses SightingForm component but in edit mode (submit text "Save" instead of "Create")
  - Calls sightings.updateSighting() on submit
  - On success, redirect to dashboard

- [ ] T079 [US3] [P] Create photo replacement utility in SightingForm:
  - When editing, show current photo (if exists)
  - Option to replace photo (file input)
  - Option to remove photo (set photo_url to null)
  - Preview new photo before save

### Testing & Integration

- [ ] T080 [US3] [P] Test dashboard load: sign in, navigate to dashboard, verify sightings list loads <1s
- [ ] T081 [US3] [P] Test sightings isolation: create sighting as user A, sign in as user B, verify user A's sighting not visible
- [ ] T082 [US3] [P] Test sightings sorting: create 3 sightings at different times, verify they display newest first on dashboard
- [ ] T083 [US3] [P] Test empty state: sign in as new user, navigate to dashboard, verify "No sightings yet" message shows
- [ ] T084 [US3] [P] Test sighting details: click sighting on dashboard, verify edit view shows all fields populated correctly
- [ ] T085 [US3] [P] Test sighting edit: change animal_name, click save, verify dashboard reflects change
- [ ] T086 [US3] [P] Test photo edit: in edit view, select new photo, save, verify dashboard shows new photo thumbnail
- [ ] T087 [US3] [P] Test sighting delete: click delete on sighting, confirm, verify sighting removed from dashboard
- [ ] T088 [US3] Commit US3 tasks to feature branch with message "feat(US3): sightings dashboard with edit/delete"

---

## Phase 6: User Story 4 - Add Sighting Button in Navigation (P1)

**User Story Goal**: Navbar contains persistent "Add Sighting" button that navigates authenticated users to form, redirects unauthenticated to signin  
**Independent Test Criteria**:
- ✅ "Add Sighting" button visible on all pages
- ✅ Unauthenticated users → click button → redirect to signin
- ✅ Authenticated users → click button → navigate to sighting form
- ✅ User signs in while on form → user stays on form (no redirect away)
- ✅ Button styling consistent across all pages

**Acceptance Scenarios**: Spec.md User Story 4 (4 scenarios)

---

### Frontend: Navigation with Add Sighting Button

- [ ] T089 [US4] [P] Update `solidjs/src/components/Navbar/comp.jsx` to include "Add Sighting" button
  - Button visible on all pages (via layout/wrapper)
  - If not authenticated: button text "Add Sighting", click → redirectToSignin()
  - If authenticated: button text "Add Sighting", click → navigate to /create-sighting
  - Button styling: primary color, hover/focus states per design system
  - Mobile responsive (hamburger menu optional for MVP)

### Testing & Integration

- [ ] T090 [US4] [P] Test unauthenticated: not signed in, click "Add Sighting" button, verify redirect to signin
- [ ] T091 [US4] [P] Test authenticated: signed in, click "Add Sighting" button, verify navigate to /create-sighting
- [ ] T092 [US4] [P] Test button consistency: check "Add Sighting" button styling identical on home, signin, dashboard, form pages
- [ ] T093 [US4] [P] Test sign-in during form: navigate to create-sighting while unauthenticated (if route not protected), form loads, sign in, verify user stays on form
- [ ] T094 [US4] Commit US4 tasks to feature branch with message "feat(US4): navigation with auth-aware add sighting button"

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Error handling, accessibility, performance, documentation, polish UX  
**Acceptance Criteria**:
- ✅ All error scenarios handled gracefully (network errors, validation errors, auth errors)
- ✅ Form errors display near fields with clear messages
- ✅ Loading states shown for all async operations
- ✅ Accessibility score ≥90 on Lighthouse
- ✅ All pages accessible via keyboard (tab order, focus management)
- ✅ Bundle size ≤500KB gzipped
- ✅ API response p95 <200ms
- ✅ Dashboard load <1s
- ✅ Sign-in 95% <500ms

**Tests**: Lighthouse audit, manual accessibility testing, performance profiling

---

### Error Handling & User Feedback

- [ ] T095 [P] Create `solidjs/src/components/ErrorMessage/comp.jsx` for consistent error display
  - Positioned below input fields
  - Color-coded (red background, white text)
  - Icon (⚠️ or ❌) + message text
  - File: `solidjs/src/components/ErrorMessage/style.css`

- [ ] T096 [P] Create `solidjs/src/utils/errorHandler.js` utility for consistent error display
  - Function: parseError(response, fieldName?) → {field, message}
  - Handles API errors (400, 401, 403, 404, 500)
  - Returns user-friendly messages (not error codes)

- [ ] T097 [P] Update all form submissions to show clear error messages:
  - SignUp: display email, password, confirmPassword errors
  - SignIn: display email/password errors + generic auth error
  - SightingForm: display animal_name, location, photo errors

- [ ] T098 [P] Add network error handling in API client:
  - Catch fetch errors (timeout, no internet)
  - Display "Network error. Please check your connection and try again."
  - Show retry button

### Loading States & Spinners

- [ ] T099 [P] Add loading spinners to all form submissions:
  - SignUp: button text "Creating account...", button disabled
  - SignIn: button text "Signing in...", button disabled
  - SightingForm: button text "Saving...", button disabled

- [ ] T100 [P] Add loading spinner to dashboard fetch:
  - Show spinner while fetching sightings list
  - Center on page during load

### Accessibility Improvements

- [ ] T101 [P] Audit all pages with Lighthouse:
  - Check accessibility score ≥90
  - Verify keyboard navigation (tab order, focus management)
  - Add aria-labels to icon-only buttons
  - Ensure form labels properly associated with inputs (htmlFor)

- [ ] T102 [P] Add accessibility features:
  - Focus visible styles (outline or ring on focused elements)
  - Keyboard navigation for all interactive elements
  - Skip link at top of page (optional for MVP)
  - Color contrast ≥4.5:1 for text

### Performance Optimization

- [ ] T103 [P] Optimize bundle size:
  - Check `pnpm build` output size
  - Target ≤500KB gzipped (SolidJS is small, this should be easy)
  - Remove unused dependencies if any

- [ ] T104 [P] Optimize API performance:
  - Add indexes to D1 (already in schema)
  - Test list sightings query performance
  - Verify p95 response time <200ms

- [ ] T105 [P] Optimize page load time:
  - Verify dashboard loads <1s
  - Verify sign-in loads <500ms
  - Use React DevTools Profiler to identify slow components

### Documentation & Comments

- [ ] T106 [P] Add JSDoc comments to all frontend services:
  - Document function signature, params, return type, examples
  - Add comments to complex logic in components

- [ ] T107 [P] Add TypeScript doc comments to all backend endpoints:
  - Document request/response schema
  - Document error codes
  - Add examples

- [ ] T108 [P] Create IMPLEMENTATION.md in `specs/001-sighting-management/`:
  - Architecture decisions (base64 photos, session auth, D1 storage)
  - How to run locally (copy from quickstart.md)
  - Key file locations and what each does
  - Testing instructions

### Final Testing & QA

- [ ] T109 [P] End-to-end manual test: sign-up → sign-in → create sighting (with photo) → view dashboard → edit sighting → delete sighting → sign-out
- [ ] T110 [P] Test all error scenarios:
  - Duplicate email signup
  - Weak password
  - Invalid form inputs
  - Missing required fields
  - Photo validation (format, size)
  - Network errors (simulate offline)

- [ ] T111 [P] Cross-browser testing (Chrome, Firefox, Safari if available):
  - Verify all components render correctly
  - Verify FileReader API works (base64 conversion)
  - Verify data: URLs display in <img> tags

- [ ] T112 [P] Mobile testing:
  - Verify responsive design works on mobile screen
  - Test touch interactions (button clicks, form inputs)
  - Check viewport meta tag in index.html

### Code Quality & Polish

- [ ] T113 [P] Code review checklist:
  - Remove console.logs (except in dev builds)
  - Remove unused imports/variables
  - Check naming consistency (camelCase, descriptive names)
  - Verify error handling in all async functions

- [ ] T114 [P] Commit polish tasks to feature branch with message "polish: error handling, accessibility, performance optimization"

### Final Deployment Readiness

- [ ] T115 [P] Prepare for production deployment:
  - Set up environment variables for production
  - Document D1 production database setup
  - Document deployment steps (Cloudflare Workers, Pages/CDN)
  - Create DEPLOYMENT.md guide

- [ ] T116 Final commit to feature branch with message "release: MVP ready for deployment"
- [ ] T117 Create PR from feature branch `001-sighting-management` → `main` with MVP summary

---

## Task Execution Summary

**Total Tasks**: 117 (broken into 7 phases)

**Phase Breakdown**:
- Phase 1 (Setup): 12 tasks
- Phase 2 (Foundational): 27 tasks
- Phase 3 (US1: Auth): 18 tasks
- Phase 4 (US2: Create): 13 tasks
- Phase 5 (US3: Dashboard): 18 tasks
- Phase 6 (US4: Navigation): 6 tasks
- Phase 7 (Polish): 22 tasks

**Estimated Timeline** (rough, for planning):
- Phase 1: 1-2 hours (setup, config)
- Phase 2: 4-6 hours (database, middleware, API client)
- Phases 3-6: 16-20 hours (endpoints + components, parallelizable)
- Phase 7: 4-6 hours (polish, testing, accessibility)
- **Total MVP**: 25-34 hours (assuming parallel execution of independent tasks)

**Parallelization Strategy** (reduce timeline):
- Run Phase 1 + Phase 2 in parallel (different developers/different folders)
- Run Phases 3 & 4 in parallel (auth vs sighting creation)
- Run Phases 5 & 6 in parallel (dashboard vs nav)
- Merge and test Phase 7 together

**Independent Test Criteria** (each phase/user story is independently testable):
- US1: Signup/signin/signout flows work independently
- US2: Form validation + creation works independently (with mock authenticated user)
- US3: Dashboard display + edit/delete works independently (with mock sightings)
- US4: Navbar button logic works independently (toggle auth state)

---

## Constitution Alignment

All tasks designed to comply with Animal Identifier Constitution v1.0.0:

✅ **Type Safety First**: 
- Backend endpoints use Zod validation, TypeScript types
- Frontend uses JSDoc type hints
- Photo_url validation ensures base64 format

✅ **Component-Driven UI**: 
- Components co-located with styles (comp.jsx + style.css)
- Components: SignUp, SignIn, SightingForm, Dashboard, SightingCard, Navbar, LoadingSpinner, ErrorBoundary
- Reusable across pages

✅ **API Contract Integrity**: 
- OpenAPI 3.1 schemas (auth.openapi.json, sightings.openapi.json)
- Semantic versioning (1.0.0 for MVP)
- Chanfana validates all requests/responses

✅ **UX Consistency**: 
- Global design system (colors, spacing, typography)
- Error messages positioned near fields
- Loading states on all async operations
- Focus states on interactive elements

✅ **Progressive Enhancement**: 
- Forms work with HTML5, enhanced with JavaScript
- Photo preview optional (graceful fallback to filename)
- Session auth via HTTP-only cookies (XSS-safe)

✅ **Developer Simplicity**: 
- One-command setup: `pnpm install && pnpm dev` (both frontend + backend)
- Clear file organization (components/, services/, pages/)
- Minimal dependencies (SolidJS + Hono + Zod only)
- Configuration documented in quickstart.md

---

**Generated**: 2026-02-04 | **Status**: Ready for Development | **Branch**: `001-sighting-management`
