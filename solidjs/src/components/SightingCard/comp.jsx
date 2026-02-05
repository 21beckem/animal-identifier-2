/**
 * Sighting Card Component
 * Optimized for performance with lazy loading and blur-up effect
 */

import { createSignal, Show } from 'solid-js';
import './SightingCard.css';

export default function SightingCard(props) {
	const [imageLoaded, setImageLoaded] = createSignal(false);
	const [imageError, setImageError] = createSignal(false);

	/**
	 * Generate a tiny blurred placeholder (1x1 pixel base64 green)
	 */
	const blurPlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23e6efe0" width="100" height="100"/%3E%3C/svg%3E';

	/**
	 * Extract base64 data from photo_url to reduce initial load
	 */
	const getCompressedBase64 = (fullBase64) => {
		if (!fullBase64 || !fullBase64.startsWith('data:image')) return null;

		// For images larger than 100KB, skip loading to avoid blocking
		if (fullBase64.length > 100000) {
			return null;
		}

		return fullBase64;
	};

	/**
	 * Handle image load completion
	 */
	const handleImageLoad = () => {
		setImageLoaded(true);
	};

	/**
	 * Handle image load error
	 */
	const handleImageError = () => {
		setImageError(true);
	};

	const photoUrl = getCompressedBase64(props.sighting.photo_url);

	return (
		<article class="sighting-card">
			{/* Image Container with Lazy Loading */}
			<div class="sighting-card__image-wrapper">
				<Show
					when={photoUrl && !imageError()}
					fallback={
						<div class="sighting-card__placeholder">
							<span class="placeholder-icon">📷</span>
							<span class="placeholder-text">No photo</span>
						</div>
					}
				>
					{/* Blur-up effect: show placeholder while loading */}
					<img
						src={blurPlaceholder}
						alt="Loading..."
						class="sighting-card__image sighting-card__image--placeholder"
						aria-hidden="true"
					/>

					{/* Actual image - lazy loaded */}
					<img
						src={photoUrl}
						alt={`Photo of ${props.sighting.animal_name}`}
						class={`sighting-card__image ${imageLoaded() ? 'loaded' : ''}`}
						onLoad={handleImageLoad}
						onError={handleImageError}
						loading="lazy"
						decoding="async"
					/>

					{/* Loading skeleton while image loads */}
					<Show when={!imageLoaded()}>
						<div class="sighting-card__image-skeleton" aria-busy="true" />
					</Show>
				</Show>
			</div>

			{/* Content */}
			<div class="sighting-card__content">
				<h3 class="sighting-card__title">{props.sighting.animal_name}</h3>
				<p class="sighting-card__location">
					<span class="icon">📍</span>
					{props.sighting.location}
				</p>
				<p class="sighting-card__date">
					<span class="icon">🕒</span>
					{props.formatDate(props.sighting.timestamp_sighted)}
				</p>
			</div>

			{/* Actions */}
			<div class="sighting-card__actions">
				<Show
					when={props.deleteConfirm === props.sighting.id}
					fallback={
						<>
							<button
								onclick={() => props.onEdit(props.sighting.id)}
								class="btn btn-secondary btn-sm"
								aria-label={`Edit ${props.sighting.animal_name}`}
							>
								✏️ Edit
							</button>
							<button
								onclick={() => props.onDelete(props.sighting.id)}
								class="btn btn-danger btn-sm"
								aria-label={`Delete ${props.sighting.animal_name}`}
							>
								🗑️ Delete
							</button>
						</>
					}
				>
					<div class="confirm-delete">
						<p class="confirm-text">Delete this sighting?</p>
						<button
							onclick={() => props.onDelete(props.sighting.id)}
							class="btn btn-danger btn-sm"
						>
							Yes, Delete
						</button>
						<button
							onclick={props.onCancelDelete}
							class="btn btn-secondary btn-sm"
						>
							Cancel
						</button>
					</div>
				</Show>
			</div>
		</article>
	);
}
