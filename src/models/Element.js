/**
 * Element Model
 * @module models/Element
 * @description Defines story element types and factory functions
 * 
 * Follows Open/Closed Principle:
 * - Open for extension via ELEMENT_TYPES configuration
 * - Closed for modification of core element creation logic
 */

import { generateId, createTimestamp } from '@utils/idGenerator';

/**
 * Element type configurations
 * @constant
 * @description Defines all trackable story element types with their metadata
 */
export const ELEMENT_TYPES = {
  character: {
    id: 'character',
    label: 'Character',
    plural: 'Characters',
    icon: 'User',
    color: '#8B7355',
    fields: ['name', 'role', 'description', 'traits', 'goals', 'backstory'],
    requiredFields: ['name'],
  },
  antagonist: {
    id: 'antagonist',
    label: 'Antagonist',
    plural: 'Antagonists',
    icon: 'Skull',
    color: '#9B4D4D',
    fields: ['name', 'role', 'description', 'motivation', 'methods', 'weakness'],
    requiredFields: ['name'],
  },
  location: {
    id: 'location',
    label: 'Location',
    plural: 'Locations',
    icon: 'MapPin',
    color: '#5B8E6B',
    fields: ['name', 'type', 'description', 'atmosphere', 'significance'],
    requiredFields: ['name'],
  },
  arc: {
    id: 'arc',
    label: 'Story Arc',
    plural: 'Story Arcs',
    icon: 'TrendingUp',
    color: '#6B7DB3',
    fields: ['name', 'type', 'description', 'startPoint', 'endPoint', 'stakes'],
    requiredFields: ['name'],
  },
  theme: {
    id: 'theme',
    label: 'Theme',
    plural: 'Themes',
    icon: 'Feather',
    color: '#9B8AC4',
    fields: ['name', 'description', 'manifestation', 'resolution'],
    requiredFields: ['name'],
  },
};

/**
 * Role options for characters
 * @constant
 */
export const CHARACTER_ROLES = [
  { id: 'protagonist', label: 'Protagonist' },
  { id: 'supporting', label: 'Supporting' },
  { id: 'minor', label: 'Minor' },
];

/**
 * Type options for locations
 * @constant
 */
export const LOCATION_TYPES = [
  { id: 'city', label: 'City' },
  { id: 'building', label: 'Building' },
  { id: 'natural', label: 'Natural' },
  { id: 'interior', label: 'Interior' },
  { id: 'fictional', label: 'Fictional' },
  { id: 'other', label: 'Other' },
];

/**
 * Type options for story arcs
 * @constant
 */
export const ARC_TYPES = [
  { id: 'main', label: 'Main Plot' },
  { id: 'character', label: 'Character Arc' },
  { id: 'subplot', label: 'Subplot' },
];

/**
 * Creates a new story element
 * @param {string} type - Element type from ELEMENT_TYPES
 * @param {Object} data - Initial element data
 * @returns {Element} New element object
 */
export function createElement(type, data = {}) {
  if (!ELEMENT_TYPES[type]) {
    throw new Error(`Invalid element type: ${type}`);
  }
  
  return {
    id: data.id || generateId(),
    type,
    createdAt: data.createdAt || createTimestamp(),
    updatedAt: createTimestamp(),
    ...data,
  };
}

/**
 * Validates an element object
 * @param {Object} element - Element to validate
 * @param {string} type - Expected element type
 * @returns {Object} Validation result with isValid and errors
 */
export function validateElement(element, type) {
  const errors = [];
  const config = ELEMENT_TYPES[type];
  
  if (!config) {
    return { isValid: false, errors: ['Invalid element type'] };
  }
  
  if (!element) {
    return { isValid: false, errors: ['Element is required'] };
  }
  
  // Check required fields
  config.requiredFields.forEach(field => {
    if (!element[field] || element[field].trim() === '') {
      errors.push(`${field} is required`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Gets element configuration by type
 * @param {string} type - Element type
 * @returns {Object|null} Element configuration or null
 */
export function getElementConfig(type) {
  return ELEMENT_TYPES[type] || null;
}

/**
 * Gets all element types as array
 * @returns {Array} Array of element type configurations
 */
export function getAllElementTypes() {
  return Object.values(ELEMENT_TYPES);
}

/**
 * Gets the storage key for an element type (plural form)
 * @param {string} type - Element type
 * @returns {string} Storage key
 */
export function getElementStorageKey(type) {
  return `${type}s`;
}

// Alias for backward compatibility
export const getElementKey = getElementStorageKey;

/**
 * Type definitions (for documentation)
 * 
 * @typedef {Object} Element
 * @property {string} id - Unique identifier
 * @property {string} type - Element type
 * @property {string} name - Element name
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 * 
 * @typedef {Object} ElementConfig
 * @property {string} id - Type identifier
 * @property {string} label - Display label
 * @property {string} plural - Plural label
 * @property {string} icon - Icon name
 * @property {string} color - Theme color
 * @property {string[]} fields - Available fields
 * @property {string[]} requiredFields - Required fields
 */
