/**
 * Sign Up Component
 *
 * Form component for user registration.
 * - Email and password inputs with real-time validation
 * - Password strength indicator
 * - Submit button with loading state
 * - Error message display (general + field-specific)
 * - Link to sign-in page
 */

import { createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import * as authService from '../../services/auth';
import LoadingSpinner from '../LoadingSpinner/comp';
import './style.css';

export default function SignUp() {
	const navigate = useNavigate();

	const [formData, setFormData] = createSignal({
		email: '',
		password: '',
		confirmPassword: '',
	});

	const [errors, setErrors] = createSignal({});
	const [generalError, setGeneralError] = createSignal('');
	const [successMessage, setSuccessMessage] = createSignal('');
	const [isLoading, setIsLoading] = createSignal(false);

	const validateEmail = (email) => {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(email);
	};

	const validatePassword = (password) => {
		return password.length >= 8 && /[A-Z]/.test(password);
	};

	const getPasswordStrength = () => {
		const password = formData().password;
		if (!password) return '';
		if (password.length >= 12) return 'Strong';
		if (password.length >= 8) return 'Good';
		return 'Weak';
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
		setErrors(prev => ({ ...prev, [name]: '' }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const newErrors = {};

		// Validate email
		if (!formData().email) {
			newErrors.email = 'Email is required';
		} else if (!validateEmail(formData().email)) {
			newErrors.email = 'Please enter a valid email address';
		}

		// Validate password
		if (!formData().password) {
			newErrors.password = 'Password is required';
		} else if (!validatePassword(formData().password)) {
			newErrors.password = 'Password must be at least 8 characters with 1 uppercase letter';
		}

		// Validate confirm password
		if (!formData().confirmPassword) {
			newErrors.confirmPassword = 'Please confirm your password';
		} else if (formData().password !== formData().confirmPassword) {
			newErrors.confirmPassword = 'Passwords do not match';
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		setGeneralError('');
		setIsLoading(true);

		try {
			const user = await authService.signup(formData().email, formData().password);
			setSuccessMessage('Account created successfully! Redirecting to sign in...');
			
			// Redirect to signin after brief delay
			setTimeout(() => {
				navigate('/signin', { state: { email: formData().email } });
			}, 2000);
		} catch (error) {
			console.error('Signup error:', error);
			
			if (error.status === 409) {
				setErrors(prev => ({
					...prev,
					email: 'This email is already registered'
				}));
			} else if (error.details) {
				setErrors(error.details);
			} else {
				setGeneralError(error.message || 'Failed to create account. Please try again.');
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div class="signup-form-container">
			<div class="signup-form">
				<h1>Create Account</h1>
				<p class="subtitle">Join the wildlife tracking community</p>

				<Show when={successMessage()}>
					<div class="success-message">{successMessage()}</div>
				</Show>

				<Show when={generalError()}>
					<div class="error-message">{generalError()}</div>
				</Show>

				<form onsubmit={handleSubmit} class="form">
					{/* Email Input */}
					<div class="form-group">
						<label for="email">Email Address</label>
						<input
							type="email"
							id="email"
							name="email"
							value={formData().email}
							onchange={handleChange}
							onblur={handleChange}
							placeholder="you@example.com"
							required
							disabled={isLoading()}
						/>
						<Show when={errors().email}>
							<span class="field-error">{errors().email}</span>
						</Show>
					</div>

					{/* Password Input */}
					<div class="form-group">
						<label for="password">Password</label>
						<input
							type="password"
							id="password"
							name="password"
							value={formData().password}
							onchange={handleChange}
							placeholder="Min 8 chars, 1 uppercase"
							required
							disabled={isLoading()}
						/>
						<Show when={formData().password}>
							<div class="password-strength" data-strength={getPasswordStrength()}>
								Password strength: <strong>{getPasswordStrength()}</strong>
							</div>
						</Show>
						<Show when={errors().password}>
							<span class="field-error">{errors().password}</span>
						</Show>
					</div>

					{/* Confirm Password Input */}
					<div class="form-group">
						<label for="confirmPassword">Confirm Password</label>
						<input
							type="password"
							id="confirmPassword"
							name="confirmPassword"
							value={formData().confirmPassword}
							onchange={handleChange}
							placeholder="Re-enter password"
							required
							disabled={isLoading()}
						/>
						<Show when={errors().confirmPassword}>
							<span class="field-error">{errors().confirmPassword}</span>
						</Show>
					</div>

					{/* Submit Button */}
					<button
						type="submit"
						class="btn btn-primary"
						disabled={isLoading()}
					>
						<Show when={isLoading()} fallback="Create Account">
							<LoadingSpinner size="sm" />
							Creating account...
						</Show>
					</button>
				</form>

				{/* Sign In Link */}
				<p class="signin-link">
					Already have an account? <a href="/signin">Sign in here</a>
				</p>
			</div>
		</div>
	);
}
