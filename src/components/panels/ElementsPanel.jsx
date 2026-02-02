/**
 * Elements Panel
 * ============================================================================
 * 
 * @description Generic panel for managing story elements
 * @module components/panels/ElementsPanel
 */

import React, { useState } from 'react';
import { useStory } from '@contexts/StoryContext';
import { PageTemplate, GridTemplate } from '@templates/PageTemplates';
import { TextField, TextArea, SelectField, FormRow, FormActions } from '@templates/FormFields';
import { ElementCard } from '@templates/CardTemplates';
import { Modal, ConfirmModal } from '@components/common/Modal';
import Icons from '@components/common/Icons';
import { ELEMENT_TYPES, getElementKey, CHARACTER_ROLES, LOCATION_TYPES, ARC_TYPES } from '@models/Element';

/**
 * Elements panel component
 * @param {Object} props - Component props
 * @param {string} props.type - Element type (character, location, etc.)
 */
export function ElementsPanel({ type }) {
  const { story, loading, createElement, updateElement, deleteElement } = useStory();
  
  const [showModal, setShowModal] = useState(false);
  const [editingElement, setEditingElement] = useState(null);
  const [formData, setFormData] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const [errors, setErrors] = useState([]);

  const config = ELEMENT_TYPES[type];
  const key = getElementKey(type);
  const elements = story?.elements?.[key] || [];

  if (loading || !story) {
    return <PageTemplate loading={loading} />;
  }

  if (!config) {
    return <PageTemplate error={`Unknown element type: ${type}`} />;
  }

  // Get role/type options based on element type
  const getRoleOptions = () => {
    switch (type) {
      case 'character':
      case 'antagonist':
        return CHARACTER_ROLES;
      case 'location':
        return LOCATION_TYPES;
      case 'arc':
        return ARC_TYPES;
      default:
        return [];
    }
  };

  const handleOpenModal = (element = null) => {
    setEditingElement(element);
    setFormData(element ? { ...element } : { name: '' });
    setErrors([]);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingElement(null);
    setFormData({});
    setErrors([]);
  };

  const handleFieldChange = (value, name) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    let result;
    
    if (editingElement) {
      result = updateElement(type, editingElement.id, formData);
    } else {
      result = createElement(type, formData);
    }

    if (result.errors.length > 0) {
      setErrors(result.errors);
    } else {
      handleCloseModal();
    }
  };

  const handleDelete = (id) => {
    deleteElement(type, id);
    setDeleteId(null);
  };

  const renderFormFields = () => {
    const roleOptions = getRoleOptions();

    return (
      <div className="space-y-4">
        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleFieldChange}
          required
          error={errors.includes('name is required') ? 'Name is required' : null}
        />

        {roleOptions.length > 0 && (
          <SelectField
            label={type === 'location' ? 'Type' : 'Role'}
            name={type === 'location' || type === 'arc' ? 'type' : 'role'}
            value={formData[type === 'location' || type === 'arc' ? 'type' : 'role']}
            onChange={handleFieldChange}
            options={roleOptions}
          />
        )}

        <TextArea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleFieldChange}
          placeholder={`Describe this ${config.label.toLowerCase()}...`}
        />

        {/* Type-specific fields */}
        {type === 'character' && (
          <>
            <TextArea
              label="Traits"
              name="traits"
              value={formData.traits}
              onChange={handleFieldChange}
              placeholder="Personality traits, quirks, characteristics..."
              rows={2}
            />
            <TextArea
              label="Goals"
              name="goals"
              value={formData.goals}
              onChange={handleFieldChange}
              placeholder="What does this character want?"
              rows={2}
            />
            <TextArea
              label="Backstory"
              name="backstory"
              value={formData.backstory}
              onChange={handleFieldChange}
              placeholder="Background and history..."
              rows={3}
            />
          </>
        )}

        {type === 'antagonist' && (
          <>
            <TextArea
              label="Motivation"
              name="motivation"
              value={formData.motivation}
              onChange={handleFieldChange}
              placeholder="What drives this antagonist?"
              rows={2}
            />
            <TextArea
              label="Methods"
              name="methods"
              value={formData.methods}
              onChange={handleFieldChange}
              placeholder="How do they oppose the protagonist?"
              rows={2}
            />
            <TextArea
              label="Weakness"
              name="weakness"
              value={formData.weakness}
              onChange={handleFieldChange}
              placeholder="What are their vulnerabilities?"
              rows={2}
            />
          </>
        )}

        {type === 'location' && (
          <>
            <TextArea
              label="Atmosphere"
              name="atmosphere"
              value={formData.atmosphere}
              onChange={handleFieldChange}
              placeholder="The mood and feel of this place..."
              rows={2}
            />
            <TextArea
              label="Significance"
              name="significance"
              value={formData.significance}
              onChange={handleFieldChange}
              placeholder="Why is this location important to the story?"
              rows={2}
            />
          </>
        )}

        {type === 'arc' && (
          <>
            <FormRow>
              <TextField
                label="Start Point"
                name="startPoint"
                value={formData.startPoint}
                onChange={handleFieldChange}
                placeholder="Where it begins..."
              />
              <TextField
                label="End Point"
                name="endPoint"
                value={formData.endPoint}
                onChange={handleFieldChange}
                placeholder="Where it leads..."
              />
            </FormRow>
            <TextArea
              label="Stakes"
              name="stakes"
              value={formData.stakes}
              onChange={handleFieldChange}
              placeholder="What's at risk?"
              rows={2}
            />
          </>
        )}

        {type === 'theme' && (
          <>
            <TextArea
              label="Manifestation"
              name="manifestation"
              value={formData.manifestation}
              onChange={handleFieldChange}
              placeholder="How does this theme appear in the story?"
              rows={2}
            />
            <TextArea
              label="Resolution"
              name="resolution"
              value={formData.resolution}
              onChange={handleFieldChange}
              placeholder="How is this theme resolved or evolved?"
              rows={2}
            />
          </>
        )}
      </div>
    );
  };

  return (
    <PageTemplate
      title={config.plural}
      actions={
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Icons.Plus size={16} />
          Add {config.label}
        </button>
      }
    >
      <GridTemplate emptyMessage={`No ${config.plural.toLowerCase()} yet. Add your first one!`}>
        {elements.map(element => (
          <ElementCard
            key={element.id}
            element={element}
            typeConfig={config}
            onEdit={handleOpenModal}
            onDelete={(id) => setDeleteId(id)}
          />
        ))}
      </GridTemplate>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingElement ? `Edit ${config.label}` : `Add ${config.label}`}
        size="lg"
      >
        {renderFormFields()}
        
        {errors.length > 0 && (
          <div className="mt-4 p-3 bg-sf-red/10 text-sf-red rounded-lg text-sm">
            {errors.join(', ')}
          </div>
        )}
        
        <FormActions>
          <button className="btn" onClick={handleCloseModal}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Icons.Check size={16} />
            {editingElement ? 'Save Changes' : `Add ${config.label}`}
          </button>
        </FormActions>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId)}
        title={`Delete ${config.label}`}
        message={`Are you sure you want to delete this ${config.label.toLowerCase()}? This will also remove any relationships.`}
        confirmText="Delete"
        danger
      />
    </PageTemplate>
  );
}

export default ElementsPanel;
