/**
 * User Dashboard Page
 *
 * Displays list of user's sightings with edit/delete capabilities.
 * Includes loading states, empty state, and sighting management.
 */

import { createSignal, onMount, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { listSightings, deleteSighting } from '../services/sightings';
import SightingCard from '../components/SightingCard/comp';
import LoadingSpinner from '../components/LoadingSpinner/comp';
import './UserDashboard.css';

export default function UserDashboard() {
	const navigate = useNavigate();
	const [sightings, setSightings] = createSignal([]);
	const [isLoading, setIsLoading] = createSignal(true);
	const [error, setError] = createSignal('');
	const [deleteConfirm, setDeleteConfirm] = createSignal(null);

	/**
	 * Load sightings on mount
	 */
	onMount(async () => {
		await loadSightings();
	});

	/**
	 * Fetch sightings from API
	 */
	const loadSightings = async () => {
		setIsLoading(true);
		setError('');
		
		try {
			const data = await listSightings();
			setSightings(data);
		} catch (err) {
			console.error('Failed to load sightings:', err);
			setError('Failed to load sightings. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Handle sighting deletion
	 */
	const handleDelete = async (id) => {
		if (deleteConfirm() !== id) {
			setDeleteConfirm(id);
			return;
		}

		try {
			await deleteSighting(id);
			// Remove from local state
			setSightings(sightings().filter(s => s.id !== id));
			setDeleteConfirm(null);
		} catch (err) {
			console.error('Failed to delete sighting:', err);
			alert('Failed to delete sighting. Please try again.');
		}
	};

	/**
	 * Cancel delete confirmation
	 */
	const cancelDelete = () => {
		setDeleteConfirm(null);
	};

	/**
	 * Navigate to edit page
	 */
	const handleEdit = (id) => {
		navigate(`/sightings/${id}/edit`);
	};

	/**
	 * Navigate to create page
	 */
	const handleCreateNew = () => {
		navigate('/create-sighting');
	};

	/**
	 * Format timestamp for display
	 */
	const formatDate = (timestamp) => {
		if (!timestamp) return 'Unknown date';
		
		// Convert Unix timestamp (seconds) to milliseconds
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
		<div class="dashboard-page">
			<div class="dashboard-header">
				<h1>My Sightings</h1>
				<button
					onclick={handleCreateNew}
					class="btn btn-primary"
				>
					+ Add New Sighting
				</button>
			</div>

			{/* Loading State */}
			<Show when={isLoading()}>
				<div class="dashboard-loading">
					<LoadingSpinner />
					<p>Loading your sightings...</p>
				</div>
			</Show>

			{/* Error State */}
			<Show when={error()}>
				<div class="alert alert-error">
					<span class="alert-icon">⚠</span>
					<p>{error()}</p>
					<button onclick={loadSightings} class="btn btn-secondary">
						Retry
					</button>
				</div>
			</Show>

			{/* Empty State */}
			<Show when={!isLoading() && !error() && sightings().length === 0}>
				<div class="dashboard-empty">
					<div class="empty-icon">🦅</div>
					<h2>No sightings yet</h2>
					<p>Start documenting your wildlife observations by creating your first sighting!</p>
					<button onclick={handleCreateNew} class="btn btn-primary">
						Create Your First Sighting
					</button>
				</div>
			</Show>

			{/* Sightings List */}
			<Show when={!isLoading() && !error() && sightings().length > 0}>
				<div class="sightings-grid">
					<For each={sightings()}>
						{(sighting) => (
							<SightingCard
								sighting={sighting}
								deleteConfirm={deleteConfirm()}
								onEdit={handleEdit}
								onDelete={handleDelete}
								onCancelDelete={cancelDelete}
								formatDate={formatDate}
							/>
						)}
					</For>
				</div>
			</Show>
		</div>
	);
}
