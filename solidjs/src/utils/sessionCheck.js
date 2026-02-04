import { checkSession as checkAuthSession } from '../stores/auth';

/**
 * Session Check Utility
 * 
 * Wrapper function that calls the auth store's checkSession method
 * to verify if the user has an active session.
 * 
 * This should be called on app mount to restore authentication state.
 * 
 * @returns {Promise<import('../stores/auth').User | null>} User object if authenticated, null otherwise
 */
export async function checkSession() {
  try {
    const user = await checkAuthSession();
    return user;
  } catch (error) {
    console.error('Error checking session:', error);
    return null;
  }
}

/**
 * Initialize authentication state
 * 
 * This should be called once when the app starts.
 * It checks if there's an active session and restores user state if found.
 * 
 * @returns {Promise<boolean>} True if user is authenticated, false otherwise
 */
export async function initializeAuth() {
  const user = await checkSession();
  return !!user;
}

export default checkSession;
