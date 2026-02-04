/**
 * Get Sighting Endpoint
 * 
 * GET /api/sightings/:id
 * Returns a specific sighting by ID (with ownership check).
 * Requires authentication.
 */

import { Hono } from 'hono';
import type { AppContext } from '../../types';
import { requireAuth } from '../../middleware/auth';

export const getSightingRoute = new Hono<{ Bindings: any }>();

getSightingRoute.get('/api/sightings/:id', async (c: AppContext) => {
	try {
		// Check authentication
		const userId = await requireAuth(c);
		
		if (!userId) {
			return c.json({ error: 'Not authenticated' }, 401);
		}

		// Get sighting ID from URL params
		const sightingId = c.req.param('id');

		// Query sighting with ownership check
		const result = await c.env.DB.prepare(
			`SELECT id, user_id, animal_name, location, timestamp_sighted, photo_url, created_at, updated_at
			 FROM sightings
			 WHERE id = ? AND deleted_at IS NULL`
		).bind(sightingId).first();

		if (!result) {
			return c.json({ error: 'Sighting not found' }, 404);
		}

		// Check ownership
		if (result.user_id !== userId) {
			return c.json({ error: 'Not authorized to view this sighting' }, 403);
		}

		return c.json({ success: true, sighting: result }, 200);

	} catch (error) {
		console.error('Get sighting error:', error);
		const message = error instanceof Error ? error.message : 'Failed to get sighting';
		return c.json({ error: message }, 500);
	}
});
