import { createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { signin } from '../../services/auth';
import './style.css';

/**
 * SignIn Component
 * 
 * Renders a sign-in form with email and password fields.
 * Handles authentication via the signin service.
 * 
 * @returns {import('solid-js').JSX.Element}
 */
export default function SignIn() {
  const navigate = useNavigate();
  
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate inputs
    if (!email() || !password()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      await signin(email(), password());
      // On success, navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Sign-in error:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="signin-container">
      <div class="signin-card">
        <h2>Sign In</h2>
        <p class="signin-subtitle">Welcome back! Sign in to continue.</p>
        
        <form onSubmit={handleSubmit} class="signin-form">
          {error() && (
            <div class="error-message" role="alert">
              {error()}
            </div>
          )}
          
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              value={email()}
              onInput={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isLoading()}
              autocomplete="email"
            />
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              value={password()}
              onInput={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading()}
              autocomplete="current-password"
            />
          </div>
          
          <button 
            type="submit" 
            class="submit-button"
            disabled={isLoading()}
          >
            {isLoading() ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p class="signin-footer">
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
      </div>
    </div>
  );
}
