import { useSearchParams } from '@solidjs/router';
import SignUp from '../components/SignUp/comp';
import SignIn from '../components/SignIn/comp';

/**
 * Auth Page
 * 
 * Wrapper page for SignUp and SignIn components.
 * Uses query param ?mode=signin or ?mode=signup to determine which form to show.
 * Defaults to signup if no mode specified.
 * 
 * Routes:
 * - /auth?mode=signup -> SignUp form
 * - /auth?mode=signin -> SignIn form
 * 
 * @returns {import('solid-js').JSX.Element}
 */
export default function Auth() {
  const [searchParams] = useSearchParams();
  
  // Determine which form to show based on query param
  const isSignIn = () => searchParams.mode === 'signin';
  
  // TODO: Add redirect if already authenticated (after auth store is implemented)
  
  return (
    <div class="auth-page">
      {isSignIn() ? <SignIn /> : <SignUp />}
    </div>
  );
}
