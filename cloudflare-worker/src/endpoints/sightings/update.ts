/**
 * Update Sighting Endpoint
 * 
 * PATCH /api/sightings/:id
 * Updates an existing sighting (with ownership check).
 * Requires authentication.
 */

import { Hono } from 'hono';
import { z, ZodError } from 'zod';
import type { AppContext } from '../../types';
import { requireAuth } from '../../middleware/auth';

// Zod schema for request validation
const UpdateSightingSchema = z.object({
	animal_name: z.string().min(1).max(200).optional(),
	location: z.string().min(1).max(500).optional(),
	photo_url: z.string()
		.regex(/^data:image\/(jpeg|jpg|png|webp);base64,/, 'Photo must be a valid base64 data URL (JPEG, PNG, or WebP)')
		.max(2900000, 'Photo size must be less than 2MB (base64 encoded)')
		.optional()
		.nullable(),
});

export const updateSightingRoute = new Hono<{ Bindings: any }>();

updateSightingRoute.patch('/api/sightings/:id', async (c: AppContext) => {
	try {
		// Check authentication
		const userId = await requireAuth(c);
		
		if (!userId) {
			return c.json({ error: 'Not authenticated' }, 401);
		}

		// Get sighting ID from URL params
		const sightingId = c.req.param('id');

		// Parse and validate request body
		const body = await c.req.json();
		const validatedData = UpdateSightingSchema.parse(body);

		// Check if sighting exists and user owns it
		const existing = await c.env.DB.prepare(
			`SELECT id, user_id FROM sightings WHERE id = ? AND deleted_at IS NULL`
		).bind(sightingId).first();

		if (!existing) {
			return c.json({ error: 'Sighting not found' }, 404);
		}

		if (existing.user_id !== userId) {
			return c.json({ error: 'Not authorized to update this sighting' }, 403);
		}

		// Build update query dynamically based on provided fields
		const updates = [];
		const bindings = [];

		if (validatedData.animal_name !== undefined) {
			updates.push('animal_name = ?');
			bindings.push(validatedData.animal_name);
		}

		if (validatedData.location !== undefined) {
			updates.push('location = ?');
			bindings.push(validatedData.location);
		}

		if (validatedData.photo_url !== undefined) {
			updates.push('photo_url = ?');
			bindings.push(validatedData.photo_url);
		}

		if (updates.length === 0) {
			return c.json({ error: 'No fields to update' }, 400);
		}

		// Always update updated_at
		const updated_at = Math.floor(Date.now() / 1000);
		updates.push('updated_at = ?');
		bindings.push(updated_at);

		// Add sightingId for WHERE clause
		bindings.push(sightingId);

		// Update sighting
		await c.env.DB.prepare(
			`UPDATE sightings SET ${updates.join(', ')} WHERE id = ?`
		).bind(...bindings).run();

		// Fetch and return updated sighting
		const result = await c.env.DB.prepare(
			`SELECT id, user_id, animal_name, location, timestamp_sighted, photo_url, created_at, updated_at
			 FROM sightings WHERE id = ?`
		).bind(sightingId).first();

		return c.json({ success: true, sighting: result }, 200);

	} catch (error) {
		console.error('Update sighting error:', error);

		// Handle Zod validation errors
		if (error instanceof ZodError) {
			const errorMessages = error.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
			return c.json({ error: errorMessages }, 400);
		}

		const message = error instanceof Error ? error.message : 'Failed to update sighting';
		return c.json({ error: message }, 500);
	}
});
