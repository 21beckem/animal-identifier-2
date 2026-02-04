/**
 * Delete Sighting Endpoint
 * 
 * DELETE /api/sightings/:id
 * Soft deletes a sighting (sets deleted_at timestamp).
 * Requires authentication.
 */

import { Hono } from 'hono';
import type { AppContext } from '../../types';
import { requireAuth } from '../../middleware/auth';

export const deleteSightingRoute = new Hono<{ Bindings: any }>();

deleteSightingRoute.delete('/api/sightings/:id', async (c: AppContext) => {
	try {
		// Check authentication
		const userId = await requireAuth(c);
		
		if (!userId) {
			return c.json({ error: 'Not authenticated' }, 401);
		}

		// Get sighting ID from URL params
		const sightingId = c.req.param('id');

		// Check if sighting exists and user owns it
		const existing = await c.env.DB.prepare(
			`SELECT id, user_id FROM sightings WHERE id = ? AND deleted_at IS NULL`
		).bind(sightingId).first();

		if (!existing) {
			return c.json({ error: 'Sighting not found' }, 404);
		}

		if (existing.user_id !== userId) {
			return c.json({ error: 'Not authorized to delete this sighting' }, 403);
		}

		// Soft delete: set deleted_at timestamp
		const deleted_at = Math.floor(Date.now() / 1000);
		await c.env.DB.prepare(
			`UPDATE sightings SET deleted_at = ? WHERE id = ?`
		).bind(deleted_at, sightingId).run();

		// Return 204 No Content (standard for successful DELETE)
		return c.body(null, 204);

	} catch (error) {
		console.error('Delete sighting error:', error);
		const message = error instanceof Error ? error.message : 'Failed to delete sighting';
		return c.json({ error: message }, 500);
	}
});
