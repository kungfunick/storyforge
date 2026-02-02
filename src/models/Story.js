/**
 * Story Model
 * @module models/Story
 * @description Defines the Story data structure and factory functions
 * 
 * Follows Single Responsibility Principle:
 * - Only handles story data structure creation and validation
 */

import { generateId, createTimestamp } from '@utils/idGenerator';

/**
 * Default story configuration
 * @constant
 */
export const STORY_DEFAULTS = {
  maxVersions: 3,
  defaultGenre: '',
  defaultTone: '',
};

/**
 * Creates a new empty story object
 * @param {string} title - Story title
 * @returns {Story} New story object
 */
export function createStory(title = 'Untitled Story') {
  return {
    id: generateId(),
    title,
    genre: STORY_DEFAULTS.defaultGenre,
    tone: STORY_DEFAULTS.defaultTone,
    synopsis: '',
    elements: {
      characters: [],
      antagonists: [],
      locations: [],
      arcs: [],
      themes: [],
    },
    relationships: [],
    chapters: [createChapter('Chapter 1')],
    currentChapterIndex: 0,
    versions: [],
    currentVersion: 1,
    createdAt: createTimestamp(),
    updatedAt: createTimestamp(),
  };
}

/**
 * Creates a chapter object
 * @param {string} title - Chapter title
 * @param {string} content - Chapter content
 * @returns {Chapter} New chapter object
 */
export function createChapter(title = 'New Chapter', content = '') {
  return {
    id: generateId(),
    title,
    content,
    createdAt: createTimestamp(),
  };
}

/**
 * Validates a story object
 * @param {Object} story - Story to validate
 * @returns {boolean} Validation result
 */
export function validateStory(story) {
  if (!story) return false;
  if (typeof story.id !== 'string') return false;
  if (typeof story.title !== 'string') return false;
  if (!story.elements) return false;
  if (!Array.isArray(story.chapters)) return false;
  return true;
}

/**
 * Creates a story snapshot for version history
 * @param {Story} story - Current story state
 * @param {string} summary - Version summary
 * @returns {Version} Version snapshot
 */
export function createVersionSnapshot(story, summary = '') {
  return {
    id: generateId(),
    version: story.currentVersion,
    timestamp: createTimestamp(),
    summary,
    // Store minimal snapshot data
    snapshotData: {
      synopsis: story.synopsis,
      elementsCount: {
        characters: story.elements.characters.length,
        antagonists: story.elements.antagonists.length,
        locations: story.elements.locations.length,
        arcs: story.elements.arcs.length,
        themes: story.elements.themes.length,
      },
      chaptersCount: story.chapters.length,
      relationshipsCount: story.relationships.length,
    },
  };
}

/**
 * Type definitions (for documentation)
 * 
 * @typedef {Object} Story
 * @property {string} id - Unique identifier
 * @property {string} title - Story title
 * @property {string} genre - Story genre
 * @property {string} tone - Story tone
 * @property {string} synopsis - Story synopsis
 * @property {Elements} elements - Story elements
 * @property {Relationship[]} relationships - Element relationships
 * @property {Chapter[]} chapters - Story chapters
 * @property {number} currentChapterIndex - Active chapter index
 * @property {Version[]} versions - Version history
 * @property {number} currentVersion - Current version number
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 * 
 * @typedef {Object} Elements
 * @property {Character[]} characters
 * @property {Antagonist[]} antagonists
 * @property {Location[]} locations
 * @property {Arc[]} arcs
 * @property {Theme[]} themes
 * 
 * @typedef {Object} Chapter
 * @property {string} id - Unique identifier
 * @property {string} title - Chapter title
 * @property {string} content - Chapter content
 * @property {string} createdAt - Creation timestamp
 * 
 * @typedef {Object} Version
 * @property {string} id - Unique identifier
 * @property {number} version - Version number
 * @property {string} timestamp - Version timestamp
 * @property {string} summary - Version summary
 * @property {Object} snapshotData - Minimal snapshot data
 */
