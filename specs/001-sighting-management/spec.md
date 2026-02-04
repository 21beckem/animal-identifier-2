# Feature Specification: Sighting Management System

**Feature Branch**: `001-sighting-management`  
**Created**: 2026-02-04  
**Status**: Draft  
**Input**: User description: Create sighting creation, management, and authentication system for wildlife documentation

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Account Authentication (Priority: P1)

Users must be able to create accounts and sign in to access their personal sighting dashboard. This is foundational functionality that gates access to all other features.

**Why this priority**: Authentication is the foundation for all user-specific features. Without it, users cannot maintain their own sighting records. This is the critical path blocker for the MVP.

**Independent Test**: User can register with email/password, receive confirmation, sign in successfully, and see personalized dashboard. Can be fully tested independently by creating account and verifying session persistence.

**Acceptance Scenarios**:

1. **Given** user is on sign-up page, **When** user enters valid email and password, **Then** account is created and user is redirected to dashboard
2. **Given** user has an account, **When** user enters correct credentials, **Then** user signs in and sees their dashboard
3. **Given** user is signed in, **When** user clicks sign out, **Then** session ends and user is redirected to homepage
4. **Given** user enters duplicate email, **When** attempting to sign up, **Then** error message displays "Email already registered"
5. **Given** user enters weak password, **When** attempting to sign up, **Then** error displays minimum requirements (e.g., "8+ characters, 1 uppercase")

---

### User Story 2 - Create Sighting Record (Priority: P1)

Users can create a new sighting with animal name, location, and auto-filled timestamp. Optional photo upload supported. This is core user value delivery.

**Why this priority**: Core MVP feature - users document animal sightings. Cannot complete until US1 (auth) is ready but should be built in parallel. Delivers main value proposition.

**Independent Test**: Authenticated user can fill sighting form with animal name, location, optional photo, and submit successfully. Record appears in their dashboard immediately. Can be tested independently with mock API.

**Acceptance Scenarios**:

1. **Given** user is on create sighting page, **When** user enters animal name and location, **Then** form validates both fields are present
2. **Given** sighting form is loaded, **When** form loads, **Then** current timestamp is automatically populated (user cannot edit)
3. **Given** user has selected a photo file, **When** user submits form, **Then** photo is uploaded and associated with sighting
4. **Given** user uploads a file that is not an image, **When** form validation runs, **Then** error displays "Only JPEG, PNG, WebP formats allowed"
5. **Given** photo file exceeds 2MB, **When** user attempts to upload, **Then** error displays "File size must be under 2MB"
6. **Given** user leaves animal name blank, **When** user attempts to submit, **Then** validation error shows "Animal name is required"
7. **Given** all required fields are filled, **When** user clicks submit, **Then** sighting is created and user sees success message with option to add another

---

### User Story 3 - View & Manage Sightings Dashboard (Priority: P1)

Users see a personalized dashboard listing all their sightings with options to update or delete each record. This completes the core user journey.

**Why this priority**: Essential P1 - users need to manage their records. Works independently once US1 (auth) is ready. Completes the "create, read, update, delete" cycle.

**Independent Test**: Signed-in user can see list of their sightings, update animal/location/photo on existing sighting, and delete sighting. Can be tested independently with mock sighting data.

**Acceptance Scenarios**:

1. **Given** user is signed in, **When** user lands on dashboard, **Then** list of user's sightings is displayed with animal name, location, date/time, and photo thumbnail
2. **Given** dashboard has sightings, **When** user clicks sighting, **Then** full details open in edit view with animal name, location, timestamp, and current photo
3. **Given** user is editing sighting, **When** user modifies animal name or location, **Then** changes are saved immediately upon blur or via explicit save button
4. **Given** user wants to replace photo, **When** user clicks photo upload area in edit view, **Then** new photo can be selected and replaces previous one
5. **Given** user clicks delete button on sighting, **When** user confirms deletion, **Then** sighting is removed from dashboard and confirmed with "Sighting deleted" message
6. **Given** dashboard is empty, **When** user is signed in with no sightings, **Then** empty state displays "No sightings yet" with button to create first sighting
7. **Given** dashboard has multiple sightings, **When** page loads, **Then** sightings are sorted by date (newest first)

---

### User Story 4 - Add Sighting Button in Navigation (Priority: P1)

Navigation bar contains persistent "Add Sighting" button. If user is not authenticated, clicking redirects to sign-in; if authenticated, navigates to sighting form. This ensures discoverability and seamless UX.

**Why this priority**: P1 - essential for usability. Makes "add sighting" action always accessible. Guides unauthenticated users to sign in organically rather than forcing early authentication.

**Independent Test**: Unauthenticated user clicks navbar button and redirects to sign-in. Authenticated user clicks navbar button and navigates to sighting form. Can be tested in isolation with auth state toggled.

**Acceptance Scenarios**:

1. **Given** user is not signed in, **When** user clicks "Add Sighting" button in navbar, **Then** user is redirected to sign-in page
2. **Given** user is signed in, **When** user clicks "Add Sighting" button in navbar, **Then** user navigates to create sighting form
3. **Given** user signs in while on sighting form, **When** page completes sign-in, **Then** user stays on sighting form (no redirect away)
4. **Given** navbar is displayed on any page, **When** button is present, **Then** button text is consistent, styled consistently, and positioned consistently

---

### Edge Cases

- What happens when a user's session expires while editing a sighting? (Gracefully redirect to sign-in, preserve form data if possible)
- How does the system handle photo upload if network connection is lost? (Show error message with retry button; do not mark sighting as complete)
- What if a user uploads the maximum file size repeatedly in a session? (No file size bypass; apply same 5MB limit consistently)
- Can a user view/edit sightings created before their account was created? (No - users only see their own sightings created after account activation)
- What if user deletes photo from existing sighting? (Photo optional - deletion allowed; sighting remains with no photo)

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create accounts with email and password
- **FR-002**: System MUST validate password strength (minimum 8 characters, at least 1 uppercase letter)
- **FR-003**: System MUST prevent duplicate email registrations (case-insensitive)
- **FR-004**: System MUST authenticate users via email/password sign-in
- **FR-005**: System MUST maintain secure session state after sign-in (session persists across page refreshes)
- **FR-006**: System MUST allow users to sign out and clear session
- **FR-007**: System MUST allow users to create sightings with animal name, location, auto-populated timestamp, and optional photo (stored as base64 data URL in database row)
- **FR-008**: System MUST allow users to upload a single optional photo (JPEG, PNG, WebP, max 2MB)
- **FR-009**: System MUST validate photo file size does not exceed 2MB and convert valid images to base64 data URLs
- **FR-010**: System MUST validate required fields (animal name, location) before sighting submission
- **FR-011**: System MUST display user's dashboard showing list of all their sightings
- **FR-012**: System MUST allow users to update existing sighting (name, location, photo)
- **FR-013**: System MUST allow users to delete sightings with confirmation
- **FR-014**: System MUST restrict user access to only their own sightings (no cross-user visibility)
- **FR-015**: Navbar MUST display "Add Sighting" button accessible on all pages
- **FR-016**: "Add Sighting" button MUST redirect unauthenticated users to sign-in
- **FR-017**: "Add Sighting" button MUST navigate authenticated users to sighting creation form
- **FR-018**: System MUST display helpful error messages for validation failures positioned near affected form fields
- **FR-019**: System MUST indicate loading state (spinner/disabled button) when submitting forms
- **FR-020**: Sighting list MUST sort by date with newest sightings first
- **FR-021**: System MUST display empty state message when user has no sightings

### Key Entities

- **User**: Represents an authenticated user account
  - Email (unique, required)
  - Password hash (required, salted)
  - Created timestamp
  - Last login timestamp (optional)

- **Sighting**: Represents a wildlife observation record
  - Animal name (required, string)
  - Location (required, string)
  - Timestamp (required, auto-populated at creation, immutable)
  - Photo URL (optional, single image)
  - Photo file metadata (size, format, upload timestamp)
  - User ID (required, foreign key - links to owner)
  - Created timestamp
  - Updated timestamp
  - Deleted flag (soft delete recommended for audit trail)

---

## Success Criteria

- Users can complete sign-up → sign-in → create sighting → view dashboard workflow in under 3 minutes
- Form validation errors appear within 100ms of user input
- Photo upload completes within 2 seconds for 5MB file on 3G network
- Dashboard loads within 1 second after sign-in
- 95% of sign-ins complete within 500ms
- All form fields display clear, actionable error messages (e.g., "Email already registered" not "Error 409")
- Dashboard remains accessible and usable when JavaScript is disabled (core fields/buttons render)
- Accessibility score for sign-in and dashboard pages ≥90 (WCAG AA compliance)

---

## Assumptions

1. **Authentication**: Email/password authentication is sufficient for MVP; OAuth2/social login deferred to future phase
2. **Storage**: Photo files converted to base64 data URLs on frontend and stored directly in sighting database row (no separate object storage)
3. **Photo Format**: Only JPEG, PNG, WebP supported; GIF/BMP/SVG not supported for wildlife documentation (reduces storage/processing)
4. **Timestamp**: Server-side timestamp used (not client-submitted) to ensure consistency and prevent user manipulation
5. **Session**: Standard session-based authentication (not JWT); session stored server-side with secure HTTP-only cookie
6. **Rate Limiting**: Basic rate limiting on sign-up (e.g., 5 attempts per hour per IP) to prevent abuse; not explicitly tested but assumed in deployment
7. **Soft Deletes**: Sightings marked deleted but not removed from database (audit trail); deleted sightings hidden from user dashboard
8. **Password Reset**: Out of scope for MVP; users cannot reset forgotten passwords (documented for future work)
9. **Email Verification**: Account created immediately upon signup without email confirmation (trade-off for MVP speed; not tested)

---

## Clarifications Needed

All specifications above are self-contained with reasonable defaults applied. No clarifications marked - see Assumptions section for trade-offs made during specification.

---

## Clarifications Session (2026-02-04)

### Technology Language Decision

- **Q**: Should TypeScript be used for both frontend and backend?
- **A**: TypeScript for backend only (Cloudflare Workers); JavaScript for frontend (SolidJS)
  - **Rationale**: Backend APIs require type safety for contract validation (Zod + Chanfana). Frontend JavaScript reduces bundle size and build complexity without sacrificing safety (JSDoc + IDE type hints suffice for UI code).
  - **Implementation**: Cloudflare Worker endpoints in TypeScript; SolidJS components in JavaScript with optional JSDoc type hints for critical functions.

### Photo Storage Architecture & Size Limit

- **Q1**: Should photos be uploaded to object storage (R2) with separate endpoint, or stored in the database row?
- **A1**: Store photos as base64 data URLs directly in the sighting database row (no separate object storage or upload endpoint)
  - **Rationale**: Simplifies architecture (single POST /api/sightings endpoint instead of two); keeps all sighting data atomically in one row; reduces backend complexity during MVP. Trade-off: base64 encoding increases data size by ~33% (1.3x original file size). For MVP scope (<1000 concurrent users), acceptable.
  - **Implementation**: Frontend converts image file to base64 string using FileReader API; includes data URL in photo_url field of POST /api/sightings request body. Remove separate POST /api/upload/photo endpoint.

- **Q2**: What is the maximum photo file size allowed?
- **A2**: Reduce from 5MB to 2MB maximum file size
  - **Rationale**: Balances user experience (faster frontend conversion to base64) with database row size concerns. 2MB photo → ~2.6MB base64 string in database. Prevents excessive row bloat while still supporting high-quality wildlife photos.
  - **Implementation**: Client-side validation rejects files >2MB before conversion; server-side validation rejects base64 strings >3MB as safety check.

---

