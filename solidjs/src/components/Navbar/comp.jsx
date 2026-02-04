/**
 * Navigation Bar Component
 *
 * Persistent header with branding, auth links, and "Add Sighting" button.
 * Displays email if authenticated, shows sign-in link if not.
 */

import { A, useNavigate } from '@solidjs/router';
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
	const navigate = useNavigate();
	const [isMenuOpen, setIsMenuOpen] = createSignal(false);

	const handleSignOut = async () => {
		try {
			await authService.signout();
			storageService.clearSession();
			props.setUser(null);
			navigate('/');
		} catch (error) {
			console.error('Sign out failed:', error);
		}
	};

	const handleAddSighting = () => {
		if (props.user) {
			navigate('/create-sighting');
		} else {
			navigate('/signin');
		}
	};

	return (
		<nav class="navbar">
			<div class="navbar__container">
				{/* Logo/Brand */}
				<A href="/" class="navbar__brand">
					🦅 Wildlife Tracker
				</A>

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
								<A href="/signin" class="navbar__link">
									Sign In
								</A>
								<A href="/signup" class="navbar__btn navbar__btn--secondary">
									Sign Up
								</A>
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
								<A href="/signin" class="navbar__mobile-link">
									Sign In
								</A>
								<A href="/signup" class="navbar__mobile-link">
									Sign Up
								</A>
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