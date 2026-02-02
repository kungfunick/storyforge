/**
 * Story Controller
 * @module controllers/StoryController
 * @description Handles story business logic and state management
 * 
 * Follows Single Responsibility Principle:
 * - Only handles story-related business operations
 */

import { 
  createStory, 
  createChapter, 
  createVersionSnapshot,
  STORY_DEFAULTS,
} from '@models/Story';
import { 
  createElement, 
  getElementStorageKey,
  ELEMENT_TYPES,
} from '@models/Element';
import { 
  createRelationship, 
  removeRelationshipsForElement,
} from '@models/Relationship';
import StorageService from '@services/StorageService';
import AIService from '@services/AIService';
import { createTimestamp } from '@utils/idGenerator';
import logger from '@utils/logger';

const REGENERATION_TRIGGER_FIELDS = ['genre', 'tone', 'synopsis'];

class StoryController {
  constructor() {
    this.maxVersions = STORY_DEFAULTS.maxVersions;
  }

  createNew(title = 'Untitled Story') {
    logger.info(`Creating new story: ${title}`);
    return createStory(title);
  }

  async save(story, userId = null) {
    const updatedStory = { ...story, updatedAt: createTimestamp() };
    await StorageService.saveStory(updatedStory, userId);
    logger.info(`Story saved: ${story.id}`);
    return updatedStory;
  }

  async load(storyId, userId = null) {
    const story = await StorageService.loadStory(storyId, userId);
    if (story) logger.info(`Story loaded: ${storyId}`);
    return story;
  }

  async loadAll(userId = null) {
    // FIX: Changed from loadAllStories to listStories to match StorageService
    return StorageService.listStories(userId);
  }

  async delete(storyId, userId = null) {
    await StorageService.deleteStory(storyId, userId);
    logger.info(`Story deleted: ${storyId}`);
    return true;
  }

  updateFields(story, updates) {
    const changedTriggerFields = REGENERATION_TRIGGER_FIELDS.filter(
      field => updates[field] !== undefined && updates[field] !== story[field]
    );
    
    const shouldPromptRegeneration = changedTriggerFields.length > 0 && 
      this.hasSubstantialContent(story);
    
    return {
      story: { ...story, ...updates, updatedAt: createTimestamp() },
      shouldPromptRegeneration,
      changedFields: changedTriggerFields,
    };
  }

  hasSubstantialContent(story) {
    const elementCount = Object.values(story.elements).reduce(
      (sum, arr) => sum + (arr?.length || 0), 0
    );
    const hasChapterContent = story.chapters?.some(ch => ch.content?.length > 100);
    return elementCount > 2 || hasChapterContent;
  }

  addElement(story, elementType, elementData) {
    const key = getElementStorageKey(elementType);
    const element = createElement(elementType, elementData);
    
    return {
      ...story,
      elements: {
        ...story.elements,
        [key]: [...(story.elements[key] || []), element],
      },
      updatedAt: createTimestamp(),
    };
  }

  updateElement(story, elementType, elementId, updates) {
    const key = getElementStorageKey(elementType);
    
    return {
      ...story,
      elements: {
        ...story.elements,
        [key]: story.elements[key].map(el =>
          el.id === elementId ? { ...el, ...updates, updatedAt: createTimestamp() } : el
        ),
      },
      updatedAt: createTimestamp(),
    };
  }

  removeElement(story, elementType, elementId) {
    const key = getElementStorageKey(elementType);
    
    return {
      ...story,
      elements: {
        ...story.elements,
        [key]: story.elements[key].filter(el => el.id !== elementId),
      },
      relationships: removeRelationshipsForElement(story.relationships, elementId),
      updatedAt: createTimestamp(),
    };
  }

  addRelationship(story, sourceId, targetId, type, description = '') {
    const relationship = createRelationship(sourceId, targetId, type, description);
    
    return {
      ...story,
      relationships: [...story.relationships, relationship],
      updatedAt: createTimestamp(),
    };
  }

  removeRelationship(story, relationshipId) {
    return {
      ...story,
      relationships: story.relationships.filter(r => r.id !== relationshipId),
      updatedAt: createTimestamp(),
    };
  }

  addChapter(story, title = '') {
    const chapterNum = story.chapters.length + 1;
    const chapter = createChapter(title || `Chapter ${chapterNum}`);
    
    return {
      ...story,
      chapters: [...story.chapters, chapter],
      currentChapterIndex: story.chapters.length,
      updatedAt: createTimestamp(),
    };
  }

  updateChapter(story, chapterIndex, updates) {
    return {
      ...story,
      chapters: story.chapters.map((ch, i) =>
        i === chapterIndex ? { ...ch, ...updates } : ch
      ),
      updatedAt: createTimestamp(),
    };
  }

  removeChapter(story, chapterIndex) {
    if (story.chapters.length <= 1) {
      throw new Error('Cannot delete the only chapter');
    }
    
    return {
      ...story,
      chapters: story.chapters.filter((_, i) => i !== chapterIndex),
      currentChapterIndex: Math.min(story.currentChapterIndex, story.chapters.length - 2),
      updatedAt: createTimestamp(),
    };
  }

  createVersion(story, summary = '') {
    const snapshot = createVersionSnapshot(story, summary);
    
    let versions = [...story.versions, snapshot];
    if (versions.length > this.maxVersions) {
      versions = versions.slice(-this.maxVersions);
    }
    
    return {
      ...story,
      versions,
      currentVersion: story.currentVersion + 1,
      updatedAt: createTimestamp(),
    };
  }

  async generateFromIdea(title, idea, genre = '') {
    const result = await AIService.generateFromIdea(title, idea, genre);
    return this.transformGeneratedStory(result.story);
  }

  async generateContinuations(story, mode, userPrompt = '') {
    return AIService.generateContinuations(story, mode, userPrompt);
  }

  applyContinuation(story, continuation, chapterIndex) {
    let updatedStory = this.createVersion(story, `Before: ${continuation.title}`);
    
    const cont = continuation.continuation;
    updatedStory = this.updateChapter(updatedStory, chapterIndex, {
      content: (updatedStory.chapters[chapterIndex].content || '') + '\n\n' + cont.chapterContent,
    });
    
    if (cont.synopsis) updatedStory.synopsis = cont.synopsis;
    
    if (cont.newElements) {
      Object.keys(ELEMENT_TYPES).forEach(type => {
        const key = getElementStorageKey(type);
        (cont.newElements[key] || []).forEach(elData => {
          updatedStory = this.addElement(updatedStory, type, elData);
        });
      });
    }
    
    if (cont.updatedElements) {
      cont.updatedElements.forEach(update => {
        updatedStory = this.updateElement(updatedStory, update.type, update._id, update.updates);
      });
    }
    
    if (cont.newRelationships) {
      cont.newRelationships.forEach(rel => {
        const sourceId = this.findElementId(updatedStory, rel.source);
        const targetId = this.findElementId(updatedStory, rel.target);
        if (sourceId && targetId) {
          updatedStory = this.addRelationship(updatedStory, sourceId, targetId, rel.type, rel.description);
        }
      });
    }
    
    return updatedStory;
  }

  transformGeneratedStory(generated) {
    const timestamp = Date.now();
    const story = createStory(generated.title);
    
    story.genre = generated.genre || '';
    story.tone = generated.tone || '';
    story.synopsis = generated.synopsis || '';
    
    Object.keys(ELEMENT_TYPES).forEach(type => {
      const key = getElementStorageKey(type);
      const elements = generated.elements?.[key] || [];
      story.elements[key] = elements.map((el, i) => 
        createElement(type, { ...el, id: `${timestamp}_${type}_${i}` })
      );
    });
    
    story.relationships = (generated.relationships || []).map(rel => {
      const sourceType = rel.sourceType || 'characters';
      const targetType = rel.targetType || 'characters';
      const sourceId = `${timestamp}_${sourceType.slice(0, -1)}_${rel.sourceIdx}`;
      const targetId = `${timestamp}_${targetType.slice(0, -1)}_${rel.targetIdx}`;
      return createRelationship(sourceId, targetId, rel.type, rel.description);
    });
    
    story.chapters = (generated.chapters || []).map(ch => createChapter(ch.title, ch.content));
    if (story.chapters.length === 0) story.chapters = [createChapter('Chapter 1')];
    
    return story;
  }

  findElementId(story, idOrName) {
    for (const type of Object.keys(ELEMENT_TYPES)) {
      const key = getElementStorageKey(type);
      const found = story.elements[key]?.find(el => el.id === idOrName || el.name === idOrName);
      if (found) return found.id;
    }
    return null;
  }
}

export const storyController = new StoryController();
export default storyController;