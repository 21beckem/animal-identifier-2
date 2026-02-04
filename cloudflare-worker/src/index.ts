import { fromHono } from "chanfana";
import { Hono } from "hono";
import { runMigrations } from "./db/migrate";
import { seedDatabase, clearDatabase } from "./db/seed";
import type { Env } from "./types";
import { signupRoute } from "./endpoints/auth/signup";
import { signinRoute } from "./endpoints/auth/signin";
import { signoutRoute } from "./endpoints/auth/signout";
import { meRoute } from "./endpoints/auth/me";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
});

// Register auth endpoints
app.route('/', signupRoute);
app.route('/', signinRoute);
app.route('/', signoutRoute);
app.route('/', meRoute);

// TODO: Register sighting endpoints (Phase 4+)
// - POST /api/sightings (create)
// - GET /api/sightings (list)
// - GET /api/sightings/:id (get)
// - PATCH /api/sightings/:id (update)
// - DELETE /api/sightings/:id (delete)

// Health check endpoint
app.get('/health', (c) => c.json({ status: 'ok', timestamp: Date.now() }));

// Migration endpoint (manual trigger for dev/prod)
app.post('/api/migrate', async (c) => {
	try {
		const count = await runMigrations(c.env.DB);
		return c.json({ success: true, migrationsApplied: count });
	} catch (error) {
		console.error('Migration failed:', error);
		return c.json({ success: false, error: String(error) }, 500);
	}
});

// Seed endpoint (dev only - manual trigger)
app.post('/api/seed', async (c) => {
	try {
		const result = await seedDatabase(c.env.DB);
		return c.json({ success: true, usersCreated: result.usersCreated, sightingsCreated: result.sightingsCreated });
	} catch (error) {
		console.error('Seed failed:', error);
		return c.json({ success: false, error: String(error) }, 500);
	}
});
// Seed endpoint to clear all data (dev only)
app.post('/api/seed/clear', async (c) => {
	try {
		await clearDatabase(c.env.DB);
		return c.json({ success: true, message: 'Database cleared' });
	} catch (error) {
		console.error('Seed failed:', error);
		return c.json({ success: false, error: String(error) }, 500);
	}
});

// Export the Hono app
export default app;

