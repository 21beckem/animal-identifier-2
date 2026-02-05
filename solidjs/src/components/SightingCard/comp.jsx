/**
 * Sighting Card Component
 * Optimized for performance with lazy loading and blur-up effect
 */

import { createSignal, Show } from 'solid-js';
import './style.css';

export default function SightingCard(props) {
	const [imageLoaded, setImageLoaded] = createSignal(false);
	const [imageError, setImageError] = createSignal(false);

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

	const photoUrl = props.sighting.photo_url;
	

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
					{/* Loading skeleton while image loads */}
					<Show when={!imageLoaded()}>
						<div class="sighting-card__image-skeleton" aria-busy="true" />
					</Show>

					{/* Actual image - lazy loaded */}
					<img
						src={photoUrl}
						alt={`Photo of ${props.sighting.animal_name}`}
						class="sighting-card__image"
						onLoad={handleImageLoad}
						onError={handleImageError}
						loading="lazy"
						decoding="async"
					/>
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
