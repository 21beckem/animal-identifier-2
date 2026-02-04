/**
 * Database Migration Runner
 * 
 * Runs SQL migration files in order to initialize or update the D1 database schema.
 * Migrations are idempotent and tracked in a migrations table.
 */

import type { D1Database } from '@cloudflare/workers-types';

/**
 * Migration tracking entry
 */
interface MigrationRecord {
  id: number;
  name: string;
  applied_at: number;
}

/**
 * Migration definition
 */
interface Migration {
  id: number;
  name: string;
  sql: string;
}

/**
 * All available migrations in execution order
 */
const migrations: Migration[] = [
  {
    id: 1,
    name: '001_init',
    sql: `
-- Migration 001: Initial Schema - Users and Sightings Tables

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  last_login_at INTEGER,
  deleted_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE TABLE IF NOT EXISTS sightings (
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

CREATE INDEX IF NOT EXISTS idx_sightings_user_id ON sightings(user_id, deleted_at, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sightings_created_at ON sightings(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sightings_id_user_id ON sightings(id, user_id);
    `.trim()
  }
];

/**
 * Initialize the migrations tracking table
 */
async function initMigrationsTable(db: D1Database): Promise<void> {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `).run();
}

/**
 * Get list of already applied migrations
 */
async function getAppliedMigrations(db: D1Database): Promise<Set<number>> {
  const result = await db.prepare('SELECT id FROM _migrations ORDER BY id').all<MigrationRecord>();
  return new Set(result.results?.map(r => r.id) || []);
}

/**
 * Apply a single migration
 */
async function applyMigration(db: D1Database, migration: Migration): Promise<void> {
  console.log(`Applying migration ${migration.id}: ${migration.name}`);
  
  // Split SQL into individual statements and execute each
  const statements = migration.sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  for (const statement of statements) {
    await db.prepare(statement).run();
  }
  
  // Record migration as applied
  await db.prepare('INSERT INTO _migrations (id, name) VALUES (?, ?)')
    .bind(migration.id, migration.name)
    .run();
  
  console.log(`✓ Migration ${migration.id} applied successfully`);
}

/**
 * Run all pending migrations
 * 
 * @param db - D1 database instance
 * @returns Number of migrations applied
 */
export async function runMigrations(db: D1Database): Promise<number> {
  console.log('Starting database migrations...');
  
  // Initialize migrations tracking table
  await initMigrationsTable(db);
  
  // Get already applied migrations
  const appliedMigrations = await getAppliedMigrations(db);
  
  // Find pending migrations
  const pendingMigrations = migrations.filter(m => !appliedMigrations.has(m.id));
  
  if (pendingMigrations.length === 0) {
    console.log('✓ Database schema is up to date');
    return 0;
  }
  
  // Apply pending migrations in order
  for (const migration of pendingMigrations) {
    await applyMigration(db, migration);
  }
  
  console.log(`✓ Applied ${pendingMigrations.length} migration(s)`);
  return pendingMigrations.length;
}

/**
 * Check if database schema is initialized
 */
export async function isSchemaInitialized(db: D1Database): Promise<boolean> {
  try {
    const result = await db.prepare('SELECT name FROM sqlite_master WHERE type="table" AND name="users"').first();
    return !!result;
  } catch {
    return false;
  }
}
