/**
 * ID Generator Utility
 * @module utils/idGenerator
 * @description Provides unique ID and timestamp generation
 * 
 * Follows Single Responsibility Principle:
 * - Only handles ID and timestamp generation
 */

/**
 * Generates a unique identifier
 * @returns {string} Unique ID with timestamp and random suffix
 */
export function generateId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `${timestamp}_${random}`;
}

/**
 * Generates a prefixed unique identifier
 * @param {string} prefix - ID prefix
 * @returns {string} Prefixed unique ID
 */
export function generatePrefixedId(prefix) {
  return `${prefix}_${generateId()}`;
}

/**
 * Creates an ISO timestamp string
 * @returns {string} ISO timestamp
 */
export function createTimestamp() {
  return new Date().toISOString();
}

/**
 * Formats a timestamp for display
 * @param {string} timestamp - ISO timestamp
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatTimestamp(timestamp, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return new Date(timestamp).toLocaleString(undefined, { ...defaultOptions, ...options });
}

/**
 * Gets relative time string (e.g., "2 hours ago")
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Relative time string
 */
export function getRelativeTime(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatTimestamp(timestamp, { year: 'numeric', month: 'short', day: 'numeric' });
}
