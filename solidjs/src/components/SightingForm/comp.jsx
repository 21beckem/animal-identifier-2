import { createSignal, Show } from 'solid-js';
import { processPhotoFile, getImagePreviewUrl } from '../../utils/photoConverter';
import './style.css';

/**
 * SightingForm Component
 * 
 * Form for creating new wildlife sightings with photo upload.
 * Handles validation, photo conversion to base64, and preview display.
 * 
 * @param {Object} props
 * @param {(data: {animal_name: string, location: string, photo_url: string | null}) => Promise<void>} props.onSubmit - Callback when form is submitted
 * @param {boolean} [props.isLoading=false] - Loading state (disables form during submission)
 */
export default function SightingForm(props) {
	const [animalName, setAnimalName] = createSignal('');
	const [location, setLocation] = createSignal('');
	const [photoBase64, setPhotoBase64] = createSignal(null);
	const [photoPreview, setPhotoPreview] = createSignal('');
	const [photoFileName, setPhotoFileName] = createSignal('');
	
	const [errors, setErrors] = createSignal({
		animalName: '',
		location: '',
		photo: ''
	});

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
			// User cancelled or cleared selection
			setPhotoBase64(null);
			setPhotoPreview('');
			setPhotoFileName('');
			setErrors({ ...errors(), photo: '' });
			return;
		}

		// Process the photo file (validate + convert)
		const result = await processPhotoFile(file);
		
		if (result.success) {
			setPhotoBase64(result.data);
			setPhotoPreview(getImagePreviewUrl(result.data));
			setPhotoFileName(file.name);
			setErrors({ ...errors(), photo: '' });
		} else {
			setPhotoBase64(null);
			setPhotoPreview('');
			setPhotoFileName('');
			setErrors({ ...errors(), photo: result.error });
			
			// Clear the file input
			event.target.value = '';
		}
	};

	/**
	 * Removes the selected photo
	 */
	const clearPhoto = () => {
		setPhotoBase64(null);
		setPhotoPreview('');
		setPhotoFileName('');
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

		// Call parent's onSubmit handler
		await props.onSubmit({
			animal_name: animalName().trim(),
			location: location().trim(),
			photo_url: photoBase64()
		});
	};

	return (
		<div class="sighting-form-container">
			<form onSubmit={handleSubmit} class="sighting-form">
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
						disabled={props.isLoading}
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
						placeholder="e.g., Central Park, New York or 40.7829° N, 73.9654° W"
						disabled={props.isLoading}
						maxLength={500}
					/>
					<Show when={errors().location}>
						<span class="error-message">{errors().location}</span>
					</Show>
				</div>

				{/* Timestamp Display */}
				<div class="form-group">
					<label for="timestamp">Date & Time</label>
					<input
						id="timestamp"
						type="text"
						value={new Date().toLocaleString()}
						disabled
						readonly
						class="readonly-field"
					/>
					<span class="field-hint">Automatically recorded when you submit</span>
				</div>

				{/* Photo Upload Field */}
				<div class="form-group">
					<label for="photo-input">
						Photo <span class="optional">(optional)</span>
					</label>
					<input
						id="photo-input"
						type="file"
						accept="image/jpeg,image/jpg,image/png,image/webp"
						onChange={handlePhotoChange}
						disabled={props.isLoading}
						class="file-input"
					/>
					<Show when={errors().photo}>
						<span class="error-message">{errors().photo}</span>
					</Show>
					<span class="field-hint">JPEG, PNG, or WebP · Maximum 2MB</span>
				</div>

				{/* Photo Preview */}
				<Show when={photoPreview()}>
					<div class="photo-preview">
						<div class="preview-header">
							<span class="preview-label">Preview: {photoFileName()}</span>
							<button
								type="button"
								onClick={clearPhoto}
								disabled={props.isLoading}
								class="clear-photo-btn"
								aria-label="Remove photo"
							>
								✕
							</button>
						</div>
						<img
							src={photoPreview()}
							alt="Photo preview"
							class="preview-image"
						/>
					</div>
				</Show>

				{/* Submit Button */}
				<button
					type="submit"
					disabled={props.isLoading}
					class="submit-btn"
				>
					<Show when={props.isLoading} fallback="Create Sighting">
						Creating...
					</Show>
				</button>
			</form>
		</div>
	);
}
