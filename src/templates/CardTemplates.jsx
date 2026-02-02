/**
 * Card Templates
 * ============================================================================
 * 
 * @description Template components for card displays
 * @module templates/CardTemplates
 */

import React from 'react';
import Icons from '@components/common/Icons';

/**
 * Get initials from name
 */
function getInitials(name, count = 2) {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, count)
    .map((word) => word[0]?.toUpperCase() || '')
    .join('');
}

/**
 * Truncate text
 */
function truncate(text, length = 100) {
  if (!text || text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

/**
 * Element card template
 */
export function ElementCard({ 
  element, 
  typeConfig,
  onEdit, 
  onDelete,
  onDragStart,
  draggable = true,
}) {
  const IconComponent = Icons[typeConfig?.icon] || Icons.FileText;

  return (
    <div 
      className="card hover:shadow-lg transition-shadow cursor-pointer"
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, element)}
    >
      <div className="p-4 flex gap-4">
        <div 
          className="icon-square flex-shrink-0"
          style={{ backgroundColor: typeConfig?.color || '#8B7355' }}
        >
          <IconComponent size={18} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sf-brown-800 truncate">
            {element.name || 'Unnamed'}
          </h4>
          <span className="text-xs text-sf-brown-400 uppercase tracking-wide">
            {element.role || element.type || typeConfig?.label}
          </span>
          {element.description && (
            <p className="text-sm text-sf-brown-500 mt-2 line-clamp-2">
              {truncate(element.description, 120)}
            </p>
          )}
        </div>

        <div className="flex items-start gap-1">
          <button 
            className="btn-icon"
            onClick={(e) => { e.stopPropagation(); onEdit?.(element); }}
            title="Edit"
          >
            <Icons.Edit size={16} />
          </button>
          <button 
            className="btn-icon btn-icon-danger"
            onClick={(e) => { e.stopPropagation(); onDelete?.(element.id); }}
            title="Delete"
          >
            <Icons.Trash size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Stat card template
 */
export function StatCard({ label, value, icon, color, onClick }) {
  const IconComponent = Icons[icon] || Icons.FileText;

  return (
    <div 
      className="stat-card"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <div 
        className="icon-square mx-auto mb-3"
        style={{ backgroundColor: color || '#6B7DB3' }}
      >
        <IconComponent size={18} />
      </div>
      <span className="block text-2xl font-bold text-sf-brown-800">
        {value}
      </span>
      <span className="text-sm text-sf-brown-400">
        {label}
      </span>
    </div>
  );
}

/**
 * AI continuation option card
 */
export function ContinuationCard({ option, index, onSelect, isLoading = false }) {
  const impactColors = {
    high: 'badge-danger',
    medium: 'badge-warning',
    low: 'badge-success',
  };

  return (
    <div className="continuation-option">
      <div className="flex items-center gap-3 mb-3">
        <span className="option-number">{index + 1}</span>
        <h4 className="flex-1 font-semibold text-sf-brown-800">{option.title}</h4>
        <span className={`badge ${impactColors[option.impact] || 'badge-default'}`}>
          {option.impact}
        </span>
      </div>
      
      <p className="text-sm text-sf-brown-600 mb-3">{option.preview}</p>
      
      <div className="flex items-center justify-between">
        <span className="badge badge-purple">{option.tone}</span>
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => onSelect(option)}
          disabled={isLoading}
        >
          {isLoading ? (
            <Icons.Loader size={14} className="animate-spin" />
          ) : (
            <Icons.Check size={14} />
          )}
          Select
        </button>
      </div>
    </div>
  );
}

/**
 * Version card template
 */
export function VersionCard({ version, onRestore, isCurrent = false }) {
  return (
    <div className={`card p-4 ${isCurrent ? 'border-sf-accent border-2' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold">
          v{version.version}
          {isCurrent && <span className="badge badge-primary ml-2">Current</span>}
        </span>
        <span className="text-sm text-sf-brown-400">
          {new Date(version.timestamp).toLocaleString()}
        </span>
      </div>
      <p className="text-sm text-sf-brown-600 mb-3">
        {version.summary || 'No summary'}
      </p>
      {!isCurrent && (
        <button 
          className="btn btn-sm w-full"
          onClick={() => onRestore(version)}
        >
          <Icons.RotateCcw size={14} />
          Restore
        </button>
      )}
    </div>
  );
}

/**
 * Export option card
 */
export function ExportCard({ format, onClick, isLoading = false }) {
  return (
    <button 
      className="export-btn" 
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Icons.Loader size={24} className="animate-spin text-sf-brown-500" />
      ) : (
        <Icons.FileText size={24} className="text-sf-brown-500" />
      )}
      <div>
        <span className="font-medium text-sf-brown-800">{format.label}</span>
        <small className="block text-sm text-sf-brown-400">{format.description}</small>
      </div>
    </button>
  );
}

/**
 * Relationship node card (for relationship editor)
 */
export function RelationshipNode({ 
  element, 
  position, 
  typeConfig,
  isDropTarget,
  isDragging,
  isSelected,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
}) {
  return (
    <div
      className={`relationship-node ${isDragging ? 'dragging' : ''} ${isDropTarget ? 'drop-target' : ''} ${isSelected ? 'selected' : ''}`}
      style={{ left: position.x - 40, top: position.y - 40 }}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
    >
      <div 
        className="node-avatar"
        style={{ backgroundColor: typeConfig?.color || '#8B7355' }}
      >
        {getInitials(element.name, 1)}
      </div>
      <span className="node-label">{element.name}</span>
    </div>
  );
}

/**
 * Chapter card template
 */
export function ChapterCard({ 
  chapter, 
  index, 
  isActive,
  onClick,
  onDelete,
}) {
  return (
    <div 
      className={`card p-3 cursor-pointer transition-all ${isActive ? 'ring-2 ring-sf-accent bg-sf-cream' : 'hover:bg-sf-brown-50'}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <span className="text-xs text-sf-brown-400 uppercase">Chapter {index + 1}</span>
          <h4 className="font-medium text-sf-brown-800 truncate">
            {chapter.title || 'Untitled Chapter'}
          </h4>
        </div>
        {onDelete && (
          <button 
            className="btn-icon btn-icon-danger opacity-0 group-hover:opacity-100"
            onClick={(e) => { e.stopPropagation(); onDelete(chapter.id); }}
          >
            <Icons.Trash size={14} />
          </button>
        )}
      </div>
      {chapter.content && (
        <p className="text-sm text-sf-brown-500 mt-2 line-clamp-2">
          {truncate(chapter.content, 100)}
        </p>
      )}
    </div>
  );
}

export default {
  ElementCard,
  StatCard,
  ContinuationCard,
  VersionCard,
  ExportCard,
  RelationshipNode,
  ChapterCard,
};
