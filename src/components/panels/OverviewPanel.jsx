/**
 * Overview Panel
 * ============================================================================
 * 
 * @description Story overview dashboard with stats and metadata
 * @module components/panels/OverviewPanel
 */

import React, { useState } from 'react';
import { useStory } from '@contexts/StoryContext';
import { PageTemplate, PanelTemplate } from '@templates/PageTemplates';
import { TextField, TextArea, SelectField, FormRow, FormActions } from '@templates/FormFields';
import { StatCard } from '@templates/CardTemplates';
import { Modal } from '@components/common/Modal';
import Icons from '@components/common/Icons';
import { GENRES, TONES } from '@utils/constants';
import { ELEMENT_TYPES, getElementKey } from '@models/Element';
import { formatTimestamp } from '@utils/helpers';

/**
 * Overview panel component
 */
export function OverviewPanel({ onNavigate }) {
  const { 
    story, 
    loading, 
    saving,
    lastSaved,
    pendingCoreChanges,
    updateStory,
    updateSynopsis,
    confirmRegeneration,
    dismissChanges,
  } = useStory();

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editForm, setEditForm] = useState({});

  if (loading || !story) {
    return <PageTemplate loading={loading} error={!story ? 'No story loaded' : null} />;
  }

  // Calculate stats
  const stats = Object.keys(ELEMENT_TYPES).map(type => {
    const config = ELEMENT_TYPES[type];
    const key = getElementKey(type);
    return {
      id: type,
      label: config.plural,
      value: (story.elements[key] || []).length,
      icon: config.icon,
      color: config.color,
    };
  });

  const totalWords = story.chapters?.reduce((sum, ch) => {
    return sum + (ch.content?.split(/\s+/).filter(Boolean).length || 0);
  }, 0) || 0;

  const handleOpenDetails = () => {
    setEditForm({
      title: story.title,
      genre: story.genre,
      tone: story.tone,
      setting: story.setting,
    });
    setShowDetailsModal(true);
  };

  const handleSaveDetails = () => {
    updateStory(editForm);
    setShowDetailsModal(false);
  };

  const handleFieldChange = (value, name) => {
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <PageTemplate 
      title="Overview"
      actions={
        <div className="flex items-center gap-3">
          {saving && (
            <span className="text-sm text-sf-brown-400 flex items-center gap-1">
              <div className="spinner spinner-sm" />
              Saving...
            </span>
          )}
          {lastSaved && !saving && (
            <span className="text-sm text-sf-brown-400">
              Saved {formatTimestamp(lastSaved, { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      }
    >
      {/* Regeneration prompt */}
      {pendingCoreChanges && (
        <div className="mb-6 p-4 bg-sf-purple/10 border border-sf-purple/30 rounded-xl">
          <div className="flex items-start gap-3">
            <Icons.AlertTriangle size={20} className="text-sf-purple flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sf-brown-800 mb-1">Core story details changed</h4>
              <p className="text-sm text-sf-brown-600 mb-3">
                You've changed: {pendingCoreChanges.changes.map(c => c.field).join(', ')}.
                Would you like to regenerate story elements to match?
              </p>
              <div className="flex gap-3">
                <button className="btn btn-primary btn-sm" onClick={confirmRegeneration}>
                  <Icons.Sparkles size={14} />
                  Regenerate
                </button>
                <button className="btn btn-sm" onClick={dismissChanges}>
                  Keep as is
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Story header */}
      <PanelTemplate
        title={story.title}
        subtitle={[story.genre, story.tone].filter(Boolean).join(' • ') || 'No genre/tone set'}
        actions={
          <button className="btn btn-sm" onClick={handleOpenDetails}>
            <Icons.Edit size={14} />
            Edit Details
          </button>
        }
      >
        {/* Synopsis */}
        <div className="mb-6">
          <label className="form-label mb-2 block">Synopsis</label>
          <textarea
            className="form-textarea"
            rows={4}
            value={story.synopsis || ''}
            onChange={(e) => updateSynopsis(e.target.value)}
            placeholder="Write a brief synopsis of your story..."
          />
        </div>

        {/* Stats grid */}
        <div className="stats-grid">
          {stats.map(stat => (
            <StatCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              onClick={() => onNavigate(stat.id)}
            />
          ))}
          <StatCard
            label="Chapters"
            value={story.chapters?.length || 0}
            icon="Book"
            color="#6B7DB3"
            onClick={() => onNavigate('editor')}
          />
          <StatCard
            label="Words"
            value={totalWords.toLocaleString()}
            icon="FileText"
            color="#8B7355"
          />
          <StatCard
            label="Relationships"
            value={story.relationships?.length || 0}
            icon="Link"
            color="#C45B8E"
            onClick={() => onNavigate('relationships')}
          />
        </div>
      </PanelTemplate>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <button 
          className="card p-4 text-left hover:border-sf-accent transition-colors"
          onClick={() => onNavigate('editor')}
        >
          <div className="flex items-center gap-3">
            <div className="icon-square bg-sf-accent">
              <Icons.Edit size={18} />
            </div>
            <div>
              <span className="font-semibold text-sf-brown-800">Continue Writing</span>
              <p className="text-sm text-sf-brown-400">Open the story editor</p>
            </div>
          </div>
        </button>

        <button 
          className="card p-4 text-left hover:border-sf-purple transition-colors"
          onClick={() => onNavigate('character')}
        >
          <div className="flex items-center gap-3">
            <div className="icon-square bg-sf-purple">
              <Icons.Users size={18} />
            </div>
            <div>
              <span className="font-semibold text-sf-brown-800">Manage Characters</span>
              <p className="text-sm text-sf-brown-400">Add or edit characters</p>
            </div>
          </div>
        </button>
      </div>

      {/* Edit details modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Edit Story Details"
        size="md"
      >
        <div className="space-y-4">
          <TextField
            label="Title"
            name="title"
            value={editForm.title}
            onChange={handleFieldChange}
            required
          />
          <FormRow>
            <SelectField
              label="Genre"
              name="genre"
              value={editForm.genre}
              onChange={handleFieldChange}
              options={GENRES}
              placeholder="Select genre..."
            />
            <SelectField
              label="Tone"
              name="tone"
              value={editForm.tone}
              onChange={handleFieldChange}
              options={TONES}
              placeholder="Select tone..."
            />
          </FormRow>
          <TextArea
            label="Setting"
            name="setting"
            value={editForm.setting}
            onChange={handleFieldChange}
            placeholder="Describe the world/setting of your story..."
            rows={3}
          />
        </div>
        <FormActions>
          <button className="btn" onClick={() => setShowDetailsModal(false)}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSaveDetails}>
            <Icons.Check size={16} />
            Save Changes
          </button>
        </FormActions>
      </Modal>
    </PageTemplate>
  );
}

export default OverviewPanel;
