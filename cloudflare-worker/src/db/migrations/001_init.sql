-- Migration 001: Initial Schema - Users and Sightings Tables
-- Created: 2026-02-04
-- Description: Creates users and sightings tables with indexes for base64 photo storage

-- Users Table
-- Stores user accounts with email/password authentication
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  last_login_at INTEGER,
  deleted_at INTEGER
);

-- Index for fast email lookups (excluding soft-deleted users)
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;

-- Index for querying users by creation date
CREATE INDEX idx_users_created_at ON users(created_at);


-- Sightings Table
-- Stores wildlife sighting observations with location and optional base64 photo
CREATE TABLE sightings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  animal_name TEXT NOT NULL,
  location TEXT NOT NULL,
  timestamp_sighted INTEGER NOT NULL,
  photo_url TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  deleted_at INTEGER,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  CHECK (photo_url IS NULL OR photo_url LIKE 'data:image/%'),
  CHECK (photo_url IS NULL OR length(photo_url) <= 2900000)
);

-- Index for listing user's sightings (most recent first)
CREATE INDEX idx_sightings_user_id ON sightings(user_id, deleted_at, created_at DESC);

-- Index for sorting all sightings by creation date
CREATE INDEX idx_sightings_created_at ON sightings(created_at DESC);

-- Index for ownership verification (used in update/delete operations)
CREATE UNIQUE INDEX idx_sightings_id_user_id ON sightings(id, user_id);
