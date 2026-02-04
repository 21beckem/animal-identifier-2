/**
 * Routing Utilities
 *
 * Helper functions for navigation and auth-based routing.
 */

import { useNavigate } from '@solidjs/router';

/**
 * Get current route location
 *
 * @returns {string} Current pathname
 */
export function getCurrentPath() {
	return window.location.pathname;
}

/**
 * Check if user should be redirected to signin
 *
 * @param {any} user - Current user object
 * @returns {boolean} true if user is not authenticated
 */
export function isAuthRequired(user) {
	return !user;
}

/**
 * Hook: Navigate to signin page
 * Used in buttons/links to redirect unauthenticated users
 *
 * @param {any} user - Current user object
 */
export function getAuthStatus(user) {
	return {
		isAuthenticated: !!user,
		user: user || null,
	};
}
