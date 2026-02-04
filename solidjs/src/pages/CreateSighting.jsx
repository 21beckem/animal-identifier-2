import { createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import SightingForm from '../components/SightingForm/comp';
import { createSighting } from '../services/sightings';

/**
 * CreateSighting Page
 * 
 * Protected route for authenticated users to create new wildlife sightings.
 * Displays SightingForm and handles submission to backend API.
 */
export default function CreateSighting() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = createSignal(false);
	const [error, setError] = createSignal('');
	const [success, setSuccess] = createSignal(false);

	/**
	 * Handles sighting creation submission
	 */
	const handleSubmit = async (formData) => {
		setIsLoading(true);
		setError('');
		setSuccess(false);

		try {
			await createSighting(
				formData.animal_name,
				formData.location,
				formData.photo_url
			);

			setSuccess(true);
			
			// Redirect to dashboard after short delay (allows user to see success message)
			setTimeout(() => {
				navigate('/dashboard');
			}, 1500);

		} catch (err) {
			console.error('Create sighting error:', err);
			
			// Extract error message from API response
			let errorMessage = 'Failed to create sighting. Please try again.';
			
			if (err?.error) {
				errorMessage = err.error;
			} else if (err?.message) {
				errorMessage = err.message;
			}
			
			setError(errorMessage);
			setIsLoading(false);
		}
	};

	/**
	 * Retries submission after error
	 */
	const handleRetry = () => {
		setError('');
	};

	return (
		<div class="create-sighting-page">
			<div class="page-header">
				<h1>Create New Sighting</h1>
				<p class="page-description">
					Record a wildlife sighting with details and an optional photo
				</p>
			</div>

			{/* Error Message */}
			<Show when={error()}>
				<div class="alert alert-error">
					<span class="alert-icon">⚠</span>
					<div class="alert-content">
						<p class="alert-message">{error()}</p>
						<button
							onClick={handleRetry}
							class="retry-btn"
							type="button"
						>
							Try Again
						</button>
					</div>
				</div>
			</Show>

			{/* Success Message */}
			<Show when={success()}>
				<div class="alert alert-success">
					<span class="alert-icon">✓</span>
					<div class="alert-content">
						<p class="alert-message">
							Sighting created successfully! Redirecting to dashboard...
						</p>
					</div>
				</div>
			</Show>

			{/* Sighting Form */}
			<SightingForm
				onSubmit={handleSubmit}
				isLoading={isLoading()}
			/>
		</div>
	);
}
