/**
 * Models Index
 * @module models
 * @description Exports all model definitions and factories
 */

// Story model
export {
  createStory,
  createChapter,
  validateStory,
  createVersionSnapshot,
  STORY_DEFAULTS,
} from './Story';

// Element model
export {
  createElement,
  validateElement,
  getElementConfig,
  getAllElementTypes,
  getElementStorageKey,
  getElementKey,
  ELEMENT_TYPES,
  CHARACTER_ROLES,
  LOCATION_TYPES,
  ARC_TYPES,
} from './Element';

// Relationship model
export {
  createRelationship,
  validateRelationship,
  getRelationshipType,
  getAllRelationshipTypes,
  relationshipExists,
  getRelationshipsForElement,
  removeRelationshipsForElement,
  RELATIONSHIP_TYPES,
} from './Relationship';
