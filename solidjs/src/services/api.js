/**
 * API Client Service
 *
 * Handles all HTTP communication with the backend API.
 * Provides error handling, response parsing, and automatic JSON serialization.
 */

/**
 * Make an API request to the backend
 *
 * @param {string} method - HTTP method (GET, POST, PATCH, DELETE)
 * @param {string} endpoint - API endpoint path (e.g., '/api/auth/signin')
 * @param {any} [body] - Request body (will be JSON serialized)
 * @returns {Promise<any>} Parsed JSON response
 * @throws {ApiError} If request fails or response is not OK
 */
export async function request(method, endpoint, body = null) {
	const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';
	const url = `${apiBaseUrl}${endpoint}`;

	const options = {
		method,
		credentials: 'include', // Include cookies for session auth
		headers: {
			'Content-Type': 'application/json',
		},
	};

	if (body) {
		options.body = JSON.stringify(body);
	}

	try {
		const response = await fetch(url, options);
		const contentType = response.headers.get('content-type');
		const data = contentType?.includes('application/json') ? await response.json() : null;

		if (!response.ok) {
			throw {
				status: response.status,
				message: data?.error || `HTTP ${response.status}`,
				details: data?.details || {},
			};
		}

		return data;
	} catch (error) {
		// Network error or JSON parse error
		if (error instanceof TypeError) {
			throw {
				status: 0,
				message: 'Network error. Please check your connection and try again.',
			};
		}

		// Re-throw API errors
		if (error.status !== undefined) {
			throw error;
		}

		// Unknown error
		throw {
			status: 0,
			message: 'An unexpected error occurred. Please try again.',
		};
	}
}

/**
 * GET request helper
 *
 * @param {string} endpoint - API endpoint path
 * @returns {Promise<any>} Response data
 */
export function get(endpoint) {
	return request('GET', endpoint);
}

/**
 * POST request helper
 *
 * @param {string} endpoint - API endpoint path
 * @param {any} body - Request body
 * @returns {Promise<any>} Response data
 */
export function post(endpoint, body) {
	return request('POST', endpoint, body);
}

/**
 * PATCH request helper
 *
 * @param {string} endpoint - API endpoint path
 * @param {any} body - Request body
 * @returns {Promise<any>} Response data
 */
export function patch(endpoint, body) {
	return request('PATCH', endpoint, body);
}

/**
 * DELETE request helper
 *
 * @param {string} endpoint - API endpoint path
 * @returns {Promise<any>} Response data
 */
export function del(endpoint) {
	return request('DELETE', endpoint);
}
