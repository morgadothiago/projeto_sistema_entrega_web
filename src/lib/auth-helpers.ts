/**
 * Authentication helper functions
 */

/**
 * Formats a token with Bearer prefix if not already present
 * @param token - The authentication token
 * @returns Formatted token with "Bearer " prefix
 */
export function formatAuthToken(token: string): string {
  if (!token) {
    throw new Error('Token is required')
  }

  return token.startsWith('Bearer ') ? token : `Bearer ${token}`
}

/**
 * Extracts the token from a Bearer token string
 * @param authToken - The Bearer token string
 * @returns The token without the "Bearer " prefix
 */
export function extractToken(authToken: string): string {
  return authToken.replace(/^Bearer\s+/i, '')
}

/**
 * Validates if a token has the correct format
 * @param token - The token to validate
 * @returns True if the token is valid
 */
export function isValidToken(token: string): boolean {
  return typeof token === 'string' && token.length > 0
}
