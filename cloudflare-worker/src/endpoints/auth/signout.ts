/**
 * Sign-Out Endpoint
 *
 * POST /api/auth/signout
 *
 * Logs out the current user by:
 * - Validating session from cookie
 * - Deleting session from KV
 * - Clearing HTTP-only cookie
 * - Returns 204 No Content on success
 */

import { Hono } from 'hono';
import type { AppContext } from '../../types';
import { getSessionFromCookie, deleteSession, clearSessionCookie, requireAuth } from '../../middleware/auth';

export const signoutRoute = new Hono<{ Bindings: any }>();

signoutRoute.post('/api/auth/signout', async (c: AppContext) => {
	try {
		// Check if user is authenticated
		const userId = await requireAuth(c);
		if (!userId) {
			return c.json({ error: 'Not authenticated' }, 401);
		}

		// Get session ID from cookie
		const sessionId = getSessionFromCookie(c);
		if (sessionId) {
			// Delete session from KV
			await deleteSession(c.env.SESSIONS, sessionId);
		}

		// Clear session cookie
		clearSessionCookie(c);

		// Return 204 No Content
		return new Response(null, { status: 204 });
	} catch (error) {
		console.error('Signout error:', error);
		return c.json({ error: 'Internal server error' }, 500);
	}
});
