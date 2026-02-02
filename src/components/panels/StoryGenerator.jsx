/**
 * Story Generator
 * ============================================================================
 * 
 * @description Generate a new story from title and idea
 * @module components/panels/StoryGenerator
 */

import React, { useState } from 'react';
import { useStory } from '@contexts/StoryContext';
import { TextField, TextArea, SelectField, FormActions } from '@templates/FormFields';
import Icons from '@components/common/Icons';
import { GENRES, TONES } from '@utils/constants';

/**
 * Story Generator component
 * @param {Object} props - Component props
 * @param {Function} props.onClose - Close handler
 */
export function StoryGenerator({ onClose }) {
  const { createNew, generateFromIdea } = useStory();

  const [mode, setMode] = useState('idea'); // 'idea' or 'blank'
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
      createNew({ title: formData.title || 'Untitled Story' });
      onClose?.();
      return;
    }

    // Generate from idea
    if (!formData.title.trim() || !formData.idea.trim()) {
      setError('Title and idea are required');
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
      setError('Failed to generate story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generator-panel">
      {/* Mode tabs */}
      <div className="flex gap-2 mb-6">
        <button
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            mode === 'idea' 
              ? 'bg-sf-accent text-white' 
              : 'bg-sf-cream text-sf-brown-600 hover:bg-sf-cream-dark'
          }`}
          onClick={() => setMode('idea')}
        >
          <Icons.Sparkles size={16} className="inline mr-2" />
          Generate from Idea
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            mode === 'blank' 
              ? 'bg-sf-accent text-white' 
              : 'bg-sf-cream text-sf-brown-600 hover:bg-sf-cream-dark'
          }`}
          onClick={() => setMode('blank')}
        >
          <Icons.FileText size={16} className="inline mr-2" />
          Start Blank
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

        {mode === 'idea' && (
          <>
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

            <div className="p-3 bg-sf-purple/10 rounded-lg text-sm text-sf-brown-600">
              <Icons.Sparkles size={14} className="inline mr-2 text-sf-purple" />
              AI will generate characters, locations, story arcs, themes, relationships, 
              and your first chapter.
            </div>
          </>
        )}

        {error && (
          <div className="p-3 bg-sf-red/10 text-sf-red rounded-lg text-sm">
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
          className="btn btn-primary"
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
              Generate Story
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
