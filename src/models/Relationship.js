/**
 * Relationship Model
 * @module models/Relationship
 * @description Defines relationship types and factory functions
 * 
 * Follows Single Responsibility Principle:
 * - Only handles relationship data structure
 */

import { generateId, createTimestamp } from '@utils/idGenerator';

/**
 * Relationship type configurations
 * @constant
 */
export const RELATIONSHIP_TYPES = [
  { id: 'ally', label: 'Ally', color: '#5B8E6B', bidirectional: true },
  { id: 'enemy', label: 'Enemy', color: '#9B4D4D', bidirectional: true },
  { id: 'family', label: 'Family', color: '#8B7355', bidirectional: true },
  { id: 'romantic', label: 'Romantic', color: '#C45B8E', bidirectional: true },
  { id: 'mentor', label: 'Mentor/Student', color: '#6B7DB3', bidirectional: false },
  { id: 'rival', label: 'Rival', color: '#C4A85B', bidirectional: true },
  { id: 'located_in', label: 'Located In', color: '#5B8E6B', bidirectional: false },
  { id: 'drives', label: 'Drives', color: '#9B8AC4', bidirectional: false },
  { id: 'opposes', label: 'Opposes', color: '#9B4D4D', bidirectional: false },
  { id: 'embodies', label: 'Embodies', color: '#9B8AC4', bidirectional: false },
];

/**
 * Creates a new relationship between elements
 * @param {string} sourceId - Source element ID
 * @param {string} targetId - Target element ID
 * @param {string} type - Relationship type ID
 * @param {string} description - Optional description
 * @returns {Relationship} New relationship object
 */
export function createRelationship(sourceId, targetId, type, description = '') {
  if (!sourceId || !targetId) {
    throw new Error('Source and target IDs are required');
  }
  
  if (!getRelationshipType(type)) {
    throw new Error(`Invalid relationship type: ${type}`);
  }
  
  return {
    id: generateId(),
    sourceId,
    targetId,
    type,
    description,
    createdAt: createTimestamp(),
  };
}

/**
 * Gets relationship type configuration by ID
 * @param {string} typeId - Relationship type ID
 * @returns {Object|null} Relationship type config or null
 */
export function getRelationshipType(typeId) {
  return RELATIONSHIP_TYPES.find(rt => rt.id === typeId) || null;
}

/**
 * Gets all relationship types
 * @returns {Array} Array of relationship type configurations
 */
export function getAllRelationshipTypes() {
  return RELATIONSHIP_TYPES;
}

/**
 * Checks if a relationship already exists between two elements
 * @param {Array} relationships - Existing relationships
 * @param {string} sourceId - Source element ID
 * @param {string} targetId - Target element ID
 * @returns {boolean} Whether relationship exists
 */
export function relationshipExists(relationships, sourceId, targetId) {
  return relationships.some(r =>
    (r.sourceId === sourceId && r.targetId === targetId) ||
    (r.sourceId === targetId && r.targetId === sourceId)
  );
}

/**
 * Gets all relationships for a specific element
 * @param {Array} relationships - All relationships
 * @param {string} elementId - Element ID
 * @returns {Array} Relationships involving the element
 */
export function getRelationshipsForElement(relationships, elementId) {
  return relationships.filter(r =>
    r.sourceId === elementId || r.targetId === elementId
  );
}

/**
 * Removes relationships for a deleted element
 * @param {Array} relationships - All relationships
 * @param {string} elementId - Deleted element ID
 * @returns {Array} Filtered relationships
 */
export function removeRelationshipsForElement(relationships, elementId) {
  return relationships.filter(r =>
    r.sourceId !== elementId && r.targetId !== elementId
  );
}

/**
 * Validates a relationship object
 * @param {Object} relationship - Relationship to validate
 * @returns {Object} Validation errors (empty if valid)
 */
export function validateRelationship(relationship) {
  const errors = {};
  
  if (!relationship.sourceId) {
    errors.sourceId = 'Source element is required';
  }
  
  if (!relationship.targetId) {
    errors.targetId = 'Target element is required';
  }
  
  if (!relationship.type) {
    errors.type = 'Relationship type is required';
  } else if (!getRelationshipType(relationship.type)) {
    errors.type = 'Invalid relationship type';
  }
  
  if (relationship.sourceId === relationship.targetId) {
    errors.general = 'Cannot create relationship with self';
  }
  
  return errors;
}

/**
 * Type definitions (for documentation)
 * 
 * @typedef {Object} Relationship
 * @property {string} id - Unique identifier
 * @property {string} sourceId - Source element ID
 * @property {string} targetId - Target element ID
 * @property {string} type - Relationship type ID
 * @property {string} description - Optional description
 * @property {string} createdAt - Creation timestamp
 * 
 * @typedef {Object} RelationshipType
 * @property {string} id - Type identifier
 * @property {string} label - Display label
 * @property {string} color - Theme color
 * @property {boolean} bidirectional - Whether relationship is bidirectional
 */
