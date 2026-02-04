/**
 * Validation Utility Functions
 *
 * Reusable validation functions for use in endpoints and middleware.
 */

import { emailSchema, passwordSchema, photoUrlSchema } from './schemas';
import { z } from 'zod';

/**
 * Validate email format
 *
 * @param email - Email address to validate
 * @returns Parsed email (lowercased) or throws ZodError
 */
export function validateEmail(email: string): string {
	return emailSchema.parse(email);
}

/**
 * Validate password strength
 * Requires: 8+ characters, at least 1 uppercase letter
 *
 * @param password - Password to validate
 * @returns true if valid, throws ZodError with message otherwise
 */
export function validatePassword(password: string): string {
	return passwordSchema.parse(password);
}

/**
 * Validate photo URL format (base64 data URL)
 *
 * @param photoUrl - Photo URL to validate (optional)
 * @returns Parsed photo URL or null/undefined if not provided, throws ZodError if invalid format
 */
export function validatePhotoUrl(photoUrl?: string | null): string | null | undefined {
	return photoUrlSchema.parse(photoUrl);
}

/**
 * Check if validation error is a ZodError
 *
 * @param error - Error to check
 * @returns true if error is a ZodError
 */
export function isValidationError(error: unknown): error is z.ZodError {
	return error instanceof z.ZodError;
}

/**
 * Format ZodError into field-specific error messages
 *
 * @param error - ZodError from validation
 * @returns Object with field names mapped to error messages
 */
export function formatValidationErrors(error: z.ZodError): Record<string, string> {
	const errors: Record<string, string> = {};

	for (const issue of error.issues) {
		const path = issue.path.join('.');
		errors[path || 'unknown'] = issue.message;
	}

	return errors;
}
