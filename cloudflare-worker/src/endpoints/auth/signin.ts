/**
 * Sign-In Endpoint
 *
 * POST /api/auth/signin
 *
 * Authenticates user with email/password and creates a session.
 * - Validates email and password format
 * - Queries database for user by email
 * - Compares password hash with bcryptjs.compare()
 * - Creates session in KV with random sessionId
 * - Sets HTTP-only cookie with sessionId
 * - Updates last_login_at timestamp
 * - Returns user object (id, email, created_at, last_login_at)
 */

import { Hono } from 'hono';
import * as bcrypt from 'bcryptjs';
import { z } from 'zod';
import type { AppContext } from '../../types';
import { signinSchema } from '../../validation/schemas';
import { formatValidationErrors } from '../../validation/validators';
import { setSession, setSessionCookie } from '../../middleware/auth';

export const signinRoute = new Hono<{ Bindings: any }>();

signinRoute.post('/api/auth/signin', async (c: AppContext) => {
	try {
		// Parse and validate request body
		const body = await c.req.json();
		const data = signinSchema.parse(body);

		// Query for user by email (case-insensitive)
		const user = await c.env.DB.prepare(
			'SELECT id, email, password_hash, created_at FROM users WHERE LOWER(email) = LOWER(?) AND deleted_at IS NULL LIMIT 1'
		)
			.bind(data.email)
			.first();

		if (!user) {
			return c.json(
				{ error: 'Invalid email or password' },
				401
			);
		}

		// Compare password hash
		const passwordMatch = await bcrypt.compare(data.password, user.password_hash);
		if (!passwordMatch) {
			return c.json(
				{ error: 'Invalid email or password' },
				401
			);
		}

		// Create session in KV
		const sessionId = await setSession(c.env.SESSIONS, user.id);

		// Set session cookie (HTTP-only, Secure, SameSite=Strict)
		setSessionCookie(c, sessionId);

		// Update last_login_at timestamp
		await c.env.DB.prepare(
			'UPDATE users SET last_login_at = unixepoch() WHERE id = ?'
		)
			.bind(user.id)
			.run();

		// Return user object (safe response)
		return c.json(
			{
				id: user.id,
				email: user.email,
				created_at: user.created_at,
				last_login_at: Math.floor(Date.now() / 1000), // Just updated
			},
			200
		);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errors = formatValidationErrors(error);
			return c.json({ error: 'Validation failed', details: errors }, 400);
		}

		console.error('Signin error:', error);
		return c.json({ error: 'Internal server error' }, 500);
	}
});
