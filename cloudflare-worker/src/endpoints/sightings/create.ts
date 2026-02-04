/**
 * Create Sighting Endpoint
 * 
 * POST /api/sightings
 * Creates a new sighting record with optional base64 photo.
 * Requires authentication.
 */

import { Hono } from 'hono';
import { z, ZodError } from 'zod';
import type { AppContext } from '../../types';
import { requireAuth } from '../../middleware/auth';

// Zod schema for request validation
const CreateSightingSchema = z.object({
	animal_name: z.string().min(1).max(200, 'Animal name must be 1-200 characters'),
	location: z.string().min(1).max(500, 'Location must be 1-500 characters'),
	photo_url: z.string()
		.regex(/^data:image\/(jpeg|jpg|png|webp);base64,/, 'Photo must be a valid base64 data URL (JPEG, PNG, or WebP)')
		.max(2900000, 'Photo size must be less than 2MB (base64 encoded)')
		.optional()
		.nullable(),
});

export const createSightingRoute = new Hono<{ Bindings: any }>();

createSightingRoute.post('/api/sightings', async (c: AppContext) => {
	try {
		// Check authentication
		const userId = await requireAuth(c);
		
		if (!userId) {
			return c.json({ error: 'Not authenticated' }, 401);
		}

		// Parse and validate request body
		const body = await c.req.json();
		const validatedData = CreateSightingSchema.parse(body);

		// Server-determined timestamp (current time)
		const timestamp_sighted = Math.floor(Date.now() / 1000); // Unix epoch seconds
		const created_at = timestamp_sighted;
		const updated_at = timestamp_sighted;

		// Generate UUID for sighting ID
		const id = crypto.randomUUID();

		// Insert into D1 database
		const result = await c.env.DB.prepare(
			`INSERT INTO sightings (id, user_id, animal_name, location, timestamp_sighted, photo_url, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
			 RETURNING id, user_id, animal_name, location, timestamp_sighted, photo_url, created_at, updated_at`
		).bind(
			id,
			userId,
			validatedData.animal_name,
			validatedData.location,
			timestamp_sighted,
			validatedData.photo_url || null,
			created_at,
			updated_at
		).first();

		if (!result) {
			throw new Error('Failed to insert sighting into database');
		}

		return c.json({ success: true, sighting: result }, 201);

	} catch (error) {
		console.error('Create sighting error:', error);

		// Handle Zod validation errors
		if (error instanceof ZodError) {
			const errorMessages = error.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
			return c.json({ error: errorMessages }, 400);
		}

		// Generic error
		const message = error instanceof Error ? error.message : 'Failed to create sighting';
		return c.json({ error: message }, 500);
	}
});
