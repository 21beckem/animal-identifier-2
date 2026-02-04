/**
 * Database Schema Type Definitions
 * 
 * TypeScript interfaces matching D1 database schema from data-model.md.
 * All timestamps are Unix epoch seconds (INTEGER in SQLite).
 */

/**
 * User entity
 * 
 * Represents a registered user account with email/password authentication.
 */
export interface User {
  /** UUID format (lowercase hex string, 32 chars) - Primary key */
  id: string;
  
  /** User's email address (unique, case-insensitive) */
  email: string;
  
  /** bcryptjs password hash (cost 12, 60 chars) - Never returned in API responses */
  password_hash: string;
  
  /** Account creation timestamp (Unix seconds, immutable) */
  created_at: number;
  
  /** Last successful sign-in timestamp (Unix seconds, nullable) */
  last_login_at: number | null;
  
  /** Soft delete timestamp (Unix seconds, nullable) - null while active */
  deleted_at: number | null;
}

/**
 * Sighting entity
 * 
 * Represents a wildlife sighting observation with location and optional photo.
 */
export interface Sighting {
  /** UUID format (lowercase hex string, 32 chars) - Primary key */
  id: string;
  
  /** Foreign key to users.id - Defines ownership */
  user_id: string;
  
  /** User-entered animal name (1-200 chars, e.g., "Eastern Bluebird") */
  animal_name: string;
  
  /** User-entered location (1-500 chars, e.g., "Central Park, NYC") */
  location: string;
  
  /** When animal was spotted (Unix seconds, immutable, ≤ current time) */
  timestamp_sighted: number;
  
  /** Base64 data URL (e.g., data:image/jpeg;base64,...) - Optional, max 2.9MB */
  photo_url: string | null;
  
  /** Record creation timestamp (Unix seconds, immutable) */
  created_at: number;
  
  /** Last update timestamp (Unix seconds, updated on every PATCH) */
  updated_at: number;
  
  /** Soft delete timestamp (Unix seconds, nullable) - null while visible */
  deleted_at: number | null;
}

/**
 * Session data stored in KV namespace
 * 
 * Sessions expire after 7 days (604800 seconds TTL).
 */
export interface Session {
  /** User ID this session belongs to */
  user_id: string;
  
  /** Session creation timestamp (Unix seconds) */
  created_at: number;
  
  /** Session expiration timestamp (Unix seconds) */
  expires_at: number;
}

/**
 * User without sensitive data (safe for API responses)
 */
export type SafeUser = Omit<User, 'password_hash' | 'deleted_at'>;

/**
 * Sighting without soft delete metadata (safe for API responses)
 */
export type SafeSighting = Omit<Sighting, 'deleted_at'>;
