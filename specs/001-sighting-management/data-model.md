# Data Model: Sighting Management System

**Feature**: `001-sighting-management`  
**Created**: 2026-02-04  
**Database**: Cloudflare D1 (SQLite)

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))), -- UUID format
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,                 -- case-insensitive email
  password_hash TEXT NOT NULL,                               -- bcryptjs hash (cost 12)
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),         -- Unix timestamp (seconds)
  last_login_at INTEGER,                                     -- Last successful sign-in (nullable)
  deleted_at INTEGER                                         -- Soft delete flag (nullable)
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at);
```

**Field Descriptions**:
- `id`: Primary key, UUID-format string (16 random bytes as hex). Immutable.
- `email`: User's email address (unique). Stored lowercase for case-insensitive lookups. Required for authentication.
- `password_hash`: bcryptjs hash at cost 12 (~250ms hash time on sign-up). Never returned in API responses.
- `created_at`: Account creation timestamp (Unix epoch seconds). Set server-side, immutable.
- `last_login_at`: Timestamp of most recent successful sign-in. Updated on each sign-in. Optional (null if never signed in).
- `deleted_at`: Soft delete timestamp. Null while active. Set when user requests account deletion (P2). Used to hide deleted accounts from queries.

**Constraints**:
- Email must be valid format: matches regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Email must be unique across all non-deleted users
- Password hash length: 60 characters (bcryptjs standard)
- created_at and password_hash are immutable after insertion

**Access Patterns**:
- Sign-in: SELECT password_hash FROM users WHERE email = ? AND deleted_at IS NULL
- Check duplicate email: SELECT 1 FROM users WHERE LOWER(email) = LOWER(?) AND deleted_at IS NULL LIMIT 1
- Get user by ID: SELECT id, email, created_at, last_login_at FROM users WHERE id = ? AND deleted_at IS NULL
- Update last login: UPDATE users SET last_login_at = ? WHERE id = ?

---

### Sightings Table

```sql
CREATE TABLE sightings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),  -- UUID format
  user_id TEXT NOT NULL,                                      -- Foreign key to users.id
  animal_name TEXT NOT NULL,                                  -- e.g., "Eastern Bluebird"
  location TEXT NOT NULL,                                     -- e.g., "Central Park, NYC"
  timestamp_sighted INTEGER NOT NULL,                         -- When animal was spotted (Unix seconds)
  photo_url TEXT,                                             -- Signed R2 URL (optional)
  photo_format TEXT,                                          -- MIME type: "image/jpeg", "image/png", "image/webp"
  photo_size_bytes INTEGER,                                   -- File size in bytes (for validation)
  photo_uploaded_at INTEGER,                                  -- When photo was uploaded (Unix seconds)
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),          -- Record creation time
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),          -- Last update time
  deleted_at INTEGER,                                         -- Soft delete flag
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  CHECK (photo_url IS NULL OR photo_url LIKE 'https://%'),  -- R2 URLs must be HTTPS
  CHECK (photo_size_bytes IS NULL OR photo_size_bytes <= 5242880) -- 5MB max
);

CREATE INDEX idx_sightings_user_id ON sightings(user_id, deleted_at, created_at DESC);
CREATE INDEX idx_sightings_created_at ON sightings(created_at DESC);
CREATE UNIQUE INDEX idx_sightings_id_user_id ON sightings(id, user_id); -- for ownership verification
```

**Field Descriptions**:
- `id`: Primary key, UUID-format string. Immutable.
- `user_id`: Foreign key linking to users table. Defines sighting ownership.
- `animal_name`: User-entered animal name (e.g., "Red Fox", "Canada Goose"). Required.
- `location`: User-entered location where animal was spotted. Required. Freeform text (no strict geocoding).
- `timestamp_sighted`: Server-determined timestamp when animal was observed. Immutable. Set server-side from request arrival time (not user input).
- `photo_url`: Signed R2 storage URL (e.g., `https://pub-abc123.r2.dev/sightings/xyz/photo.jpg?X-Amz-Signature=...`). Includes expiry (10 min). Optional.
- `photo_format`: MIME type string ("image/jpeg", "image/png", "image/webp"). Only set if photo_url is set.
- `photo_size_bytes`: File size in bytes. Only set if photo_url is set. Validated at 5MB max.
- `photo_uploaded_at`: Timestamp when photo file was uploaded to R2. Only set if photo_url is set.
- `created_at`: Sighting record creation time. Set server-side, immutable.
- `updated_at`: Last modified timestamp. Updated on every PATCH operation.
- `deleted_at`: Soft delete flag. Null while visible. Set when user deletes sighting.

**Constraints**:
- animal_name: 1-200 characters (prevents empty strings, limits to reasonable wildlife names)
- location: 1-500 characters
- timestamp_sighted: <= current server time (cannot be future-dated)
- photo_url: HTTPS protocol only; signed R2 URLs follow pattern
- photo_size_bytes: 0-5242880 (5MB), only set if photo exists
- deleted_at: Only set to server time; never manually edited

**Access Patterns**:
- List user's sightings: SELECT * FROM sightings WHERE user_id = ? AND deleted_at IS NULL ORDER BY created_at DESC
- Get sighting details: SELECT * FROM sightings WHERE id = ? AND user_id = ? AND deleted_at IS NULL
- Verify ownership: SELECT 1 FROM sightings WHERE id = ? AND user_id = ? LIMIT 1
- Soft delete: UPDATE sightings SET deleted_at = unixepoch() WHERE id = ? AND user_id = ?
- Count user's active sightings: SELECT COUNT(*) FROM sightings WHERE user_id = ? AND deleted_at IS NULL
- Search sightings: SELECT * FROM sightings WHERE user_id = ? AND deleted_at IS NULL AND (animal_name LIKE ? OR location LIKE ?) (P2 feature)

---

## Sessions Table (KV Store Alternative)

While SQLite could store sessions, Cloudflare KV is preferred for session management (fast, expiring keys):

```
KV Namespace: sighting_sessions
Key Format: session:{session_id}
Value: { user_id, created_at, expires_at }
Expiration: 7 days (604800 seconds)

Example:
  Key: session:a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
  Value: { "user_id": "xyz789abc123", "created_at": 1707000000, "expires_at": 1707604800 }
  TTL: 604800 seconds (7 days)
```

**Rationale**: 
- KV expiration TTL auto-deletes expired sessions without cron job
- Faster than DB for every auth check (KV hit: ~10ms, D1 query: ~50-100ms)
- Sign-out immediately removes session from KV (soft-delete in D1 unnecessary)

---

## Relationships

```
┌─────────────────────────────────────────────────┐
│  User (id PK)                                   │
│  - email (unique)                               │
│  - password_hash                                │
│  - created_at                                   │
│  - last_login_at                                │
│  - deleted_at                                   │
└─────────────────────────────────────────────────┘
              │
              │ (1:N)
              │ user_id FK
              ▼
┌─────────────────────────────────────────────────┐
│  Sighting (id PK)                               │
│  - user_id (FK → User.id)                       │
│  - animal_name                                  │
│  - location                                     │
│  - timestamp_sighted                            │
│  - photo_url (→ R2 storage)                     │
│  - photo_format                                 │
│  - photo_size_bytes                             │
│  - photo_uploaded_at                            │
│  - created_at                                   │
│  - updated_at                                   │
│  - deleted_at                                   │
└─────────────────────────────────────────────────┘
```

**Relationship**: One User has many Sightings (1:N). Each sighting belongs to exactly one user. Deletion of user does not cascade (soft delete on users; deleted sightings still queryable by admin for audit purposes).

---

## Photo Storage Model (Cloudflare R2)

**R2 Bucket Structure**:
```
sighting-photos/
├── {sighting_id}/
│   └── photo.{ext}
│       (e.g., xyz789abc123/photo.jpg)
```

**Metadata Flow**:
1. User uploads photo via multipart form in SightingForm component
2. Browser validates: JPEG/PNG/WebP, <5MB
3. POST `/api/upload/photo` → backend validates again → upload to R2
4. R2 returns object key: `{sighting_id}/photo.jpg`
5. Generate signed URL with 10-minute expiry: `https://pub-{bucket-id}.r2.dev/sighting-photos/{sighting_id}/photo.jpg?X-Amz-Signature=...`
6. Signed URL included in sighting creation payload
7. D1 row stores photo_url (signed URL), photo_format (MIME), photo_size_bytes, photo_uploaded_at

**Cleanup**:
- When sighting deleted (soft delete): Schedule async task to delete R2 object (P2)
- Orphaned R2 objects after Y days: Cleanup via Cloudflare scheduled worker (P2)

---

## Data Validation Rules

### User Data

| Field | Validation | Error Message |
|-------|------------|---------------|
| email | Required, valid format, unique | "Invalid email" or "Email already registered" |
| password | 8+ chars, 1+ uppercase, 1+ number, 1+ special char | "Password must be 8+ chars with uppercase, number, special char" |
| password confirm | Matches password field | "Passwords do not match" |

### Sighting Data

| Field | Validation | Error Message |
|-------|------------|---------------|
| animal_name | Required, 1-200 chars | "Animal name is required" or "Animal name too long (max 200 chars)" |
| location | Required, 1-500 chars | "Location is required" or "Location too long (max 500 chars)" |
| photo (file) | JPEG/PNG/WebP only, <5MB | "Only JPEG, PNG, WebP formats allowed" or "File size must be under 5MB" |

### Timestamp Rules

- `timestamp_sighted`: Set server-side at sighting creation. Cannot be edited. Prevents backdating wildlife observations.
- `created_at`: Set at record insertion. Immutable.
- `updated_at`: Set at every PATCH. Used for optimistic locking (return 409 Conflict if client sends stale updated_at).
- `deleted_at`: Set only on deletion. Once set, never undeleted (no restore).

---

## Migrations

### Migration 001: Initial Schema

File: `cloudflare-worker/src/db/migrations/001_init.sql`

```sql
-- Initial schema: users and sightings tables
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  last_login_at INTEGER,
  deleted_at INTEGER
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE TABLE sightings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  animal_name TEXT NOT NULL,
  location TEXT NOT NULL,
  timestamp_sighted INTEGER NOT NULL,
  photo_url TEXT,
  photo_format TEXT,
  photo_size_bytes INTEGER,
  photo_uploaded_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  deleted_at INTEGER,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  CHECK (photo_url IS NULL OR photo_url LIKE 'https://%'),
  CHECK (photo_size_bytes IS NULL OR photo_size_bytes <= 5242880)
);

CREATE INDEX idx_sightings_user_id ON sightings(user_id, deleted_at, created_at DESC);
CREATE INDEX idx_sightings_created_at ON sightings(created_at DESC);
CREATE UNIQUE INDEX idx_sightings_id_user_id ON sightings(id, user_id);
```

### Migration 002: Add Soft Delete Support (P1.5)

File: `cloudflare-worker/src/db/migrations/002_add_soft_delete.sql`

Not needed - soft delete (deleted_at column) already in 001_init.sql for audit trail.

---

## Data Consistency Guarantees

- **User Uniqueness**: Email UNIQUE constraint + case-insensitive collation
- **Referential Integrity**: Foreign key constraint on sighting.user_id → user.id
- **Ownership Verification**: Always query sightings with WHERE user_id = ? to prevent cross-user access
- **Immutable Timestamps**: created_at and timestamp_sighted never updated after insertion
- **Soft Deletes**: deleted_at column used for logical deletion (rows never physically removed)
- **Optimistic Locking**: UPDATE sightings SET ... WHERE id = ? AND updated_at = ? (return 409 if stale)
- **File Size Constraint**: photo_size_bytes validated at insert and CHECK constraint enforces 5MB max

---

## Performance Considerations

### Indexes Strategy

1. `idx_users_email`: Fast email lookups for sign-in (exact match)
2. `idx_users_created_at`: Support for user activity analytics (P2)
3. `idx_sightings_user_id`: Critical for list queries (user_id + deleted_at + sort by created_at DESC)
4. `idx_sightings_created_at`: Support for global timeline queries (P2 feature)
5. `idx_sightings_id_user_id`: Ownership checks (id + user_id composite for tight index)

### Query Performance Targets

| Query | Target | Index |
|-------|--------|-------|
| List user's sightings | <100ms | idx_sightings_user_id |
| Get sighting details | <50ms | PRIMARY KEY (id) |
| Sign-in email lookup | <50ms | idx_users_email |
| Verify ownership | <50ms | idx_sightings_id_user_id |

### Pagination (P2)

Current schema supports easy pagination:
```sql
SELECT * FROM sightings 
WHERE user_id = ? AND deleted_at IS NULL 
ORDER BY created_at DESC 
LIMIT 20 OFFSET ?
```

Cursor-based pagination (P2):
```sql
SELECT * FROM sightings 
WHERE user_id = ? AND deleted_at IS NULL AND created_at < ? 
ORDER BY created_at DESC 
LIMIT 20
```

---

## Testing Data (Seed Script - P2)

Example seed script for development/testing:

```sql
-- Insert test user
INSERT INTO users (id, email, password_hash, created_at, last_login_at)
VALUES ('test001', 'demo@example.com', '$2b$12$...bcryptjs_hash...', 1707000000, 1707000000);

-- Insert test sightings
INSERT INTO sightings (id, user_id, animal_name, location, timestamp_sighted, created_at, updated_at)
VALUES 
  ('sight001', 'test001', 'Red Fox', 'Central Park, NYC', 1707000000, 1707000000, 1707000000),
  ('sight002', 'test001', 'Canada Goose', 'Prospect Park, NYC', 1706900000, 1706900000, 1706900000),
  ('sight003', 'test001', 'Eastern Bluebird', 'High Line, NYC', 1706800000, 1706800000, 1706800000);
```

---

## Evolution & Future Enhancements (P2+)

- **Password Reset**: Add password_reset_token table with expiry; "forgot password" flow
- **Email Verification**: Add verified_at column to users; send verification email on sign-up
- **Sighting Search**: Add full-text search index on animal_name, location
- **Sighting Tagging**: Add tags junction table for multi-tag queries ("all birds", "all mammals")
- **User Following**: Add follows table for social features (P3)
- **Sighting Comments**: Add comments table for community engagement (P3)
- **Pagination**: Cursor-based pagination for large sighting lists (P2)
- **Rate Limiting**: Add API rate limit table per IP/user (P2, track in separate table or Redis)
- **Analytics**: Add sighting_views table to track popular sightings (P3)

---

**Schema Version**: 1.0.0 | **Created**: 2026-02-04 | **Status**: Ready for Implementation
