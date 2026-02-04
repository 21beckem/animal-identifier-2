/**
 * Authentication Middleware
 *
 * Handles session verification, cookie parsing, and KV session management.
 * Applied to all protected endpoints (auth check, sighting CRUD).
 */

import type { Context } from 'hono';
import type { KVNamespace } from '@cloudflare/workers-types';
import type { Session } from '../db/schema';

/**
 * Extract session ID from HTTP cookie
 * Looks for 'session' cookie (HttpOnly, Secure)
 *
 * @param c - Hono context
 * @returns Session ID string or null if not found
 */
export function getSessionFromCookie(c: Context): string | null {
	const cookieHeader = c.req.header('cookie');
	if (!cookieHeader) return null;

	// Parse cookie header: "session=abc123; other=value"
	const cookies = cookieHeader.split(';').map(c => c.trim());
	for (const cookie of cookies) {
		if (cookie.startsWith('session=')) {
			return cookie.substring('session='.length);
		}
	}

	return null;
}

/**
 * Validate session from KV store
 * Checks if session exists and is not expired
 *
 * @param kv - KV namespace for session storage
 * @param sessionId - Session ID to validate
 * @returns Session object if valid, null if expired or not found
 */
export async function validateSession(
	kv: KVNamespace,
	sessionId: string
): Promise<Session | null> {
	try {
		const sessionJson = await kv.get(`session:${sessionId}`);
		if (!sessionJson) return null;

		const session: Session = JSON.parse(sessionJson);

		// Check if session is expired
		const now = Math.floor(Date.now() / 1000);
		if (session.expires_at < now) {
			// Session expired, delete it
			await kv.delete(`session:${sessionId}`);
			return null;
		}

		return session;
	} catch (error) {
		console.error('Session validation error:', error);
		return null;
	}
}

/**
 * Extract user ID from validated session
 *
 * @param session - Validated session object
 * @returns User ID string
 */
export function extractUserIdFromSession(session: Session): string {
	return session.user_id;
}

/**
 * Create a new session in KV store
 *
 * @param kv - KV namespace for session storage
 * @param userId - User ID to associate with session
 * @param ttlSeconds - Time to live in seconds (default 7 days = 604800)
 * @returns Generated session ID
 */
export async function setSession(
	kv: KVNamespace,
	userId: string,
	ttlSeconds: number = 604800 // 7 days default
): Promise<string> {
	// Generate random session ID (32 random bytes as hex = 64 chars)
	const sessionId = Array.from(crypto.getRandomValues(new Uint8Array(32)))
		.map(b => b.toString(16).padStart(2, '0'))
		.join('');

	const now = Math.floor(Date.now() / 1000);
	const session: Session = {
		user_id: userId,
		created_at: now,
		expires_at: now + ttlSeconds,
	};

	await kv.put(`session:${sessionId}`, JSON.stringify(session), {
		expirationTtl: ttlSeconds,
	});

	return sessionId;
}

/**
 * Get session from KV store
 *
 * @param kv - KV namespace
 * @param sessionId - Session ID to retrieve
 * @returns Session object or null if not found/expired
 */
export async function getSession(
	kv: KVNamespace,
	sessionId: string
): Promise<Session | null> {
	return validateSession(kv, sessionId);
}

/**
 * Delete session from KV store (logout)
 *
 * @param kv - KV namespace
 * @param sessionId - Session ID to delete
 */
export async function deleteSession(
	kv: KVNamespace,
	sessionId: string
): Promise<void> {
	await kv.delete(`session:${sessionId}`);
}

/**
 * Middleware to verify session and attach user_id to context
 * Can be used as: app.use(authMiddleware)
 *
 * @param c - Hono context
 * @returns null if successful (continues to next handler), Response if unauthorized
 */
export async function authMiddleware(c: Context): Promise<void> {
	const sessionId = getSessionFromCookie(c);
	if (!sessionId) {
		// No session cookie, let the handler decide if auth is required
		return;
	}

	const session = await validateSession(c.env.SESSIONS, sessionId);
	if (!session) {
		// Session invalid or expired, clear cookie
		c.header('Set-Cookie', 'session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict');
		return;
	}

	// Store user_id in context for use in handlers
	const userId = extractUserIdFromSession(session);
	(c.env as any).__user_id = userId;
}

/**
 * Check if user is authenticated (has valid session)
 * For use in endpoints to enforce authentication requirement
 *
 * @param c - Hono context
 * @returns User ID if authenticated, null otherwise
 */
export async function requireAuth(c: Context): Promise<string | null> {
	const sessionId = getSessionFromCookie(c);
	if (!sessionId) return null;

	const session = await validateSession(c.env.SESSIONS, sessionId);
	if (!session) return null;

	return extractUserIdFromSession(session);
}

/**
 * Set session cookie in response
 * HttpOnly, Secure, SameSite=Strict for XSS protection
 *
 * @param c - Hono context
 * @param sessionId - Session ID to set in cookie
 * @param maxAgeSeconds - Cookie expiration time (default 7 days)
 */
export function setSessionCookie(
	c: Context,
	sessionId: string,
	maxAgeSeconds: number = 604800
): void {
	c.header(
		'Set-Cookie',
		`session=${sessionId}; Path=/; Max-Age=${maxAgeSeconds}; HttpOnly; Secure; SameSite=Strict`
	);
}

/**
 * Clear session cookie (for logout)
 *
 * @param c - Hono context
 */
export function clearSessionCookie(c: Context): void {
	c.header('Set-Cookie', 'session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict');
}
