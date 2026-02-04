/**
 * Photo Conversion Utilities
 * 
 * Handles file-to-base64 conversion, validation, and preview generation for photo uploads.
 */

/**
 * Maximum allowed photo size in bytes (2MB)
 */
const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB

/**
 * Allowed image MIME types
 */
const ALLOWED_MIME_TYPES = [
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/webp'
];

/**
 * Validates a photo file before upload
 * @param {File} file - The file to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validatePhotoFile(file) {
	if (!file) {
		return { valid: false, error: 'No file provided' };
	}

	// Check MIME type
	if (!ALLOWED_MIME_TYPES.includes(file.type)) {
		return {
			valid: false,
			error: `Invalid file format. Please upload a JPEG, PNG, or WebP image.`
		};
	}

	// Check file size
	if (file.size > MAX_PHOTO_SIZE) {
		const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
		return {
			valid: false,
			error: `File size (${sizeMB}MB) exceeds 2MB limit. Please choose a smaller image.`
		};
	}

	return { valid: true };
}

/**
 * Converts a file to base64 data URL
 * @param {File} file - The file to convert
 * @returns {Promise<string>} Base64 data URL (e.g., "data:image/jpeg;base64,...")
 */
export function fileToBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		
		reader.onload = () => {
			if (typeof reader.result === 'string') {
				resolve(reader.result);
			} else {
				reject(new Error('Failed to convert file to base64 string'));
			}
		};
		
		reader.onerror = () => {
			reject(new Error('Failed to read file'));
		};
		
		reader.readAsDataURL(file);
	});
}

/**
 * Gets an image preview URL from a base64 string
 * (This is essentially a pass-through since base64 data URLs can be used directly in <img> src)
 * @param {string} base64String - Base64 data URL
 * @returns {string} Data URL suitable for <img> src attribute
 */
export function getImagePreviewUrl(base64String) {
	if (!base64String) {
		return '';
	}
	
	// Validate it's a data URL
	if (!base64String.startsWith('data:image/')) {
		console.warn('Invalid base64 image format');
		return '';
	}
	
	return base64String;
}

/**
 * Combined function to validate and convert a file to base64
 * @param {File} file - The file to process
 * @returns {Promise<{success: boolean, data?: string, error?: string}>} Result with base64 data or error
 */
export async function processPhotoFile(file) {
	// Validate first
	const validation = validatePhotoFile(file);
	if (!validation.valid) {
		return { success: false, error: validation.error };
	}

	// Convert to base64
	try {
		const base64 = await fileToBase64(file);
		return { success: true, data: base64 };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to process photo'
		};
	}
}
