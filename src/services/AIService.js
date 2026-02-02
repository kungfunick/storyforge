/**
 * AI Service
 * ============================================================================
 * 
 * @description Handles AI-powered story generation API calls
 * @module services/AIService
 * 
 * Responsibilities:
 * - Compile story state for API transport
 * - Generate story continuations
 * - Generate initial story from idea
 * - Handle API errors gracefully
 */

import { API_ENDPOINTS } from '@utils/constants';
import { ELEMENT_TYPES, getElementStorageKey } from '@models/Element';

/**
 * AI Service
 * @description Manages story generation API interactions
 */
const AIService = {
  /**
   * Compiles story state to optimized transport format
   * @param {Object} story - Current story state
   * @returns {Object} Optimized story data for API
   */
  compileStoryState(story) {
    const elements = {};
    
    // Compile each element type with abbreviated keys
    Object.keys(ELEMENT_TYPES).forEach(type => {
      const key = type; // Use type directly as key since elements are stored by type
      elements[key] = (story.elements?.[key] || []).map(el => ({
        _id: el.id,
        name: el.name,
        role: el.role,
        type: el.type,
        desc: el.description,
        ...this._getTypeSpecificFields(el, type),
      }));
    });

    return {
      meta: {
        id: story.id,
        title: story.title,
        genre: story.genre,
        tone: story.tone,
        setting: story.setting,
        version: story.currentVersion,
      },
      synopsis: story.synopsis || '',
      elements,
      relationships: story.relationships || [],
      chapters: (story.chapters || []).map((ch, i) => ({
        _id: ch.id,
        idx: i,
        title: ch.title,
        // Only send last 2000 chars for context
        content: ch.content?.slice(-2000) || '',
      })),
      currentChapterIdx: story.currentChapterIndex || 0,
    };
  },

  /**
   * Gets type-specific fields for compilation
   * @private
   * @param {Object} element - Element object
   * @param {string} type - Element type
   * @returns {Object} Type-specific fields
   */
  _getTypeSpecificFields(element, type) {
    switch (type) {
      case 'character':
        return { traits: element.traits, goals: element.goals };
      case 'antagonist':
        return { motivation: element.motivation, methods: element.methods };
      case 'arc':
        return { stakes: element.stakes };
      default:
        return {};
    }
  },

  /**
   * Generates continuation options from AI
   * @param {Object} story - Current story state
   * @param {string} mode - Generation mode
   * @param {string} [userPrompt] - Optional user guidance
   * @returns {Promise<Object>} Three continuation options with updates
   */
  async generateContinuations(story, mode, userPrompt = '') {
    const storyState = this.compileStoryState(story);

    try {
      const response = await fetch(API_ENDPOINTS.CONTINUE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story: storyState,
          mode,
          userPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('AIService.generateContinuations error:', error);
      throw error;
    }
  },

  /**
   * Generates initial story from title and idea
   * @param {Object} options - Generation options
   * @param {string} options.title - Story title
   * @param {string} options.idea - Story concept/idea
   * @param {string} [options.genre] - Optional genre
   * @param {string} [options.tone] - Optional tone
   * @returns {Promise<Object>} Complete initial story structure
   */
  async generateFromIdea(options) {
    const { title, idea, genre = '', tone = '' } = options;

    try {
      const response = await fetch(API_ENDPOINTS.GENERATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          idea,
          genre,
          tone,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('AIService.generateFromIdea error:', error);
      throw error;
    }
  },

  /**
   * Regenerates story based on changed core details
   * @param {Object} story - Current story state
   * @param {Object} changes - Changed fields { field, oldValue, newValue }[]
   * @returns {Promise<Object>} Regeneration suggestions
   */
  async regenerateForChanges(story, changes) {
    const storyState = this.compileStoryState(story);

    try {
      const response = await fetch(API_ENDPOINTS.GENERATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story: storyState,
          regenerate: true,
          changes,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('AIService.regenerateForChanges error:', error);
      throw error;
    }
  },
};

export default AIService;
