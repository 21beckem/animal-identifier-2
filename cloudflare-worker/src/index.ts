import { fromHono } from "chanfana";
import { Hono } from "hono";
import { runMigrations } from "./db/migrate";
import { seedDatabase, clearDatabase } from "./db/seed";
import type { Env } from "./types";
import { signupRoute } from "./endpoints/auth/signup";
import { signinRoute } from "./endpoints/auth/signin";
import { signoutRoute } from "./endpoints/auth/signout";
import { meRoute } from "./endpoints/auth/me";
import { createSightingRoute } from "./endpoints/sightings/create";
import { listSightingsRoute } from "./endpoints/sightings/list";
import { getSightingRoute } from "./endpoints/sightings/get";
import { updateSightingRoute } from "./endpoints/sightings/update";
import { deleteSightingRoute } from "./endpoints/sightings/delete";
import { cors } from "hono/cors";


// Start a Hono app
const app = new Hono<{ Bindings: Env }>();
app.use('/api/*', cors({
    origin: (origin) => origin, // Allow any origin in development, or specify your frontend URL
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
}));

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
});

// Register auth endpoints
app.route('/', signupRoute);
app.route('/', signinRoute);
app.route('/', signoutRoute);
app.route('/', meRoute);

// Register sighting endpoints
app.route('/', createSightingRoute);
app.route('/', listSightingsRoute);
app.route('/', getSightingRoute);
app.route('/', updateSightingRoute);
app.route('/', deleteSightingRoute);

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

