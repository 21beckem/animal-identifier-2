/**
 * Authentication Service
 *
 * Handles user signup, signin, signout, and session management.
 * Uses API client to communicate with backend auth endpoints.
 * Integrates with auth store for state management.
 */

import * as api from './api';
import authStore from '../stores/auth';

/**
 * Sign up a new user
 *
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<User>} Created user object
 * @throws {ApiError} If signup fails (validation, duplicate email, etc.)
 */
export async function signup(email, password) {
	const response = await api.post('/api/auth/signup', {
		email,
		password,
	});

	// After successful signup, update auth store
	if (response && response.user) {
		authStore.setUser(response.user);
	} else if (response) {
		authStore.setUser(response);
	}

	return response;
}

/**
 * Sign in an existing user
 *
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<User>} Authenticated user object (session cookie set by backend)
 * @throws {ApiError} If signin fails (invalid credentials, etc.)
 */
export async function signin(email, password) {
	const response = await api.post('/api/auth/signin', {
		email,
		password,
	});

	// After successful signin, update auth store
	if (response && response.user) {
		authStore.setUser(response.user);
	} else if (response) {
		authStore.setUser(response);
	}

	return response;
}

/**
 * Sign out the current user (logout)
 *
 * @returns {Promise<void>}
 * @throws {ApiError} If signout fails
 */
export async function signout() {
	await api.post('/api/auth/signout', {});
	// Clear auth store after signout
	authStore.clearUser();
}

/**
 * Get current authenticated user
 * Calls GET /api/auth/me to verify session and retrieve user info
 *
 * @returns {Promise<User>} Current user object
 * @throws {ApiError} If not authenticated (401) or server error
 */
export async function getCurrentUser() {
	const response = await api.get('/api/auth/me');
	return response;
}

/**
 * Check if user has an active session
 * Calls GET /api/auth/me without throwing on 401 (handles silently)
 *
 * @returns {Promise<User|null>} User object if authenticated, null otherwise
 */
export async function checkSession() {
	try {
		const user = await getCurrentUser();
		return user;
	} catch (error) {
		// 401 or network error means not authenticated
		if (error.status === 401 || error.status === 0) {
			return null;
		}

		// Re-throw other errors (500, etc.)
		throw error;
	}
}
