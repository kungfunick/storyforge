/**
 * Relationship Controller
 * ============================================================================
 * 
 * @description Business logic for managing element relationships
 * @module controllers/RelationshipController
 * 
 * Responsibilities:
 * - CRUD operations for relationships
 * - Relationship validation
 * - Relationship queries
 */

import { createRelationship, validateRelationship, relationshipExists, getRelationshipType, RELATIONSHIP_TYPES } from '@models/Relationship';
import { deepClone } from '@utils/helpers';
import { generateId } from '@utils/idGenerator';

/**
 * Get all relationships
 * @param {Object} story - Story object
 * @returns {Array} All relationships
 */
export function getAll(story) {
  if (!story?.relationships) return [];
  return deepClone(story.relationships);
}

/**
 * Get relationship by ID
 * @param {Object} story - Story object
 * @param {string} id - Relationship ID
 * @returns {Object|null} Relationship or null
 */
export function getById(story, id) {
  if (!story?.relationships || !id) return null;
  const rel = story.relationships.find(r => r.id === id);
  return rel ? deepClone(rel) : null;
}

/**
 * Get relationships for an element
 * @param {Object} story - Story object
 * @param {string} elementId - Element ID
 * @returns {Array} Relationships involving the element
 */
export function getForElement(story, elementId) {
  if (!story?.relationships || !elementId) return [];
  
  return story.relationships
    .filter(r => r.sourceId === elementId || r.targetId === elementId)
    .map(r => deepClone(r));
}

/**
 * Get relationships between two elements
 * @param {Object} story - Story object
 * @param {string} elementA - First element ID
 * @param {string} elementB - Second element ID
 * @returns {Array} Relationships between the elements
 */
export function getBetween(story, elementA, elementB) {
  if (!story?.relationships || !elementA || !elementB) return [];
  
  return story.relationships.filter(r => 
    (r.sourceId === elementA && r.targetId === elementB) ||
    (r.sourceId === elementB && r.targetId === elementA)
  ).map(r => deepClone(r));
}

/**
 * Check if relationship can be created
 * @param {Object} story - Story object
 * @param {string} sourceId - Source element ID
 * @param {string} targetId - Target element ID
 * @param {string} type - Relationship type
 * @returns {Object} { canCreate, reason }
 */
export function canCreate(story, sourceId, targetId, type) {
  // Check for self-reference
  if (sourceId === targetId) {
    return { canCreate: false, reason: 'Cannot create relationship with self' };
  }
  
  // Check if relationship already exists
  if (story?.relationships && relationshipExists(story.relationships, sourceId, targetId)) {
    return { canCreate: false, reason: 'Relationship already exists' };
  }
  
  // Check valid type
  if (!getRelationshipType(type)) {
    return { canCreate: false, reason: 'Invalid relationship type' };
  }
  
  return { canCreate: true, reason: null };
}

/**
 * Create new relationship
 * @param {Object} story - Story object
 * @param {Object} data - Relationship data
 * @returns {Object} { story, relationship, errors }
 */
export function create(story, data) {
  const { sourceId, targetId, type, description = '' } = data;
  
  // Check if can create
  const { canCreate: allowed, reason } = canCreate(story, sourceId, targetId, type);
  if (!allowed) {
    return { 
      story, 
      relationship: null, 
      errors: { general: reason } 
    };
  }
  
  // Create relationship using model factory
  const relationship = createRelationship(sourceId, targetId, type, description);
  
  // Validate
  const errors = validateRelationship(relationship);
  if (Object.keys(errors).length > 0) {
    return { story, relationship: null, errors };
  }
  
  // Clone story and add relationship
  const updatedStory = deepClone(story);
  if (!updatedStory.relationships) {
    updatedStory.relationships = [];
  }
  updatedStory.relationships.push(relationship);
  updatedStory.updatedAt = new Date().toISOString();
  
  return { story: updatedStory, relationship, errors: {} };
}

/**
 * Update existing relationship
 * @param {Object} story - Story object
 * @param {string} id - Relationship ID
 * @param {Object} updates - Updates to apply
 * @returns {Object} { story, relationship, errors }
 */
export function update(story, id, updates) {
  // Find relationship
  const existing = getById(story, id);
  if (!existing) {
    return { 
      story, 
      relationship: null, 
      errors: { id: 'Relationship not found' } 
    };
  }
  
  // Merge updates (but preserve source/target IDs)
  const updatedRelationship = {
    ...existing,
    ...updates,
    id, // Preserve ID
    sourceId: existing.sourceId, // Preserve source
    targetId: existing.targetId, // Preserve target
    updatedAt: new Date().toISOString(),
  };
  
  // Validate
  const errors = validateRelationship(updatedRelationship);
  if (Object.keys(errors).length > 0) {
    return { story, relationship: null, errors };
  }
  
  // Clone story and update
  const updatedStory = deepClone(story);
  const index = updatedStory.relationships.findIndex(r => r.id === id);
  
  if (index !== -1) {
    updatedStory.relationships[index] = updatedRelationship;
    updatedStory.updatedAt = new Date().toISOString();
  }
  
  return { story: updatedStory, relationship: updatedRelationship, errors: {} };
}

/**
 * Delete relationship
 * @param {Object} story - Story object
 * @param {string} id - Relationship ID
 * @returns {Object} { story, deleted, errors }
 */
export function remove(story, id) {
  if (!story?.relationships) {
    return { 
      story, 
      deleted: false, 
      errors: { id: 'No relationships exist' } 
    };
  }
  
  const index = story.relationships.findIndex(r => r.id === id);
  if (index === -1) {
    return { 
      story, 
      deleted: false, 
      errors: { id: 'Relationship not found' } 
    };
  }
  
  // Clone story and remove
  const updatedStory = deepClone(story);
  updatedStory.relationships.splice(index, 1);
  updatedStory.updatedAt = new Date().toISOString();
  
  return { story: updatedStory, deleted: true, errors: {} };
}

/**
 * Delete all relationships for an element
 * @param {Object} story - Story object
 * @param {string} elementId - Element ID
 * @returns {Object} { story, count }
 */
export function removeForElement(story, elementId) {
  if (!story?.relationships) {
    return { story, count: 0 };
  }
  
  const updatedStory = deepClone(story);
  const originalCount = updatedStory.relationships.length;
  
  updatedStory.relationships = updatedStory.relationships.filter(
    r => r.sourceId !== elementId && r.targetId !== elementId
  );
  
  const removedCount = originalCount - updatedStory.relationships.length;
  
  if (removedCount > 0) {
    updatedStory.updatedAt = new Date().toISOString();
  }
  
  return { story: updatedStory, count: removedCount };
}

/**
 * Get relationship statistics
 * @param {Object} story - Story object
 * @returns {Object} Stats
 */
export function getStats(story) {
  if (!story?.relationships) {
    return {
      total: 0,
      byType: {},
    };
  }
  
  const byType = {};
  for (const rel of story.relationships) {
    byType[rel.type] = (byType[rel.type] || 0) + 1;
  }
  
  return {
    total: story.relationships.length,
    byType,
  };
}

/**
 * Get relationship network data for visualization
 * @param {Object} story - Story object
 * @param {Array} elements - Elements to include
 * @returns {Object} { nodes, edges }
 */
export function getNetworkData(story, elements) {
  const nodes = elements.map(el => ({
    id: el.id,
    label: el.name,
    type: el.type,
  }));
  
  const elementIds = new Set(elements.map(el => el.id));
  
  const edges = (story?.relationships || [])
    .filter(r => elementIds.has(r.sourceId) && elementIds.has(r.targetId))
    .map(r => {
      const typeConfig = getRelationshipType(r.type);
      return {
        id: r.id,
        source: r.sourceId,
        target: r.targetId,
        type: r.type,
        label: r.description || typeConfig?.label,
        color: typeConfig?.color,
        bidirectional: typeConfig?.bidirectional,
      };
    });
  
  return { nodes, edges };
}

/**
 * Swap relationship direction
 * @param {Object} story - Story object
 * @param {string} id - Relationship ID
 * @returns {Object} { story, relationship, errors }
 */
export function swapDirection(story, id) {
  const existing = getById(story, id);
  if (!existing) {
    return { 
      story, 
      relationship: null, 
      errors: { id: 'Relationship not found' } 
    };
  }
  
  return update(story, id, {
    sourceId: existing.targetId,
    targetId: existing.sourceId,
  });
}

export default {
  getAll,
  getById,
  getForElement,
  getBetween,
  canCreate,
  create,
  update,
  remove,
  removeForElement,
  getStats,
  getNetworkData,
  swapDirection,
};
