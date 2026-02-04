/**
 * App Entry Point
 *
 * Sets up routing, error boundary, and renders the main app wrapper.
 * All routes are defined here with proper auth guards.
 */

import mount from './mount';
import { Router, Route } from '@solidjs/router';
import { onMount, Show } from 'solid-js';
import ErrorBoundary from './components/ErrorBoundary/comp';
import Navbar from './components/Navbar/comp';
import Home from './pages/Home';
import Auth from './pages/Auth';
import UserDashboard from './pages/UserDashboard';
import CreateSighting from './pages/CreateSighting';
import EditSighting from './pages/EditSighting';
import authStore from './stores/auth';
import './styles.css';

/**
 * Protected Route Wrapper
 * Redirects unauthenticated users to signin
 */
function ProtectedRoute(props) {
	return (
		<Show
			when={authStore.isAuthenticatedSignal()}
			fallback={
				<Auth />
			}
		>
			{props.children}
		</Show>
	);
}

/**
 * Main App Component
 * Wraps all routes with error boundary, Router, and layout
 */
function App() {
	// Check session on app mount
	onMount(async () => {
		await authStore.checkSession();
	});

	return (
		<ErrorBoundary>
			<Navbar />
			<main class="page-content">
				<Router>
					<Route path="/" component={Home} />
					<Route path="/auth" component={Auth} />
					<Route path="/signup" component={Auth} />
					<Route path="/signin" component={Auth} />
					<Route path="/dashboard" component={() => (
						<ProtectedRoute>
							<UserDashboard />
						</ProtectedRoute>
					)} />
					<Route path="/create-sighting" component={() => (
						<ProtectedRoute>
							<CreateSighting />
						</ProtectedRoute>
					)} />
					<Route path="/sightings/:id/edit" component={() => (
						<ProtectedRoute>
							<EditSighting />
						</ProtectedRoute>
					)} />
				</Router>
			</main>
		</ErrorBoundary>
	);
}

export default App;

// Mount the app to the DOM
mount(App, 'root');
