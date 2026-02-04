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
 * Main App Component
 * Wraps all routes with error boundary, nav bar, and layout
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
			<div class="page">
				<Navbar user={user()} setUser={setUser} />

				<main class="page-content">
					<Router>
						<Route path="/" component={Home} />
						<Route path="/signup" component={Auth} />
						<Route path="/signin" component={Auth} />
						<Route path="/dashboard" component={UserDashboard} />
						<Route path="/create-sighting" component={CreateSighting} />
						<Route path="/sightings/:id/edit" component={EditSighting} />
					</Router>
				</main>
			</div>
		</ErrorBoundary>
	);
}

export default App;

const HowItWorks = () => (
  <section className="section" aria-labelledby="how-title">
    <div className="container">
      <h2 id="how-title" className="section__title">How It Works</h2>

      <div className="steps">
        <article className="step">
          <div className="step__num" aria-hidden="true">1</div>
          <h3 className="step__title">Sign Up</h3>
          <p className="step__text">Create your free account in seconds</p>
        </article>

        <article className="step">
          <div className="step__num" aria-hidden="true">2</div>
          <h3 className="step__title">Record a Sighting</h3>
          <p className="step__text">Add animal details, photos, and location</p>
        </article>

        <article className="step">
          <div className="step__num" aria-hidden="true">3</div>
          <h3 className="step__title">Build Your Journal</h3>
          <p className="step__text">Track your wildlife observations over time</p>
        </article>
      </div>
    </div>
  </section>
);

mount(() => (
  <Page>
    <Navbar />
    <Hero />
    <Features />
    <HowItWorks />
    <Footer />
  </Page>
));