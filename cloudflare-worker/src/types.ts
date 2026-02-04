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

// Legacy task schema - will be removed in Phase 3
export const Task = z.object({
	name: Str({ example: "lorem" }),
	slug: Str(),
	description: Str({ required: false }),
	completed: z.boolean().default(false),
	due_date: DateTime(),
});

