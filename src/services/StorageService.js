/**
 * Storage Service
 * ============================================================================
 * 
 * @description Handles persistent data storage operations
 * @module services/StorageService
 * 
 * Responsibilities:
 * - Load data from storage
 * - Save data to storage
 * - Handle storage errors gracefully
 * 
 * Supports multiple backends:
 * - Supabase (if configured)
 * - LocalStorage (fallback)
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { STORAGE_KEYS } from '@utils/constants';
import { safeJsonParse } from '@utils/helpers';

/**
 * Storage backend types
 */
const BACKEND = {
  SUPABASE: 'supabase',
  LOCAL: 'local',
};

/**
 * Gets the current storage backend
 * @returns {string} Backend type
 */
function getBackend() {
  return isSupabaseConfigured() ? BACKEND.SUPABASE : BACKEND.LOCAL;
}

/**
 * StorageService
 * @description Unified storage interface with multiple backends
 */
const StorageService = {
  /**
   * Loads story data from storage
   * @param {string} [userId] - Optional user ID for Supabase
   * @returns {Promise<Object|null>} Story data or null
   */
  async loadStory(userId = null) {
    const backend = getBackend();

    try {
      if (backend === BACKEND.SUPABASE && userId) {
        return await this._loadFromSupabase(userId);
      }
      return this._loadFromLocal();
    } catch (error) {
      console.error('StorageService.loadStory error:', error);
      return null;
    }
  },

  /**
   * Saves story data to storage
   * @param {Object} story - Story data to save
   * @param {string} [userId] - Optional user ID for Supabase
   * @returns {Promise<boolean>} Success status
   */
  async saveStory(story, userId = null) {
    const backend = getBackend();

    try {
      if (backend === BACKEND.SUPABASE && userId) {
        return await this._saveToSupabase(story, userId);
      }
      return this._saveToLocal(story);
    } catch (error) {
      console.error('StorageService.saveStory error:', error);
      return false;
    }
  },

  /**
   * Deletes story data from storage
   * @param {string} storyId - Story ID to delete
   * @param {string} [userId] - Optional user ID for Supabase
   * @returns {Promise<boolean>} Success status
   */
  async deleteStory(storyId, userId = null) {
    const backend = getBackend();

    try {
      if (backend === BACKEND.SUPABASE && userId) {
        return await this._deleteFromSupabase(storyId, userId);
      }
      return this._deleteFromLocal();
    } catch (error) {
      console.error('StorageService.deleteStory error:', error);
      return false;
    }
  },

  /**
   * Lists all stories for a user
   * @param {string} [userId] - Optional user ID for Supabase
   * @returns {Promise<Array>} Array of story metadata
   */
  async listStories(userId = null) {
    const backend = getBackend();

    try {
      if (backend === BACKEND.SUPABASE && userId) {
        return await this._listFromSupabase(userId);
      }
      // Local storage only supports single story
      const story = this._loadFromLocal();
      return story ? [{ id: story.id, title: story.title, updatedAt: story.updatedAt }] : [];
    } catch (error) {
      console.error('StorageService.listStories error:', error);
      return [];
    }
  },

  // ============================================================================
  // PRIVATE: LocalStorage Backend
  // ============================================================================

  /**
   * Loads from localStorage
   * @private
   * @returns {Object|null} Story data
   */
  _loadFromLocal() {
    const data = localStorage.getItem(STORAGE_KEYS.STORY);
    return safeJsonParse(data, null);
  },

  /**
   * Saves to localStorage
   * @private
   * @param {Object} story - Story data
   * @returns {boolean} Success status
   */
  _saveToLocal(story) {
    try {
      localStorage.setItem(STORAGE_KEYS.STORY, JSON.stringify(story));
      return true;
    } catch (error) {
      console.error('LocalStorage save error:', error);
      return false;
    }
  },

  /**
   * Deletes from localStorage
   * @private
   * @returns {boolean} Success status
   */
  _deleteFromLocal() {
    try {
      localStorage.removeItem(STORAGE_KEYS.STORY);
      return true;
    } catch (error) {
      console.error('LocalStorage delete error:', error);
      return false;
    }
  },

  // ============================================================================
  // PRIVATE: Supabase Backend
  // ============================================================================

  /**
   * Loads from Supabase
   * @private
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Story data
   */
  async _loadFromSupabase(userId) {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase load error:', error);
      return null;
    }

    return data?.content || null;
  },

  /**
   * Saves to Supabase
   * @private
   * @param {Object} story - Story data
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async _saveToSupabase(story, userId) {
    const { error } = await supabase
      .from('stories')
      .upsert({
        id: story.id,
        user_id: userId,
        title: story.title,
        content: story,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });

    if (error) {
      console.error('Supabase save error:', error);
      return false;
    }

    return true;
  },

  /**
   * Deletes from Supabase
   * @private
   * @param {string} storyId - Story ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async _deleteFromSupabase(storyId, userId) {
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase delete error:', error);
      return false;
    }

    return true;
  },

  /**
   * Lists from Supabase
   * @private
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Story list
   */
  async _listFromSupabase(userId) {
    const { data, error } = await supabase
      .from('stories')
      .select('id, title, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Supabase list error:', error);
      return [];
    }

    return data || [];
  },
};

export default StorageService;
