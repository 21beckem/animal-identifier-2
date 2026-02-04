/**
 * Local Storage Service
 *
 * Handles browser localStorage for session token, form drafts, and preferences.
 */

const SESSION_KEY = 'session_token';
const FORM_DRAFT_KEY = 'sighting_form_draft';
const USER_KEY = 'current_user';

/**
 * Save session token to localStorage
 *
 * @param {string} token - Session token (usually sessionId from cookie, but kept for future use)
 */
export function saveSession(token) {
	if (token) {
		localStorage.setItem(SESSION_KEY, token);
	} else {
		localStorage.removeItem(SESSION_KEY);
	}
}

/**
 * Load session token from localStorage
 *
 * @returns {string|null} Session token or null if not found
 */
export function loadSession() {
	return localStorage.getItem(SESSION_KEY);
}

/**
 * Clear session token from localStorage
 */
export function clearSession() {
	localStorage.removeItem(SESSION_KEY);
	localStorage.removeItem(USER_KEY);
}

/**
 * Save current user object to localStorage
 *
 * @param {User} user - User object
 */
export function saveUser(user) {
	if (user) {
		localStorage.setItem(USER_KEY, JSON.stringify(user));
	}
}

/**
 * Load current user object from localStorage
 *
 * @returns {User|null} User object or null if not found
 */
export function loadUser() {
	const json = localStorage.getItem(USER_KEY);
	if (!json) return null;

	try {
		return JSON.parse(json);
	} catch {
		return null;
	}
}

/**
 * Save sighting form draft to localStorage
 * Useful for recovering form state if user closes tab/browser
 *
 * @param {CreateSightingFormData} data - Form data to save
 */
export function saveFormDraft(data) {
	if (data) {
		localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(data));
	}
}

/**
 * Load sighting form draft from localStorage
 *
 * @returns {CreateSightingFormData|null} Saved form data or null if not found
 */
export function loadFormDraft() {
	const json = localStorage.getItem(FORM_DRAFT_KEY);
	if (!json) return null;

	try {
		return JSON.parse(json);
	} catch {
		return null;
	}
}

/**
 * Clear sighting form draft from localStorage
 * Called after successful submission
 */
export function clearFormDraft() {
	localStorage.removeItem(FORM_DRAFT_KEY);
}

/**
 * Get all stored preferences/draft data
 * Useful for debugging or migrating data
 *
 * @returns {Object} Object containing all stored keys and values
 */
export function getAllStored() {
	return {
		session: loadSession(),
		user: loadUser(),
		formDraft: loadFormDraft(),
	};
}

/**
 * Clear all stored data
 * Called on account deletion or logout
 */
export function clearAll() {
	clearSession();
	clearFormDraft();
}
