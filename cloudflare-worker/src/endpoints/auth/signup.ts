/**
 * Sign-Up Endpoint
 *
 * POST /api/auth/signup
 * 
 * Creates a new user account with email/password authentication.
 * - Validates email format and password strength
 * - Checks for duplicate email
 * - Hashes password with bcryptjs (cost 12)
 * - Returns created user object (id, email, created_at)
 */

import { Hono } from 'hono';
import * as bcrypt from 'bcryptjs';
import { z } from 'zod';
import type { AppContext } from '../../types';
import { signupSchema } from '../../validation/schemas';
import { formatValidationErrors } from '../../validation/validators';

export const signupRoute = new Hono<{ Bindings: any }>();

signupRoute.post('/api/auth/signup', async (c: AppContext) => {
	try {
		// Parse and validate request body
		const body = await c.req.json();
		const data = signupSchema.parse(body);

		// Check for duplicate email (case-insensitive)
		const existingUser = await c.env.DB.prepare(
			'SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND deleted_at IS NULL LIMIT 1'
		)
			.bind(data.email)
			.first();

		if (existingUser) {
			return c.json(
				{ error: 'Email already registered', details: { email: 'This email is already in use' } },
				409
			);
		}

		// Hash password (cost 12 = ~250ms on sign-up)
		const passwordHash = await bcrypt.hash(data.password, 12);

		// Insert new user
		const result = await c.env.DB.prepare(
			'INSERT INTO users (email, password_hash) VALUES (?, ?) RETURNING id, email, created_at'
		)
			.bind(data.email, passwordHash)
			.first();

		if (!result) {
			return c.json({ error: 'Failed to create user' }, 500);
		}

		return c.json(
			{
				id: result.id,
				email: result.email,
				created_at: result.created_at,
			},
			201
		);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errors = formatValidationErrors(error);
			return c.json({ error: 'Validation failed', details: errors }, 400);
		}

		console.error('Signup error:', error);
		return c.json({ error: 'Internal server error' }, 500);
	}
});
