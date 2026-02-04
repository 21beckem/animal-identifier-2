/**
 * Frontend Type Definitions (JSDoc)
 *
 * Type hints for frontend services and components.
 * Uses JSDoc comments for TypeScript-like type checking in JavaScript.
 */

/**
 * @typedef {Object} User
 * @property {string} id - User ID (UUID)
 * @property {string} email - User's email address
 * @property {number} created_at - Account creation timestamp (Unix seconds)
 * @property {number} [last_login_at] - Last login timestamp (optional)
 */

/**
 * @typedef {Object} Sighting
 * @property {string} id - Sighting ID (UUID)
 * @property {string} user_id - Owner's user ID
 * @property {string} animal_name - Name of animal sighted
 * @property {string} location - Location of sighting
 * @property {number} timestamp_sighted - When sighting occurred (Unix seconds)
 * @property {string|null} photo_url - Base64 data URL of photo (optional)
 * @property {number} created_at - Record creation timestamp
 * @property {number} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} SignupFormData
 * @property {string} email - User's email
 * @property {string} password - User's password
 * @property {string} confirmPassword - Password confirmation
 */

/**
 * @typedef {Object} SigninFormData
 * @property {string} email - User's email
 * @property {string} password - User's password
 * @property {boolean} [rememberMe] - Remember email for next time (optional)
 */

/**
 * @typedef {Object} CreateSightingFormData
 * @property {string} animal_name - Animal name
 * @property {string} location - Sighting location
 * @property {string|null} photo_url - Base64 photo (optional, generated from file input)
 * @property {number} timestamp_sighted - Auto-generated server timestamp
 */

/**
 * @typedef {Object} ApiResponse
 * @property {any} [data] - Response data (if successful)
 * @property {string} [error] - Error message (if failed)
 * @property {Record<string, string>} [details] - Field-specific errors from validation
 * @property {number} status - HTTP status code
 */

/**
 * @typedef {Object} ApiError
 * @property {string} message - Error message
 * @property {string} [field] - Field name (for form validation errors)
 * @property {number} status - HTTP status code
 */
