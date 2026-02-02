/**
 * Relationships Panel
 * ============================================================================
 * 
 * @description Visual relationship editor with drag-and-drop
 * @module components/panels/RelationshipsPanel
 */

import React, { useState, useRef, useEffect } from 'react';
import { useStory } from '@contexts/StoryContext';
import { PageTemplate } from '@templates/PageTemplates';
import { Modal } from '@components/common/Modal';
import { SelectField } from '@templates/FormFields';
import Icons from '@components/common/Icons';
import { ELEMENT_TYPES, getElementKey } from '@models/Element';
import { RELATIONSHIP_TYPES, getRelationshipType } from '@models/Relationship';
import { getInitials } from '@utils/helpers';
import { ElementController } from '@controllers';

/**
 * Relationships panel component
 */
export function RelationshipsPanel() {
  const { story, loading, createRelationship, deleteRelationship } = useStory();
  
  const canvasRef = useRef(null);
  const [nodePositions, setNodePositions] = useState({});
  const [draggingNode, setDraggingNode] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [pendingRelationship, setPendingRelationship] = useState(null);
  const [selectedType, setSelectedType] = useState('ally');

  // Get all elements flattened
  const allElements = story ? ElementController.getAllFlat(story) : [];
  const relationships = story?.relationships || [];

  // Initialize positions for new elements
  useEffect(() => {
    if (!canvasRef.current || allElements.length === 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(rect.width, rect.height) * 0.35;

    const newPositions = { ...nodePositions };
    let needsUpdate = false;

    allElements.forEach((el, i) => {
      if (!newPositions[el.id]) {
        // Arrange in a circle
        const angle = (2 * Math.PI * i) / allElements.length - Math.PI / 2;
        newPositions[el.id] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      setNodePositions(newPositions);
    }
  }, [allElements.length]);

  if (loading || !story) {
    return <PageTemplate loading={loading} />;
  }

  // Handle node drag start
  const handleDragStart = (e, element) => {
    setDraggingNode(element);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', element.id);
  };

  // Handle drag over node (for creating relationships)
  const handleDragOver = (e, element) => {
    e.preventDefault();
    if (draggingNode && draggingNode.id !== element.id) {
      setDropTarget(element);
    }
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setDropTarget(null);
  };

  // Handle drop on node (create relationship)
  const handleDropOnNode = (e, targetElement) => {
    e.preventDefault();
    if (draggingNode && draggingNode.id !== targetElement.id) {
      // Check if relationship already exists
      const exists = relationships.some(r =>
        (r.sourceId === draggingNode.id && r.targetId === targetElement.id) ||
        (r.sourceId === targetElement.id && r.targetId === draggingNode.id)
      );

      if (!exists) {
        setPendingRelationship({
          source: draggingNode,
          target: targetElement,
        });
        setShowTypeModal(true);
      }
    }
    setDraggingNode(null);
    setDropTarget(null);
  };

  // Handle drop on canvas (move node)
  const handleDropOnCanvas = (e) => {
    if (!draggingNode || dropTarget) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNodePositions(prev => ({
      ...prev,
      [draggingNode.id]: { x, y },
    }));

    setDraggingNode(null);
  };

  // Create relationship
  const handleCreateRelationship = () => {
    if (!pendingRelationship) return;

    createRelationship({
      sourceId: pendingRelationship.source.id,
      targetId: pendingRelationship.target.id,
      type: selectedType,
    });

    setShowTypeModal(false);
    setPendingRelationship(null);
    setSelectedType('ally');
  };

  // Delete relationship
  const handleDeleteRelationship = (relId) => {
    deleteRelationship(relId);
  };

  // Render relationship line
  const renderLine = (relationship) => {
    const sourcePos = nodePositions[relationship.sourceId];
    const targetPos = nodePositions[relationship.targetId];
    
    if (!sourcePos || !targetPos) return null;

    const relType = getRelationshipType(relationship.type);
    const midX = (sourcePos.x + targetPos.x) / 2;
    const midY = (sourcePos.y + targetPos.y) / 2;

    const strokeStyle = relType?.lineStyle === 'dashed' 
      ? '8,4' 
      : relType?.lineStyle === 'dotted' 
        ? '2,4' 
        : '';

    return (
      <g key={relationship.id} className="relationship-line">
        <line
          x1={sourcePos.x}
          y1={sourcePos.y}
          x2={targetPos.x}
          y2={targetPos.y}
          stroke={relType?.color || '#8B7355'}
          strokeWidth="2"
          strokeDasharray={strokeStyle}
        />
        {/* Delete zone at midpoint */}
        <g 
          className="delete-zone"
          onClick={() => handleDeleteRelationship(relationship.id)}
        >
          <circle
            cx={midX}
            cy={midY}
            r="12"
            fill="white"
            stroke={relType?.color || '#8B7355'}
            strokeWidth="2"
          />
          <text
            x={midX}
            y={midY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill={relType?.color || '#8B7355'}
          >
            ✕
          </text>
        </g>
        {/* Label */}
        <text
          x={midX}
          y={midY - 18}
          textAnchor="middle"
          fontSize="11"
          fill="#6B5D4D"
          className="pointer-events-none"
        >
          {relType?.label || relationship.type}
        </text>
      </g>
    );
  };

  return (
    <PageTemplate title="Relationships">
      {allElements.length === 0 ? (
        <div className="empty-state py-16">
          <Icons.Link size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-sf-brown-500">
            Add some elements first to create relationships
          </p>
        </div>
      ) : (
        <>
          {/* Instructions */}
          <p className="text-sm text-sf-brown-500 mb-4">
            Drag one element onto another to create a relationship. Click the × on a connection to delete it.
          </p>

          {/* Canvas */}
          <div 
            ref={canvasRef}
            className="relationship-canvas rounded-xl border border-sf-brown-200"
            style={{ height: '500px' }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropOnCanvas}
          >
            {/* SVG for lines */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ pointerEvents: 'all' }}
            >
              {relationships.map(renderLine)}
            </svg>

            {/* Nodes */}
            {allElements.map(element => {
              const pos = nodePositions[element.id] || { x: 100, y: 100 };
              const isDropping = dropTarget?.id === element.id;
              const isDragging = draggingNode?.id === element.id;

              return (
                <div
                  key={element.id}
                  className={`relationship-node ${isDragging ? 'dragging' : ''} ${isDropping ? 'drop-target' : ''}`}
                  style={{ 
                    left: pos.x - 30, 
                    top: pos.y - 30,
                    transform: isDropping ? 'scale(1.15)' : 'scale(1)',
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, element)}
                  onDragOver={(e) => handleDragOver(e, element)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDropOnNode(e, element)}
                >
                  <div 
                    className="node-avatar"
                    style={{ backgroundColor: element.typeConfig?.color || '#8B7355' }}
                  >
                    {getInitials(element.name, 1)}
                  </div>
                  <span className="node-label">{element.name}</span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3">
            {RELATIONSHIP_TYPES.map(rt => (
              <div key={rt.id} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-4 h-1 rounded"
                  style={{ 
                    backgroundColor: rt.color,
                    borderStyle: rt.lineStyle === 'dashed' ? 'dashed' : 'solid',
                  }}
                />
                <span className="text-sf-brown-500">{rt.label}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Relationship type modal */}
      <Modal
        isOpen={showTypeModal}
        onClose={() => {
          setShowTypeModal(false);
          setPendingRelationship(null);
        }}
        title="Create Relationship"
        size="sm"
      >
        {pendingRelationship && (
          <>
            <p className="text-sm text-sf-brown-600 mb-4">
              Connect <strong>{pendingRelationship.source.name}</strong> to{' '}
              <strong>{pendingRelationship.target.name}</strong>
            </p>

            <SelectField
              label="Relationship Type"
              name="type"
              value={selectedType}
              onChange={(val) => setSelectedType(val)}
              options={RELATIONSHIP_TYPES}
            />

            <div className="flex justify-end gap-3 mt-6">
              <button 
                className="btn" 
                onClick={() => {
                  setShowTypeModal(false);
                  setPendingRelationship(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreateRelationship}
              >
                <Icons.Link size={16} />
                Create
              </button>
            </div>
          </>
        )}
      </Modal>
    </PageTemplate>
  );
}

export default RelationshipsPanel;
