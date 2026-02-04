/**
 * List Sightings Endpoint
 * 
 * GET /api/sightings
 * Returns all sightings for the authenticated user, sorted by date (newest first).
 * Requires authentication.
 */

import { Hono } from 'hono';
import type { AppContext } from '../../types';
import { requireAuth } from '../../middleware/auth';

export const listSightingsRoute = new Hono<{ Bindings: any }>();

listSightingsRoute.get('/api/sightings', async (c: AppContext) => {
	try {
		// Check authentication
		const userId = await requireAuth(c);
		
		if (!userId) {
			return c.json({ error: 'Not authenticated' }, 401);
		}

		// Query sightings for this user, sorted by created_at descending (newest first)
		const result = await c.env.DB.prepare(
			`SELECT id, user_id, animal_name, location, timestamp_sighted, photo_url, created_at, updated_at
			 FROM sightings
			 WHERE user_id = ? AND deleted_at IS NULL
			 ORDER BY created_at DESC`
		).bind(userId).all();

		const sightings = result.results || [];

		return c.json({ success: true, sightings }, 200);

	} catch (error) {
		console.error('List sightings error:', error);
		const message = error instanceof Error ? error.message : 'Failed to list sightings';
		return c.json({ error: message }, 500);
	}
});
