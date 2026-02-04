/**
 * Story Generator
 * ============================================================================
 * 
 * @description Create a new story - offline-first with optional AI generation
 * @module components/panels/StoryGenerator
 */

import React, { useState } from 'react';
import { useStory } from '@contexts/StoryContext';
import { TextField, TextArea, SelectField, FormActions } from '@templates/FormFields';
import Icons from '@components/common/Icons';
import { GENRES, TONES } from '@utils/constants';

/**
 * Story Generator component - Offline-first, AI optional
 * @param {Object} props - Component props
 * @param {Function} props.onClose - Close handler
 */
export function StoryGenerator({ onClose }) {
  const { createNew, generateFromIdea } = useStory();

  // Default to manual/blank mode - offline first approach
  const [mode, setMode] = useState('blank');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    idea: '',
    genre: '',
    tone: '',
  });

  const handleFieldChange = (value, name) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (mode === 'blank') {
      // Create story immediately - no API needed
      createNew({ title: formData.title || 'Untitled Story' });
      onClose?.();
      return;
    }

    // AI Generation mode
    if (!formData.title.trim() || !formData.idea.trim()) {
      setError('Title and idea are required for AI generation');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await generateFromIdea({
        title: formData.title,
        idea: formData.idea,
        genre: formData.genre,
        tone: formData.tone,
      });
      onClose?.();
    } catch (err) {
      setError('Failed to generate story. Please try again or start with a blank story.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generator-panel">
      <div className="text-center mb-6">
        <Icons.Book size={40} className="mx-auto mb-3 text-accent-blue" />
        <h2 className="font-serif text-2xl font-bold mb-2">Create New Story</h2>
        <p className="text-sm text-primary-400">
          Start writing your story with full element tracking
        </p>
      </div>

      {/* Mode tabs - Blank (offline) first */}
      <div className="flex gap-2 mb-6">
        <button
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
            mode === 'blank' 
              ? 'bg-accent-blue text-white' 
              : 'bg-surface-primary text-primary-600 hover:bg-surface-tertiary border border-border'
          }`}
          onClick={() => setMode('blank')}
        >
          <Icons.Edit size={16} className="inline mr-2" />
          Start Writing
        </button>
        <button
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
            mode === 'idea' 
              ? 'bg-accent-purple text-white' 
              : 'bg-surface-primary text-primary-600 hover:bg-surface-tertiary border border-border'
          }`}
          onClick={() => setMode('idea')}
        >
          <Icons.Sparkles size={16} className="inline mr-2" />
          AI Generate
        </button>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <TextField
          label="Story Title"
          name="title"
          value={formData.title}
          onChange={handleFieldChange}
          placeholder="Enter your story title..."
          required={mode === 'idea'}
        />

        {mode === 'blank' ? (
          <>
            {/* Blank/Manual mode - optional metadata */}
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Genre (optional)"
                name="genre"
                value={formData.genre}
                onChange={handleFieldChange}
                options={GENRES}
                placeholder="Select genre..."
              />
              <SelectField
                label="Tone (optional)"
                name="tone"
                value={formData.tone}
                onChange={handleFieldChange}
                options={TONES}
                placeholder="Select tone..."
              />
            </div>

            <div className="p-4 bg-surface-primary rounded-lg border border-border">
              <h4 className="font-medium text-primary-600 mb-2 flex items-center gap-2">
                <Icons.CheckCircle size={16} className="text-accent-green" />
                Works Offline
              </h4>
              <ul className="text-sm text-primary-500 space-y-1">
                <li>• Track characters, locations, arcs, and themes</li>
                <li>• Map relationships between elements</li>
                <li>• Write and organize chapters</li>
                <li>• Export to Markdown, RTF, or PDF</li>
                <li>• Version history for your work</li>
              </ul>
            </div>
          </>
        ) : (
          <>
            {/* AI Generation mode */}
            <TextArea
              label="Story Idea"
              name="idea"
              value={formData.idea}
              onChange={handleFieldChange}
              placeholder="Describe your story concept, main plot, or premise..."
              rows={4}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Genre"
                name="genre"
                value={formData.genre}
                onChange={handleFieldChange}
                options={GENRES}
                placeholder="Select genre..."
              />
              <SelectField
                label="Tone"
                name="tone"
                value={formData.tone}
                onChange={handleFieldChange}
                options={TONES}
                placeholder="Select tone..."
              />
            </div>

            <div className="p-3 bg-accent-purple/10 rounded-lg text-sm text-primary-600 border border-accent-purple/20">
              <Icons.Sparkles size={14} className="inline mr-2 text-accent-purple" />
              AI will generate characters, locations, story arcs, themes, relationships, 
              and your first chapter. Requires internet connection.
            </div>
          </>
        )}

        {error && (
          <div className="p-3 bg-accent-red/10 text-accent-red rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Actions */}
      <FormActions align="between">
        <button className="btn" onClick={onClose}>
          Cancel
        </button>
        <button 
          className={`btn ${mode === 'idea' ? 'btn-ai' : 'btn-primary'}`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner spinner-sm" />
              Generating...
            </>
          ) : mode === 'idea' ? (
            <>
              <Icons.Sparkles size={16} />
              Generate with AI
            </>
          ) : (
            <>
              <Icons.Plus size={16} />
              Create Story
            </>
          )}
        </button>
      </FormActions>
    </div>
  );
}

export default StoryGenerator;