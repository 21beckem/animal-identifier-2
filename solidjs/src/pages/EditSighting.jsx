/**
 * Edit Sighting Page
 *
 * Allows editing of existing sighting with photo replacement.
 */

import { createSignal, onMount, Show } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { getSighting, updateSighting } from '../services/sightings';
import { processPhotoFile, getImagePreviewUrl } from '../utils/photoConverter';
import LoadingSpinner from '../components/LoadingSpinner/comp';
import './EditSighting.css';

export default function EditSighting() {
	const params = useParams();
	const navigate = useNavigate();
	
	const [sighting, setSighting] = createSignal(null);
	const [isLoading, setIsLoading] = createSignal(true);
	const [isSaving, setIsSaving] = createSignal(false);
	const [error, setError] = createSignal('');
	const [success, setSuccess] = createSignal(false);

	// Form state
	const [animalName, setAnimalName] = createSignal('');
	const [location, setLocation] = createSignal('');
	const [photoBase64, setPhotoBase64] = createSignal(null);
	const [photoPreview, setPhotoPreview] = createSignal('');
	const [photoFileName, setPhotoFileName] = createSignal('');
	const [photoChanged, setPhotoChanged] = createSignal(false);
	
	const [errors, setErrors] = createSignal({
		animalName: '',
		location: '',
		photo: ''
	});

	/**
	 * Load sighting on mount
	 */
	onMount(async () => {
		await loadSighting();
	});

	/**
	 * Fetch sighting details
	 */
	const loadSighting = async () => {
		setIsLoading(true);
		setError('');
		
		try {
			const data = await getSighting(params.id);
			setSighting(data);
			
			// Populate form fields
			setAnimalName(data.animal_name || '');
			setLocation(data.location || '');
			
			// Set existing photo if available
			if (data.photo_url) {
				setPhotoPreview(data.photo_url);
			}
		} catch (err) {
			console.error('Failed to load sighting:', err);
			setError('Failed to load sighting. It may not exist or you may not have permission to edit it.');
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Validates animal name field
	 */
	const validateAnimalName = () => {
		const name = animalName().trim();
		if (!name) {
			setErrors({ ...errors(), animalName: 'Animal name is required' });
			return false;
		}
		if (name.length > 200) {
			setErrors({ ...errors(), animalName: 'Animal name must be 200 characters or less' });
			return false;
		}
		setErrors({ ...errors(), animalName: '' });
		return true;
	};

	/**
	 * Validates location field
	 */
	const validateLocation = () => {
		const loc = location().trim();
		if (!loc) {
			setErrors({ ...errors(), location: 'Location is required' });
			return false;
		}
		if (loc.length > 500) {
			setErrors({ ...errors(), location: 'Location must be 500 characters or less' });
			return false;
		}
		setErrors({ ...errors(), location: '' });
		return true;
	};

	/**
	 * Handles photo file selection
	 */
	const handlePhotoChange = async (event) => {
		const file = event.target.files?.[0];
		
		if (!file) {
			return;
		}

		// Process the photo file (validate + convert)
		const result = await processPhotoFile(file);
		
		if (result.success) {
			setPhotoBase64(result.data);
			setPhotoPreview(getImagePreviewUrl(result.data));
			setPhotoFileName(file.name);
			setPhotoChanged(true);
			setErrors({ ...errors(), photo: '' });
		} else {
			setErrors({ ...errors(), photo: result.error });
			event.target.value = '';
		}
	};

	/**
	 * Removes the photo
	 */
	const clearPhoto = () => {
		setPhotoBase64(null);
		setPhotoPreview('');
		setPhotoFileName('');
		setPhotoChanged(true);
		setErrors({ ...errors(), photo: '' });
		
		// Clear the file input
		const fileInput = document.getElementById('photo-input');
		if (fileInput) {
			fileInput.value = '';
		}
	};

	/**
	 * Handles form submission
	 */
	const handleSubmit = async (event) => {
		event.preventDefault();

		// Validate all fields
		const isAnimalNameValid = validateAnimalName();
		const isLocationValid = validateLocation();

		if (!isAnimalNameValid || !isLocationValid) {
			return;
		}

		setIsSaving(true);
		setError('');
		setSuccess(false);

		try {
			// Build update payload (only include changed fields)
			const updates = {};
			
			if (animalName().trim() !== sighting()?.animal_name) {
				updates.animal_name = animalName().trim();
			}
			
			if (location().trim() !== sighting()?.location) {
				updates.location = location().trim();
			}
			
			// Only include photo_url if photo was changed
			if (photoChanged()) {
				updates.photo_url = photoBase64();
			}

			await updateSighting(params.id, updates);

			setSuccess(true);
			
			// Redirect to dashboard after short delay
			setTimeout(() => {
				navigate('/dashboard');
			}, 1500);

		} catch (err) {
			console.error('Update sighting error:', err);
			
			let errorMessage = 'Failed to update sighting. Please try again.';
			if (err?.error) {
				errorMessage = err.error;
			} else if (err?.message) {
				errorMessage = err.message;
			}
			
			setError(errorMessage);
		} finally {
			setIsSaving(false);
		}
	};

	/**
	 * Format timestamp for display
	 */
	const formatDate = (timestamp) => {
		if (!timestamp) return 'Unknown date';
		const date = new Date(timestamp * 1000);
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	};

	return (
		<div class="edit-sighting-page">
			{/* Loading State */}
			<Show when={isLoading()}>
				<div class="loading-container">
					<LoadingSpinner />
					<p>Loading sighting...</p>
				</div>
			</Show>

			{/* Error Loading */}
			<Show when={!isLoading() && error() && !sighting()}>
				<div class="error-container">
					<div class="alert alert-error">
						<span class="alert-icon">⚠</span>
						<p>{error()}</p>
					</div>
					<button onclick={() => navigate('/dashboard')} class="btn btn-secondary">
						Back to Dashboard
					</button>
				</div>
			</Show>

			{/* Edit Form */}
			<Show when={!isLoading() && sighting()}>
				<div class="page-header">
					<h1>Edit Sighting</h1>
					<p class="page-description">
						Update details for your wildlife sighting
					</p>
				</div>

				{/* Error Message */}
				<Show when={error() && sighting()}>
					<div class="alert alert-error">
						<span class="alert-icon">⚠</span>
						<p>{error()}</p>
					</div>
				</Show>

				{/* Success Message */}
				<Show when={success()}>
					<div class="alert alert-success">
						<span class="alert-icon">✓</span>
						<p>Sighting updated successfully! Redirecting to dashboard...</p>
					</div>
				</Show>

				<form onSubmit={handleSubmit} class="edit-form">
					{/* Animal Name Field */}
					<div class="form-group">
						<label for="animal-name">
							Animal Name <span class="required">*</span>
						</label>
						<input
							id="animal-name"
							type="text"
							value={animalName()}
							onInput={(e) => setAnimalName(e.target.value)}
							onBlur={validateAnimalName}
							placeholder="e.g., Red Fox, Great Blue Heron"
							disabled={isSaving()}
							maxLength={200}
						/>
						<Show when={errors().animalName}>
							<span class="error-message">{errors().animalName}</span>
						</Show>
					</div>

					{/* Location Field */}
					<div class="form-group">
						<label for="location">
							Location <span class="required">*</span>
						</label>
						<input
							id="location"
							type="text"
							value={location()}
							onInput={(e) => setLocation(e.target.value)}
							onBlur={validateLocation}
							placeholder="e.g., Central Park, New York"
							disabled={isSaving()}
							maxLength={500}
						/>
						<Show when={errors().location}>
							<span class="error-message">{errors().location}</span>
						</Show>
					</div>

					{/* Timestamp Display (Read-only) */}
					<div class="form-group">
						<label for="timestamp">Date & Time</label>
						<input
							id="timestamp"
							type="text"
							value={formatDate(sighting()?.timestamp_sighted)}
							disabled
							readonly
							class="readonly-field"
						/>
						<span class="field-hint">Original sighting date (cannot be changed)</span>
					</div>

					{/* Current Photo */}
					<Show when={photoPreview() && !photoChanged()}>
						<div class="current-photo">
							<label>Current Photo</label>
							<div class="photo-container">
								<img
									src={photoPreview()}
									alt="Current sighting photo"
									class="current-photo-img"
								/>
								<button
									type="button"
									onClick={clearPhoto}
									disabled={isSaving()}
									class="btn btn-danger btn-sm"
								>
									Remove Photo
								</button>
							</div>
						</div>
					</Show>

					{/* Photo Upload Field */}
					<div class="form-group">
						<label for="photo-input">
							{photoPreview() && !photoChanged() ? 'Replace Photo' : 'Photo'} <span class="optional">(optional)</span>
						</label>
						<input
							id="photo-input"
							type="file"
							accept="image/jpeg,image/jpg,image/png,image/webp"
							onChange={handlePhotoChange}
							disabled={isSaving()}
							class="file-input"
						/>
						<Show when={errors().photo}>
							<span class="error-message">{errors().photo}</span>
						</Show>
						<span class="field-hint">JPEG, PNG, or WebP · Maximum 2MB</span>
					</div>

					{/* New Photo Preview */}
					<Show when={photoChanged() && photoPreview()}>
						<div class="photo-preview">
							<div class="preview-header">
								<span class="preview-label">New Photo: {photoFileName()}</span>
								<button
									type="button"
									onClick={clearPhoto}
									disabled={isSaving()}
									class="clear-photo-btn"
									aria-label="Remove new photo"
								>
									✕
								</button>
							</div>
							<img
								src={photoPreview()}
								alt="New photo preview"
								class="preview-image"
							/>
						</div>
					</Show>

					{/* Action Buttons */}
					<div class="form-actions">
						<button
							type="submit"
							disabled={isSaving()}
							class="btn btn-primary"
						>
							<Show when={isSaving()} fallback="Save Changes">
								Saving...
							</Show>
						</button>
						<button
							type="button"
							onclick={() => navigate('/dashboard')}
							disabled={isSaving()}
							class="btn btn-secondary"
						>
							Cancel
						</button>
					</div>
				</form>
			</Show>
		</div>
	);
}
