/**
 * Navigation Bar Component
 *
 * Persistent header with branding, auth links, and "Add Sighting" button.
 * Displays email if authenticated, shows sign-in link if not.
 */

import { Show, createSignal } from 'solid-js';
import * as authService from '../../services/auth';
import * as storageService from '../../services/storage';
import './style.css';

/**
 * @component Navbar - Main navigation header
 * @param {Object} props
 * @param {User|null} props.user - Current authenticated user
 * @param {Function} props.setUser - Update user state
 * @returns {JSX.Element}
 */
export default function Navbar(props) {
	const [isMenuOpen, setIsMenuOpen] = createSignal(false);

	const handleSignOut = async () => {
		try {
			await authService.signout();
			storageService.clearSession();
			props.setUser(null);
			window.location.href = '/';
		} catch (error) {
			console.error('Sign out failed:', error);
		}
	};

	const handleAddSighting = () => {
		if (props.user) {
			window.location.href = '/create-sighting';
		} else {
			window.location.href = '/signin';
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
						when={props.user}
						fallback={
							<>
								<a href="/signin" class="navbar__link">
									Sign In
								</a>
								<a href="/signup" class="navbar__btn navbar__btn--secondary">
									Sign Up
								</a>
							</>
						}
					>
						<span class="navbar__email">{props.user.email}</span>
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
						when={props.user}
						fallback={
							<>
								<a href="/signin" class="navbar__mobile-link">
									Sign In
								</a>
								<a href="/signup" class="navbar__mobile-link">
									Sign Up
								</a>
							</>
						}
					>
						<span class="navbar__mobile-email">{props.user.email}</span>
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