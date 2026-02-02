/**
 * Utils Index
 * @module utils
 * @description Exports all utility functions
 */

// ID and timestamp utilities
export {
  generateId,
  generatePrefixedId,
  createTimestamp,
  formatTimestamp,
  getRelativeTime,
} from './idGenerator';

// Helper functions
export {
  truncate,
  capitalize,
  safeJsonParse,
  deepClone,
  debounce,
  throttle,
  slugify,
  isEmpty,
  downloadFile,
  getInitials,
  wordCount,
  readingTime,
  groupBy,
  sortBy,
  formatRelativeTime,
} from './helpers';

// Constants
export {
  STORAGE_KEYS,
  API_ENDPOINTS,
  GENERATION_MODES,
  ELEMENT_TYPES,
  RELATIONSHIP_TYPES,
  GENRES,
  TONES,
  EXPORT_FORMATS,
  NAV_ITEMS,
  IMPACT_LEVELS,
  CHARACTER_ROLES,
  LOCATION_TYPES,
  ARC_TYPES,
  VERSION_CONFIG,
  BREAKPOINTS,
} from './constants';

export { default as logger } from './logger';
export { default as helpers } from './helpers';
export { default as constants } from './constants';
