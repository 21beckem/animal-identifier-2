import { createSignal, createEffect } from 'solid-js';

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} email - User email address
 * @property {number} created_at - Account creation timestamp
 * @property {number} [last_login_at] - Last login timestamp
 */

// Global auth state signals
const [currentUser, setCurrentUser] = createSignal(/** @type {User | null} */ (null));
const [isAuthenticated, setIsAuthenticated] = createSignal(false);
const [isLoading, setIsLoading] = createSignal(false);

/**
 * Set the current authenticated user
 * @param {User | null} user - User object or null to clear
 */
export function setUser(user) {
  setCurrentUser(user);
  setIsAuthenticated(!!user);
}

/**
 * Clear the current user (logout)
 */
export function clearUser() {
  setCurrentUser(null);
  setIsAuthenticated(false);
}

/**
 * Set loading state for async auth operations
 * @param {boolean} loading - Loading state
 */
export function setAuthLoading(loading) {
  setIsLoading(loading);
}

/**
 * Check if user session is valid by calling the /api/auth/me endpoint
 * This should be called on app initialization
 * @returns {Promise<User | null>}
 */
export async function checkSession() {
  setIsLoading(true);
  
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include', // Include cookies
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      const user = data.user || data;
      setUser(user);
      return user;
    } else {
      // Not authenticated or session expired
      clearUser();
      return null;
    }
  } catch (error) {
    console.error('Session check failed:', error);
    clearUser();
    return null;
  } finally {
    setIsLoading(false);
  }
}

/**
 * Auth store exports
 */
export const authStore = {
  // Getters (signals)
  get currentUser() {
    return currentUser();
  },
  get isAuthenticated() {
    return isAuthenticated();
  },
  get isLoading() {
    return isLoading();
  },
  
  // Signals (for reactive access)
  currentUserSignal: currentUser,
  isAuthenticatedSignal: isAuthenticated,
  isLoadingSignal: isLoading,
  
  // Actions
  setUser,
  clearUser,
  setAuthLoading,
  checkSession,
};

export default authStore;
