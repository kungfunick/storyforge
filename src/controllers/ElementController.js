/**
 * Element Controller
 * ============================================================================
 * 
 * @description Business logic for managing story elements
 * @module controllers/ElementController
 * 
 * Responsibilities:
 * - CRUD operations for elements
 * - Element validation
 * - Element search and filtering
 */

import { createElement, validateElement, ELEMENT_TYPES } from '@models/Element';
import { deepClone, generateId } from '@utils/helpers';

/**
 * Get all elements from story
 * @param {Object} story - Story object
 * @returns {Object} Elements by type
 */
export function getAll(story) {
  if (!story?.elements) return {};
  return deepClone(story.elements);
}

/**
 * Get all elements as flat array
 * @param {Object} story - Story object
 * @returns {Array} All elements
 */
export function getAllFlat(story) {
  if (!story?.elements) return [];
  
  const allElements = [];
  Object.entries(story.elements).forEach(([type, elements]) => {
    elements.forEach(element => {
      allElements.push({ ...element, type });
    });
  });
  
  return allElements;
}

/**
 * Get elements by type
 * @param {Object} story - Story object
 * @param {string} type - Element type
 * @returns {Array} Elements of specified type
 */
export function getByType(story, type) {
  if (!story?.elements?.[type]) return [];
  return deepClone(story.elements[type]);
}

/**
 * Get element by ID
 * @param {Object} story - Story object
 * @param {string} id - Element ID
 * @returns {Object|null} Element or null
 */
export function getById(story, id) {
  if (!story?.elements || !id) return null;
  
  for (const [type, elements] of Object.entries(story.elements)) {
    const found = elements.find(el => el.id === id);
    if (found) return { ...found, type };
  }
  
  return null;
}

/**
 * Create new element
 * @param {Object} story - Story object
 * @param {string} type - Element type
 * @param {Object} data - Element data
 * @returns {Object} { story, element, errors }
 */
export function create(story, type, data) {
  // Validate type
  if (!ELEMENT_TYPES[type]) {
    return { 
      story, 
      element: null, 
      errors: { type: `Invalid element type: ${type}` } 
    };
  }
  
  // Create element
  const element = createElement(type, data);
  
  // Validate element
  const validation = validateElement(element, type);
  if (!validation.isValid) {
    const errors = {};
    validation.errors.forEach((err, i) => {
      errors[`field_${i}`] = err;
    });
    return { story, element: null, errors };
  }
  
  // Clone story and add element
  const updatedStory = deepClone(story);
  if (!updatedStory.elements[type]) {
    updatedStory.elements[type] = [];
  }
  updatedStory.elements[type].push(element);
  updatedStory.updatedAt = new Date().toISOString();
  
  return { story: updatedStory, element, errors: {} };
}

/**
 * Update existing element
 * @param {Object} story - Story object
 * @param {string} id - Element ID
 * @param {Object} updates - Updates to apply
 * @returns {Object} { story, element, errors }
 */
export function update(story, id, updates) {
  // Find element
  const existing = getById(story, id);
  if (!existing) {
    return { 
      story, 
      element: null, 
      errors: { id: 'Element not found' } 
    };
  }
  
  // Merge updates
  const updatedElement = {
    ...existing,
    ...updates,
    id, // Preserve ID
    type: existing.type, // Preserve type
    updatedAt: new Date().toISOString(),
  };
  
  // Validate
  const validation = validateElement(updatedElement, existing.type);
  if (!validation.isValid) {
    const errors = {};
    validation.errors.forEach((err, i) => {
      errors[`field_${i}`] = err;
    });
    return { story, element: null, errors };
  }
  
  // Clone story and update
  const updatedStory = deepClone(story);
  const typeArray = updatedStory.elements[existing.type];
  const index = typeArray.findIndex(el => el.id === id);
  
  if (index !== -1) {
    typeArray[index] = updatedElement;
    updatedStory.updatedAt = new Date().toISOString();
  }
  
  return { story: updatedStory, element: updatedElement, errors: {} };
}

/**
 * Delete element
 * @param {Object} story - Story object
 * @param {string} id - Element ID
 * @returns {Object} { story, deleted, errors }
 */
export function remove(story, id) {
  // Find element
  const existing = getById(story, id);
  if (!existing) {
    return { 
      story, 
      deleted: false, 
      errors: { id: 'Element not found' } 
    };
  }
  
  // Clone story and remove
  const updatedStory = deepClone(story);
  updatedStory.elements[existing.type] = updatedStory.elements[existing.type]
    .filter(el => el.id !== id);
  
  // Also remove related relationships
  if (updatedStory.relationships) {
    updatedStory.relationships = updatedStory.relationships.filter(
      rel => rel.sourceId !== id && rel.targetId !== id
    );
  }
  
  updatedStory.updatedAt = new Date().toISOString();
  
  return { story: updatedStory, deleted: true, errors: {} };
}

/**
 * Get element statistics
 * @param {Object} story - Story object
 * @returns {Object} Stats by type
 */
export function getStats(story) {
  if (!story?.elements) {
    return Object.keys(ELEMENT_TYPES).reduce((acc, type) => {
      acc[type] = 0;
      return acc;
    }, {});
  }
  
  return Object.entries(ELEMENT_TYPES).reduce((acc, [type]) => {
    acc[type] = story.elements[type]?.length || 0;
    return acc;
  }, {});
}

/**
 * Search elements
 * @param {Object} story - Story object
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Array} Matching elements
 */
export function search(story, query, options = {}) {
  if (!story?.elements || !query) return [];
  
  const { types = null, limit = 50 } = options;
  const normalizedQuery = query.toLowerCase().trim();
  const results = [];
  
  const typesToSearch = types || Object.keys(story.elements);
  
  for (const type of typesToSearch) {
    const elements = story.elements[type] || [];
    for (const element of elements) {
      const matchesName = element.name?.toLowerCase().includes(normalizedQuery);
      const matchesDescription = element.description?.toLowerCase().includes(normalizedQuery);
      
      if (matchesName || matchesDescription) {
        results.push({ ...element, type });
        if (results.length >= limit) break;
      }
    }
    if (results.length >= limit) break;
  }
  
  return results;
}

/**
 * Duplicate element
 * @param {Object} story - Story object
 * @param {string} id - Element ID to duplicate
 * @returns {Object} { story, element, errors }
 */
export function duplicate(story, id) {
  const existing = getById(story, id);
  if (!existing) {
    return { 
      story, 
      element: null, 
      errors: { id: 'Element not found' } 
    };
  }
  
  const { type, ...elementData } = existing;
  const duplicatedData = {
    ...elementData,
    id: undefined, // Will be generated
    name: `${elementData.name} (Copy)`,
  };
  
  return create(story, type, duplicatedData);
}

/**
 * Reorder elements within type
 * @param {Object} story - Story object
 * @param {string} type - Element type
 * @param {number} fromIndex - Source index
 * @param {number} toIndex - Target index
 * @returns {Object} Updated story
 */
export function reorder(story, type, fromIndex, toIndex) {
  if (!story?.elements?.[type]) return story;
  
  const updatedStory = deepClone(story);
  const elements = updatedStory.elements[type];
  
  if (fromIndex < 0 || fromIndex >= elements.length) return story;
  if (toIndex < 0 || toIndex >= elements.length) return story;
  
  const [removed] = elements.splice(fromIndex, 1);
  elements.splice(toIndex, 0, removed);
  
  updatedStory.updatedAt = new Date().toISOString();
  
  return updatedStory;
}

export default {
  getAll,
  getAllFlat,
  getByType,
  getById,
  create,
  update,
  remove,
  getStats,
  search,
  duplicate,
  reorder,
};
