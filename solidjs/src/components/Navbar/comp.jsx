/**
 * Navigation Bar Component
 *
 * Persistent header with branding, auth links, and "Add Sighting" button.
 * Displays email if authenticated, shows sign-in link if not.
 * Updated to use auth store for state management.
 */

import { Show, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { signout } from '../../services/auth';
import authStore from '../../stores/auth';
import './style.css';

/**
 * @component Navbar - Main navigation header
 * @returns {JSX.Element}
 */
export default function Navbar() {
	const navigate = useNavigate();
	const [isMenuOpen, setIsMenuOpen] = createSignal(false);

	const handleSignOut = async () => {
		try {
			await signout();
			authStore.clearUser();
			navigate('/');
		} catch (error) {
			console.error('Sign out failed:', error);
		}
	};

	const handleAddSighting = () => {
		if (authStore.isAuthenticated) {
			navigate('/create-sighting');
		} else {
			navigate('/auth?mode=signin');
		}
	};

	return (
		<nav class="navbar">
			<div class="navbar__container">
				{/* Logo/Brand */}
				<a href="/" class="navbar__brand">
					🦅 Wildlife Tracker
				</a>

				{/* Desktop Menu */}
				<div class="navbar__menu">
					{/* Add Sighting Button (Primary CTA) */}
					<button
						onclick={handleAddSighting}
						class="navbar__btn navbar__btn--primary"
					>
						+ Add Sighting
					</button>

					{/* Auth Section */}
					<Show
						when={authStore.isAuthenticatedSignal()}
						fallback={
							<>
								<a href="/auth?mode=signin" class="navbar__link">
									Sign In
								</a>
								<a href="/auth?mode=signup" class="navbar__btn navbar__btn--secondary">
									Sign Up
								</a>
							</>
						}
					>
						<span class="navbar__email">{authStore.currentUserSignal()?.email}</span>
						<button
							onclick={handleSignOut}
							class="navbar__link navbar__link--danger"
						>
							Sign Out
						</button>
					</Show>
				</div>

				{/* Mobile Menu Button */}
				<button
					class="navbar__toggle"
					onclick={() => setIsMenuOpen(!isMenuOpen())}
					aria-label="Toggle menu"
				>
					☰
				</button>
			</div>

			{/* Mobile Menu */}
			<Show when={isMenuOpen()}>
				<div class="navbar__mobile-menu">
					<button
						onclick={handleAddSighting}
						class="navbar__mobile-link"
					>
						+ Add Sighting
					</button>

					<Show
						when={authStore.isAuthenticatedSignal()}
						fallback={
							<>
								<a href="/auth?mode=signin" class="navbar__mobile-link">
									Sign In
								</a>
								<a href="/auth?mode=signup" class="navbar__mobile-link">
									Sign Up
								</a>
							</>
						}
					>
						<span class="navbar__mobile-email">{authStore.currentUserSignal()?.email}</span>
						<button
							onclick={handleSignOut}
							class="navbar__mobile-link navbar__mobile-link--danger"
						>
							Sign Out
						</button>
					</Show>
				</div>
			</Show>
		</nav>
	);
}