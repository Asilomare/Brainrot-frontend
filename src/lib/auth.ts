// Auth related utility functions

// Local storage key for authentication token
const AUTH_TOKEN_KEY = 'brainrot_auth_token';

/**
 * Check if the user is authenticated
 * @returns boolean indicating if the user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return !!token;
}

/**
 * Authenticate with password
 * @param password - Password for authentication
 * @returns boolean indicating if authentication was successful
 */
export function authenticate(password: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const correctPassword = process.env.NEXT_PUBLIC_SITE_PASSWORD;
  
  if (password === correctPassword) {
    // Store simple token in local storage
    localStorage.setItem(AUTH_TOKEN_KEY, new Date().toISOString());
    return true;
  }
  
  return false;
}

/**
 * Log out the user
 */
export function logout(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.removeItem(AUTH_TOKEN_KEY);
} 