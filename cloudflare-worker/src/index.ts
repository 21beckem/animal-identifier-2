import { fromHono } from "chanfana";
import { Hono } from "hono";
import { runMigrations } from "./db/migrate";
import { seedDatabase, clearDatabase } from "./db/seed";
import type { Env } from "./types";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
});

// TODO: Register auth and sighting endpoints (Phase 3+)
// Old task endpoints removed - will be replaced with:
// - POST /api/auth/signup
// - POST /api/auth/signin
// - POST /api/auth/signout
// - GET /api/sightings
// - POST /api/sightings
// - GET /api/sightings/:id
// - PATCH /api/sightings/:id
// - DELETE /api/sightings/:id

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
		return c.json({ success: true, ...result });
	} catch (error) {
		console.error('Seed failed:', error);
		return c.json({ success: false, error: String(error) }, 500);
	}
});
// Seed endpoint to clear all data (dev only)
app.post('/api/seed/clear', async (c) => {
	try {
		const result = await clearDatabase(c.env.DB);
		return c.json({ success: true, ...result });
	} catch (error) {
		console.error('Seed failed:', error);
		return c.json({ success: false, error: String(error) }, 500);
	}
});

// Export the Hono app
export default app;

