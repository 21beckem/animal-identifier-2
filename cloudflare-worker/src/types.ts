import { DateTime, Str } from "chanfana";
import type { Context } from "hono";
import { z } from "zod";
import type { D1Database, KVNamespace } from '@cloudflare/workers-types';

/**
 * Cloudflare Worker environment bindings
 */
export interface Env {
	/** D1 database for users and sightings */
	DB: D1Database;
	
	/** KV namespace for session storage */
	SESSIONS: KVNamespace;
	
	/** Environment variables from .env.local */
	D1_DATABASE_ID: string;
	KV_NAMESPACE_ID: string;
	SESSION_TTL: string;
	WORKERS_ENV: string;
	ALLOWED_ORIGINS: string;
}

export type AppContext = Context<{ Bindings: Env }>;

/**
 * API Request/Response Schemas
 */

/** Sign-up request payload */
export interface SignupRequest {
	email: string;
	password: string;
}

/** Sign-in request payload */
export interface SigninRequest {
	email: string;
	password: string;
}

/** Create sighting request payload */
export interface CreateSightingRequest {
	animal_name: string;
	location: string;
	photo_url?: string; // Optional base64 data URL
}

/** Update sighting request payload (all fields optional) */
export interface UpdateSightingRequest {
	animal_name?: string;
	location?: string;
	photo_url?: string | null; // null to remove photo
}

/** API error response */
export interface ErrorResponse {
	error: string;
	details?: Record<string, string>; // Field-specific errors for validation
}

/** Successful user response (safe, no password_hash) */
export interface UserResponse {
	id: string;
	email: string;
	created_at: number;
	last_login_at?: number;
}

/** Sighting response */
export interface SightingResponse {
	id: string;
	user_id: string;
	animal_name: string;
	location: string;
	timestamp_sighted: number;
	photo_url?: string | null;
	created_at: number;
	updated_at: number;
}

// Legacy task schema - will be removed
export const Task = z.object({
	name: Str({ example: "lorem" }),
	slug: Str(),
	description: Str({ required: false }),
	completed: z.boolean().default(false),
	due_date: DateTime(),
});

