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
  isLoading: true,
  error: null,
  activeView: 'overview',
  isGenerating: false,
  continuationOptions: null,
  regenerationPrompt: null,
};

function storyReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    case ActionTypes.SET_STORY:
      return { ...state, story: action.payload, isLoading: false, error: null };
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
      return { ...state, regenerationPrompt: action.payload };
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

  const createStory = useCallback((title) => {
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

  const updateStoryFields = useCallback((updates) => {
    if (!state.story) return;
    const result = storyController.updateFields(state.story, updates);
    dispatch({ type: ActionTypes.UPDATE_STORY, payload: result.story });
    if (result.shouldPromptRegeneration) {
      dispatch({ 
        type: ActionTypes.SET_REGENERATION_PROMPT, 
        payload: { changes: updates, changedFields: result.changedFields }
      });
    }
  }, [state.story]);

  const dismissRegenerationPrompt = useCallback(() => {
    dispatch({ type: ActionTypes.SET_REGENERATION_PROMPT, payload: null });
  }, []);

  const addElement = useCallback((elementType, elementData) => {
    if (!state.story) return;
    const updated = storyController.addElement(state.story, elementType, elementData);
    dispatch({ type: ActionTypes.SET_STORY, payload: updated });
  }, [state.story]);

  const updateElement = useCallback((elementType, elementId, updates) => {
    if (!state.story) return;
    const updated = storyController.updateElement(state.story, elementType, elementId, updates);
    dispatch({ type: ActionTypes.SET_STORY, payload: updated });
  }, [state.story]);

  const removeElement = useCallback((elementType, elementId) => {
    if (!state.story) return;
    const updated = storyController.removeElement(state.story, elementType, elementId);
    dispatch({ type: ActionTypes.SET_STORY, payload: updated });
  }, [state.story]);

  const addRelationship = useCallback((sourceId, targetId, type, description) => {
    if (!state.story) return;
    const updated = storyController.addRelationship(state.story, sourceId, targetId, type, description);
    dispatch({ type: ActionTypes.SET_STORY, payload: updated });
  }, [state.story]);

  const removeRelationship = useCallback((relationshipId) => {
    if (!state.story) return;
    const updated = storyController.removeRelationship(state.story, relationshipId);
    dispatch({ type: ActionTypes.SET_STORY, payload: updated });
  }, [state.story]);

  const addChapter = useCallback((title) => {
    if (!state.story) return;
    const updated = storyController.addChapter(state.story, title);
    dispatch({ type: ActionTypes.SET_STORY, payload: updated });
  }, [state.story]);

  const updateChapter = useCallback((chapterIndex, updates) => {
    if (!state.story) return;
    const updated = storyController.updateChapter(state.story, chapterIndex, updates);
    dispatch({ type: ActionTypes.SET_STORY, payload: updated });
  }, [state.story]);

  const removeChapter = useCallback((chapterIndex) => {
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

  const generateFromIdea = useCallback(async (title, idea, genre) => {
    dispatch({ type: ActionTypes.SET_GENERATING, payload: true });
    try {
      const story = await storyController.generateFromIdea(title, idea, genre);
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
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      dispatch({ type: ActionTypes.SET_GENERATING, payload: false });
    }
  }, [state.story]);

  const applyContinuation = useCallback((continuation) => {
    if (!state.story) return;
    const updated = storyController.applyContinuation(state.story, continuation, state.story.currentChapterIndex);
    dispatch({ type: ActionTypes.SET_STORY, payload: updated });
    dispatch({ type: ActionTypes.CLEAR_CONTINUATION_OPTIONS });
  }, [state.story]);

  const clearContinuationOptions = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_CONTINUATION_OPTIONS });
  }, []);

  const setActiveView = useCallback((view) => {
    dispatch({ type: ActionTypes.SET_VIEW, payload: view });
  }, []);

  useEffect(() => { loadStories(); }, [loadStories]);

  useEffect(() => {
    if (state.story && !state.isLoading) {
      const timeoutId = setTimeout(() => saveStory(), 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [state.story, state.isLoading]);

  const value = {
    ...state,
    createStory, loadStory, saveStory, deleteStory, loadStories,
    updateStoryFields, dismissRegenerationPrompt,
    addElement, updateElement, removeElement,
    addRelationship, removeRelationship,
    addChapter, updateChapter, removeChapter, setCurrentChapter,
    generateFromIdea, generateContinuations, applyContinuation, clearContinuationOptions,
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
