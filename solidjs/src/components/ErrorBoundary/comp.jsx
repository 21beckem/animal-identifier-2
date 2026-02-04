/**
 * Error Boundary Component
 *
 * Catches uncaught errors in the app and displays a user-friendly error page.
 * Prevents blank page on JavaScript errors.
 */

import { createSignal, Show } from 'solid-js';

/**
 * @component ErrorBoundary - Wraps the entire app to handle uncaught errors
 * @param {Object} props
 * @param {any} props.children - Child components to render
 * @returns {JSX.Element}
 */
export default function ErrorBoundary(props) {
	const [error, setError] = createSignal(null);
	const [hasError, setHasError] = createSignal(false);

	// Catch unhandled errors
	window.addEventListener('error', (event) => {
		console.error('Uncaught error:', event.error);
		setError(event.error);
		setHasError(true);
	});

	// Catch unhandled promise rejections
	window.addEventListener('unhandledrejection', (event) => {
		console.error('Unhandled rejection:', event.reason);
		setError(event.reason);
		setHasError(true);
	});

	const resetError = () => {
		setHasError(false);
		setError(null);
	};

	return (
		<Show when={!hasError()} fallback={
			<div class="error-boundary">
				<div class="error-boundary__content">
					<h1>Something went wrong</h1>
					<p>An unexpected error occurred. Please try refreshing the page.</p>
					<Show when={error()}>
						<details class="error-boundary__details">
							<summary>Error details</summary>
							<pre>{String(error())}</pre>
						</details>
					</Show>
					<button onclick={resetError} class="error-boundary__button">
						Try again
					</button>
				</div>
			</div>
		}>
			{props.children}
		</Show>
	);
}
