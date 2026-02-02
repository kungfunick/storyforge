/**
 * Editor Panel
 * ============================================================================
 * 
 * @description Story editor with chapter management and AI continuation
 * @module components/panels/EditorPanel
 */

import React, { useState, useCallback } from 'react';
import { useStory } from '@contexts/StoryContext';
import { PageTemplate } from '@templates/PageTemplates';
import { ContinuationCard } from '@templates/CardTemplates';
import { Modal } from '@components/common/Modal';
import Icons from '@components/common/Icons';
import { GENERATION_MODES } from '@utils/constants';
import { debounce } from '@utils/helpers';

/**
 * Editor panel component
 */
export function EditorPanel() {
  const { 
    story, 
    loading, 
    updateChapter, 
    addChapter, 
    deleteChapter,
    setCurrentChapter,
    generateContinuations,
    applyContinuation,
  } = useStory();

  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiMode, setAiMode] = useState('continue');
  const [aiLoading, setAiLoading] = useState(false);
  const [continuations, setContinuations] = useState(null);
  const [showNewChapter, setShowNewChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  if (loading || !story) {
    return <PageTemplate loading={loading} />;
  }

  const chapters = story.chapters || [];
  const currentIndex = story.currentChapterIndex || 0;
  const currentChapter = chapters[currentIndex] || {};

  // Debounced content update
  const debouncedUpdateContent = useCallback(
    debounce((content) => {
      updateChapter(currentIndex, { content });
    }, 500),
    [currentIndex, updateChapter]
  );

  const handleTitleChange = (title) => {
    updateChapter(currentIndex, { title });
  };

  const handleContentChange = (e) => {
    debouncedUpdateContent(e.target.value);
  };

  const handleAddChapter = () => {
    if (!newChapterTitle.trim()) return;
    addChapter({ title: newChapterTitle });
    setNewChapterTitle('');
    setShowNewChapter(false);
  };

  const handleDeleteChapter = () => {
    if (chapters.length <= 1) return;
    if (confirm('Delete this chapter?')) {
      deleteChapter(currentIndex);
    }
  };

  const handleGenerateContinuations = async () => {
    setAiLoading(true);
    setContinuations(null);

    try {
      const result = await generateContinuations(aiMode);
      setContinuations(result.options);
    } catch (error) {
      console.error('Failed to generate continuations:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelectContinuation = (option) => {
    applyContinuation(option, currentIndex);
    setContinuations(null);
    setShowAIPanel(false);
  };

  // Word count for current chapter
  const wordCount = currentChapter.content?.split(/\s+/).filter(Boolean).length || 0;

  return (
    <div className="h-full flex flex-col">
      {/* Editor container */}
      <div className="editor-container flex-1">
        {/* Chapter tabs */}
        <div className="editor-chapters">
          {chapters.map((ch, i) => (
            <button
              key={ch.id}
              className={`chapter-tab ${i === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentChapter(i)}
            >
              <span>{ch.title || `Chapter ${i + 1}`}</span>
            </button>
          ))}
          <button
            className="chapter-tab"
            onClick={() => setShowNewChapter(true)}
          >
            <Icons.Plus size={14} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="editor-toolbar">
          <input
            type="text"
            className="editor-title-input"
            value={currentChapter.title || ''}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Chapter Title"
          />
          
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-sf-brown-400">
              {wordCount.toLocaleString()} words
            </span>
            
            <button
              className="btn btn-sm"
              onClick={() => setShowAIPanel(!showAIPanel)}
            >
              <Icons.Sparkles size={14} />
              AI Continue
            </button>

            {chapters.length > 1 && (
              <button
                className="btn-icon btn-icon-danger"
                onClick={handleDeleteChapter}
                title="Delete chapter"
              >
                <Icons.Trash size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Content area */}
        <textarea
          className="editor-content scrollbar-thin"
          defaultValue={currentChapter.content || ''}
          onChange={handleContentChange}
          placeholder="Start writing your story..."
        />

        {/* AI Panel */}
        {showAIPanel && (
          <div className="ai-panel">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Icons.Sparkles size={18} className="text-sf-purple" />
                AI Continuation
              </h4>
              <button
                className="btn-icon"
                onClick={() => {
                  setShowAIPanel(false);
                  setContinuations(null);
                }}
              >
                <Icons.X size={18} />
              </button>
            </div>

            {/* Mode selection */}
            <div className="flex flex-wrap gap-2 mb-4">
              {GENERATION_MODES.map(mode => (
                <button
                  key={mode.id}
                  className={`ai-mode-btn ${aiMode === mode.id ? 'active' : ''}`}
                  onClick={() => setAiMode(mode.id)}
                  title={mode.description}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Generate button */}
            {!continuations && !aiLoading && (
              <button
                className="btn btn-primary w-full"
                onClick={handleGenerateContinuations}
              >
                <Icons.Sparkles size={16} />
                Generate Options
              </button>
            )}

            {/* Loading */}
            {aiLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="spinner" />
                <span className="ml-3 text-sf-brown-500">Generating options...</span>
              </div>
            )}

            {/* Continuation options */}
            {continuations && (
              <div className="space-y-3 mt-4">
                {continuations.map((option, i) => (
                  <ContinuationCard
                    key={i}
                    option={option}
                    index={i}
                    onSelect={handleSelectContinuation}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* New chapter modal */}
      <Modal
        isOpen={showNewChapter}
        onClose={() => setShowNewChapter(false)}
        title="Add New Chapter"
        size="sm"
      >
        <input
          type="text"
          className="form-input w-full mb-4"
          value={newChapterTitle}
          onChange={(e) => setNewChapterTitle(e.target.value)}
          placeholder="Chapter title..."
          onKeyDown={(e) => e.key === 'Enter' && handleAddChapter()}
          autoFocus
        />
        <div className="flex justify-end gap-3">
          <button className="btn" onClick={() => setShowNewChapter(false)}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleAddChapter}>
            <Icons.Plus size={16} />
            Add Chapter
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default EditorPanel;
