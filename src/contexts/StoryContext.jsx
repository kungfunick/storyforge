/**
 * Story Context
 * @module contexts/StoryContext
 * @description React context for story state management
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { storyController } from '@controllers/StoryController';
import logger from '@utils/logger';

const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_STORY: 'SET_STORY',
  SET_STORIES: 'SET_STORIES',
  UPDATE_STORY: 'UPDATE_STORY',
  SET_VIEW: 'SET_VIEW',
  SET_GENERATING: 'SET_GENERATING',
  SET_CONTINUATION_OPTIONS: 'SET_CONTINUATION_OPTIONS',
  CLEAR_CONTINUATION_OPTIONS: 'CLEAR_CONTINUATION_OPTIONS',
  SET_REGENERATION_PROMPT: 'SET_REGENERATION_PROMPT',
};

const initialState = {
  story: null,
  stories: [],
  loading: true,
  error: null,
  activeView: 'overview',
  isGenerating: false,
  continuationOptions: null,
  pendingCoreChanges: null,
};

function storyReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ActionTypes.SET_STORY:
      return { ...state, story: action.payload, loading: false, error: null };
    case ActionTypes.SET_STORIES:
      return { ...state, stories: action.payload };
    case ActionTypes.UPDATE_STORY:
      return { ...state, story: { ...state.story, ...action.payload } };
    case ActionTypes.SET_VIEW:
      return { ...state, activeView: action.payload };
    case ActionTypes.SET_GENERATING:
      return { ...state, isGenerating: action.payload };
    case ActionTypes.SET_CONTINUATION_OPTIONS:
      return { ...state, continuationOptions: action.payload, isGenerating: false };
    case ActionTypes.CLEAR_CONTINUATION_OPTIONS:
      return { ...state, continuationOptions: null };
    case ActionTypes.SET_REGENERATION_PROMPT:
      return { ...state, pendingCoreChanges: action.payload };
    default:
      return state;
  }
}

const StoryContext = createContext(null);

export function StoryProvider({ children, userId = null }) {
  const [state, dispatch] = useReducer(storyReducer, initialState);

  const loadStories = useCallback(async () => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const stories = await storyController.loadAll(userId);
      dispatch({ type: ActionTypes.SET_STORIES, payload: stories });
      if (stories.length > 0 && !state.story) {
        const latestStory = await storyController.load(stories[0].id, userId);
        dispatch({ type: ActionTypes.SET_STORY, payload: latestStory });
      } else {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    } catch (error) {
      logger.error('Failed to load stories:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  }, [userId]);

  // FIX: Export as createNew to match what components expect
  const createNew = useCallback((title) => {
    const newStory = storyController.createNew(title);
    dispatch({ type: ActionTypes.SET_STORY, payload: newStory });
    return newStory;
  }, []);

  const loadStory = useCallback(async (storyId) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const story = await storyController.load(storyId, userId);
      dispatch({ type: ActionTypes.SET_STORY, payload: story });
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  }, [userId]);

  const saveStory = useCallback(async () => {
    if (!state.story) return;
    try {
      const saved = await storyController.save(state.story, userId);
      dispatch({ type: ActionTypes.UPDATE_STORY, payload: saved });
      const stories = await storyController.loadAll(userId);
      dispatch({ type: ActionTypes.SET_STORIES, payload: stories });
    } catch (error) {
      logger.error('Failed to save story:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  }, [state.story, userId]);

  const deleteStory = useCallback(async (storyId) => {
    try {
      await storyController.delete(storyId, userId);
      const stories = await storyController.loadAll(userId);
      dispatch({ type: ActionTypes.SET_STORIES, payload: stories });
      if (state.story?.id === storyId) {
        if (stories.length > 0) {
          const nextStory = await storyController.load(stories[0].id, userId);
          dispatch({ type: ActionTypes.SET_STORY, payload: nextStory });
        } else {
          dispatch({ type: ActionTypes.SET_STORY, payload: null });
        }
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  }, [state.story?.id, userId]);

  const updateStory = useCallback((updates) => {
    if (!state.story) return;
    const result = storyController.updateFields(state.story, updates);
    dispatch({ type: ActionTypes.UPDATE_STORY, payload: result.story });
    if (result.shouldPromptRegeneration) {
      dispatch({ 
        type: ActionTypes.SET_REGENERATION_PROMPT, 
        payload: { changes: result.changedFields }
      });
    }
  }, [state.story]);

  const updateSynopsis = useCallback((synopsis) => {
    updateStory({ synopsis });
  }, [updateStory]);

  const dismissChanges = useCallback(() => {
    dispatch({ type: ActionTypes.SET_REGENERATION_PROMPT, payload: null });
  }, []);

  const confirmRegeneration = useCallback(async () => {
    // TODO: Implement regeneration
    dispatch({ type: ActionTypes.SET_REGENERATION_PROMPT, payload: null });
  }, []);

  const createElement = useCallback((elementType, elementData) => {
    if (!state.story) return { errors: ['No story loaded'] };
    try {
      const updated = storyController.addElement(state.story, elementType, elementData);
      dispatch({ type: ActionTypes.SET_STORY, payload: updated });
      return { errors: [] };
    } catch (error) {
      return { errors: [error.message] };
    }
  }, [state.story]);

  const updateElement = useCallback((elementType, elementId, updates) => {
    if (!state.story) return { errors: ['No story loaded'] };
    try {
      const updated = storyController.updateElement(state.story, elementType, elementId, updates);
      dispatch({ type: ActionTypes.SET_STORY, payload: updated });
      return { errors: [] };
    } catch (error) {
      return { errors: [error.message] };
    }
  }, [state.story]);

  const deleteElement = useCallback((elementType, elementId) => {
    if (!state.story) return;
    const updated = storyController.removeElement(state.story, elementType, elementId);
    dispatch({ type: ActionTypes.SET_STORY, payload: updated });
  }, [state.story]);

  const createRelationship = useCallback((relationshipData) => {
    if (!state.story) return;
    const { sourceId, targetId, type, description } = relationshipData;
    const updated = storyController.addRelationship(state.story, sourceId, targetId, type, description);
    dispatch({ type: ActionTypes.SET_STORY, payload: updated });
  }, [state.story]);

  const deleteRelationship = useCallback((relationshipId) => {
    if (!state.story) return;
    const updated = storyController.removeRelationship(state.story, relationshipId);
    dispatch({ type: ActionTypes.SET_STORY, payload: updated });
  }, [state.story]);

  const addChapter = useCallback((chapterData) => {
    if (!state.story) return;
    const updated = storyController.addChapter(state.story, chapterData.title);
    dispatch({ type: ActionTypes.SET_STORY, payload: updated });
  }, [state.story]);

  const updateChapter = useCallback((chapterIndex, updates) => {
    if (!state.story) return;
    const updated = storyController.updateChapter(state.story, chapterIndex, updates);
    dispatch({ type: ActionTypes.SET_STORY, payload: updated });
  }, [state.story]);

  const deleteChapter = useCallback((chapterIndex) => {
    if (!state.story) return;
    try {
      const updated = storyController.removeChapter(state.story, chapterIndex);
      dispatch({ type: ActionTypes.SET_STORY, payload: updated });
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  }, [state.story]);

  const setCurrentChapter = useCallback((index) => {
    dispatch({ type: ActionTypes.UPDATE_STORY, payload: { currentChapterIndex: index } });
  }, []);

  const generateFromIdea = useCallback(async (params) => {
    dispatch({ type: ActionTypes.SET_GENERATING, payload: true });
    try {
      const story = await storyController.generateFromIdea(params.title, params.idea, params.genre);
      dispatch({ type: ActionTypes.SET_STORY, payload: story });
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: ActionTypes.SET_GENERATING, payload: false });
    }
  }, []);

  const generateContinuations = useCallback(async (mode, userPrompt) => {
    if (!state.story) return;
    dispatch({ type: ActionTypes.SET_GENERATING, payload: true });
    try {
      const result = await storyController.generateContinuations(state.story, mode, userPrompt);
      dispatch({ type: ActionTypes.SET_CONTINUATION_OPTIONS, payload: result.options });
      return result;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      dispatch({ type: ActionTypes.SET_GENERATING, payload: false });
      throw error;
    }
  }, [state.story]);

  const applyContinuation = useCallback((continuation, chapterIndex) => {
    if (!state.story) return;
    const updated = storyController.applyContinuation(state.story, continuation, chapterIndex);
    dispatch({ type: ActionTypes.SET_STORY, payload: updated });
    dispatch({ type: ActionTypes.CLEAR_CONTINUATION_OPTIONS });
  }, [state.story]);

  const clearContinuationOptions = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_CONTINUATION_OPTIONS });
  }, []);

  const createVersion = useCallback((summary) => {
    if (!state.story) return;
    const updated = storyController.createVersion(state.story, summary);
    dispatch({ type: ActionTypes.SET_STORY, payload: updated });
  }, [state.story]);

  const setActiveView = useCallback((view) => {
    dispatch({ type: ActionTypes.SET_VIEW, payload: view });
  }, []);

  useEffect(() => { loadStories(); }, [loadStories]);

  useEffect(() => {
    if (state.story && !state.loading) {
      const timeoutId = setTimeout(() => saveStory(), 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [state.story, state.loading, saveStory]);

  const value = {
    ...state,
    // FIX: Export as createNew to match component expectations
    createNew,
    loadStory,
    saveStory,
    deleteStory,
    loadStories,
    updateStory,
    updateSynopsis,
    dismissChanges,
    confirmRegeneration,
    createElement,
    updateElement,
    deleteElement,
    createRelationship,
    deleteRelationship,
    addChapter,
    updateChapter,
    deleteChapter,
    setCurrentChapter,
    generateFromIdea,
    generateContinuations,
    applyContinuation,
    clearContinuationOptions,
    createVersion,
    setActiveView,
  };

  return <StoryContext.Provider value={value}>{children}</StoryContext.Provider>;
}

export function useStory() {
  const context = useContext(StoryContext);
  if (!context) throw new Error('useStory must be used within a StoryProvider');
  return context;
}

export default StoryContext;