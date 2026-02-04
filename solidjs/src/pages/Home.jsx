/**
 * Home Page (Public)
 *
 * Public homepage showing hero section, features, and sign-up CTA.
 * Accessible to unauthenticated users.
 */

import { A } from '@solidjs/router';

export default function Home() {
	return (
		<div class="home">
			{/* Hero Section */}
			<section class="hero">
				<div class="hero__content">
					<h1>Track Wildlife Sightings</h1>
					<p>
						Document animal observations with photos, locations, and timestamps.
						Build your personal wildlife journal.
					</p>
					<div class="hero__actions">
						<A href="/signup" class="btn btn--primary">
							Get Started
						</A>
						<A href="/signin" class="btn btn--secondary">
							Sign In
						</A>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section class="section section--muted">
				<div class="container">
					<h2 class="section__title">Why Track Sightings?</h2>
					<div class="steps">
						<div class="step">
							<div class="step__num">1</div>
							<h3 class="step__title">Quick Setup</h3>
							<p class="step__text">
								Sign up in seconds with your email and start recording immediately.
							</p>
						</div>
						<div class="step">
							<div class="step__num">2</div>
							<h3 class="step__title">Add Details</h3>
							<p class="step__text">
								Record animal name, location, optional photos, and auto-timestamped observations.
							</p>
						</div>
						<div class="step">
							<div class="step__num">3</div>
							<h3 class="step__title">Manage Records</h3>
							<p class="step__text">
								View, edit, and delete your sightings from your personal dashboard.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section class="section">
				<div class="container text-center">
					<h2>Ready to start documenting wildlife?</h2>
					<p class="text-secondary mt-4 mb-6">
						Sign up now and create your first sighting in minutes.
					</p>
					<A href="/signup" class="btn btn--primary">
						Create Account
					</A>
				</div>
			</section>
		</div>
	);
}
