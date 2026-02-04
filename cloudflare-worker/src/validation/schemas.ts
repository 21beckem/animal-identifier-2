/**
 * Zod Validation Schemas
 *
 * Reusable validation schemas for API request validation.
 * Used in endpoints to validate and parse incoming requests.
 */

import { z } from 'zod';

/**
 * Email validation schema
 * Matches standard email format (simple validation)
 */
export const emailSchema = z
	.string()
	.email('Invalid email address')
	.toLowerCase()
	.trim();

/**
 * Password validation schema
 * Requires: 8+ characters, at least 1 uppercase letter
 */
export const passwordSchema = z
	.string()
	.min(8, 'Password must be at least 8 characters')
	.regex(/[A-Z]/, 'Password must contain at least one uppercase letter');

/**
 * Animal name validation
 * Required field, 1-200 characters
 */
export const animalNameSchema = z
	.string()
	.min(1, 'Animal name is required')
	.max(200, 'Animal name must not exceed 200 characters')
	.trim();

/**
 * Location validation
 * Required field, 1-500 characters
 */
export const locationSchema = z
	.string()
	.min(1, 'Location is required')
	.max(500, 'Location must not exceed 500 characters')
	.trim();

/**
 * Photo URL validation (base64 data URL format)
 * Optional, must start with 'data:image/' and be properly formatted
 * Max ~2.9MB (2MB original size encoded as base64 = 1.33x = 2.66MB)
 */
export const photoUrlSchema = z
	.string()
	.regex(/^data:image\/(jpeg|jpg|png|webp);base64,/, 'Photo must be a valid base64 data URL (JPEG, PNG, or WebP)')
	.max(2900000, 'Photo must be less than 2MB (base64 encoded)')
	.optional()
	.nullable();

/**
 * Sign-up request validation schema
 */
export const signupSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
});

export type SignupInput = z.infer<typeof signupSchema>;

/**
 * Sign-in request validation schema
 */
export const signinSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, 'Password is required'),
});

export type SigninInput = z.infer<typeof signinSchema>;

/**
 * Create sighting request validation schema
 */
export const createSightingSchema = z.object({
	animal_name: animalNameSchema,
	location: locationSchema,
	photo_url: photoUrlSchema,
});

export type CreateSightingInput = z.infer<typeof createSightingSchema>;

/**
 * Update sighting request validation schema (all fields optional)
 */
export const updateSightingSchema = z.object({
	animal_name: animalNameSchema.optional(),
	location: locationSchema.optional(),
	photo_url: photoUrlSchema,
}).strict(); // No extra fields

export type UpdateSightingInput = z.infer<typeof updateSightingSchema>;

/**
 * Parse and validate a request body against a schema
 * Returns parsed value or throws ZodError (which is caught by middleware)
 */
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
	return schema.parse(data);
}
