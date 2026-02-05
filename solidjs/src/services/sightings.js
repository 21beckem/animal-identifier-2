/**
 * Sightings Service
 *
 * Handles CRUD operations for sightings: create, read, update, delete.
 * All endpoints require authentication (session).
 */

import * as api from './api';

/**
 * Create a new sighting
 *
 * @param {string} animal_name - Name of animal sighted
 * @param {string} location - Location where animal was sighted
 * @param {string|null} [photo_url] - Optional base64 photo data URL
 * @returns {Promise<Sighting>} Created sighting object
 * @throws {ApiError} If creation fails (validation, auth, etc.)
 */
export async function createSighting(animal_name, location, photo_url = null) {
	const response = await api.post('/api/sightings', {
		animal_name,
		location,
		photo_url: photo_url || undefined, // Omit if null/undefined
	});

	return response.sighting;
}

/**
 * Update an existing sighting
 *
 * @param {string} id - Sighting ID
 * @param {Partial<CreateSightingFormData>} changes - Fields to update (animal_name, location, photo_url)
 * @returns {Promise<Sighting>} Updated sighting object
 * @throws {ApiError} If update fails (not found, not owner, validation, etc.)
 */
export async function updateSighting(id, changes) {
	const body = {};

	if (changes.animal_name !== undefined) {
		body.animal_name = changes.animal_name;
	}
	if (changes.location !== undefined) {
		body.location = changes.location;
	}
	if (changes.photo_url !== undefined) {
		body.photo_url = changes.photo_url;
	}

	const response = await api.patch(`/api/sightings/${id}`, body);
	return response.sighting;
}

/**
 * Get a single sighting by ID
 *
 * @param {string} id - Sighting ID
 * @returns {Promise<Sighting>} Sighting object
 * @throws {ApiError} If sighting not found (404) or not authenticated (401)
 */
export async function getSighting(id) {
	const response = await api.get(`/api/sightings/${id}`);
	return response.sighting;
}

/**
 * List all sightings for the authenticated user
 * Returns sightings sorted by creation date (newest first)
 *
 * @param {Object} [options] - Query options
 * @param {number} [options.limit] - Max sightings to return (default: no limit, P2)
 * @param {number} [options.offset] - Pagination offset (default: 0, P2)
 * @returns {Promise<Sighting[]>} Array of sighting objects
 * @throws {ApiError} If not authenticated (401)
 */
export async function listSightings(options = {}) {
	let endpoint = '/api/sightings';

	// Add query params if provided (P2 feature)
	const params = [];
	if (options.limit !== undefined) {
		params.push(`limit=${options.limit}`);
	}
	if (options.offset !== undefined) {
		params.push(`offset=${options.offset}`);
	}

	if (params.length > 0) {
		endpoint += `?${params.join('&')}`;
	}

	const response = await api.get(endpoint);
	return response.sightings || [];
}

/**
 * Delete a sighting by ID (soft delete)
 * User must own the sighting to delete it
 *
 * @param {string} id - Sighting ID
 * @returns {Promise<void>}
 * @throws {ApiError} If sighting not found (404), not owner (403), or auth fails (401)
 */
export async function deleteSighting(id) {
	await api.del(`/api/sightings/${id}`);
}
