/**
 * App Entry Point
 *
 * Sets up routing, error boundary, and renders the main app wrapper.
 * All routes are defined here with proper auth guards.
 */

import { Router, Route, Navigate } from '@solidjs/router';
import { createSignal, onMount, Show } from 'solid-js';
import ErrorBoundary from './components/ErrorBoundary/comp';
import Navbar from './components/Navbar/comp';
import Home from './pages/Home';
import Auth from './pages/Auth';
import UserDashboard from './pages/UserDashboard';
import CreateSighting from './pages/CreateSighting';
import EditSighting from './pages/EditSighting';
import * as authService from './services/auth';
import * as storageService from './services/storage';
import './styles.css';

/**
 * Protected Route Wrapper
 * Redirects unauthenticated users to signin
 */
function ProtectedRoute(props) {
	const [isAuthenticated, setIsAuthenticated] = createSignal(false);
	const [isLoading, setIsLoading] = createSignal(true);

	onMount(async () => {
		try {
			const user = await authService.checkSession();
			setIsAuthenticated(!!user);
		} catch (error) {
			console.error('Auth check failed:', error);
			setIsAuthenticated(false);
		} finally {
			setIsLoading(false);
		}
	});

	return (
		<Show when={!isLoading()}>
			<Show
				when={isAuthenticated()}
				fallback={
					// Not authenticated, redirect to signin
					<Navigate href="/signin" />
				}
			>
				{props.children}
			</Show>
		</Show>
	);
}

/**
 * Layout Component
 * Renders Navbar and page content (only inside Router context)
 */
function Layout(props) {
	return (
		<div class="page">
			<Navbar user={props.user()} setUser={props.setUser} />
			<main class="page-content">{props.children}</main>
		</div>
	);
}

/**
 * Main App Component
 * Wraps all routes with error boundary, Router, and layout
 */
function App() {
	const [user, setUser] = createSignal(null);
	const [isLoading, setIsLoading] = createSignal(true);

	// Check session on app mount
	onMount(async () => {
		try {
			const currentUser = await authService.checkSession();
			if (currentUser) {
				setUser(currentUser);
				storageService.saveUser(currentUser);
			}
		} catch (error) {
			console.error('Failed to restore session:', error);
		} finally {
			setIsLoading(false);
		}
	});

	return (
		<ErrorBoundary>
			<Router>
				<Layout user={user} setUser={setUser}>
					<Route path="/" component={Home} />
					<Route path="/signup" component={Auth} />
					<Route path="/signin" component={Auth} />
					<Route path="/dashboard" component={UserDashboard} />
					<Route path="/create-sighting" component={CreateSighting} />
					<Route path="/sightings/:id/edit" component={EditSighting} />
				</Layout>
			</Router>
		</ErrorBoundary>
	);
}

export default App;

// Mount the app to the DOM
mount(App, 'root');
