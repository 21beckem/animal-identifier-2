/**
 * Get Current User Endpoint
 *
 * GET /api/auth/me
 *
 * Returns the currently authenticated user's profile.
 * - Validates session from middleware
 * - Queries D1 for current user by user_id
 * - Returns 401 if not authenticated
 * - Returns user object (id, email, created_at, last_login_at)
 */

import { Hono } from 'hono';
import type { AppContext } from '../../types';
import { requireAuth } from '../../middleware/auth';

export const meRoute = new Hono<{ Bindings: any }>();

meRoute.get('/api/auth/me', async (c: AppContext) => {
	try {
		// Check if user is authenticated
		const userId = await requireAuth(c);
		if (!userId) {
			return c.json({ error: 'Not authenticated' }, 401);
		}

		// Query for current user
		const user = await c.env.DB.prepare(
			'SELECT id, email, created_at, last_login_at FROM users WHERE id = ? AND deleted_at IS NULL LIMIT 1'
		)
			.bind(userId)
			.first();

		if (!user) {
			// User was deleted or doesn't exist
			return c.json({ error: 'User not found' }, 404);
		}

		// Return user object
		return c.json(
			{
				id: user.id,
				email: user.email,
				created_at: user.created_at,
				last_login_at: user.last_login_at || undefined,
			},
			200
		);
	} catch (error) {
		console.error('Get user error:', error);
		return c.json({ error: 'Internal server error' }, 500);
	}
});
