/**
 * Sidebar Component
 * ============================================================================
 * 
 * @description Main navigation sidebar - slides from right, overlays content
 * @module components/common/Sidebar
 */

import React from 'react';
import Icons from './Icons';
import { ELEMENT_TYPES } from '@models/Element';

/**
 * Sidebar navigation component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Mobile sidebar open state
 * @param {Function} props.onClose - Close handler for mobile
 * @param {string} props.currentView - Current active view
 * @param {Function} props.onNavigate - Navigation handler
 * @param {string} props.storyTitle - Story title for header
 * @param {Function} props.onNewStory - New story handler
 */
export function Sidebar({ 
  isOpen, 
  onClose, 
  currentView, 
  onNavigate,
  storyTitle,
  onNewStory,
}) {
  const navItems = [
    { section: null, items: [
      { id: 'overview', label: 'Overview', icon: 'Home' },
      { id: 'editor', label: 'Editor', icon: 'Edit' },
    ]},
    { section: 'Elements', items: [
      { id: 'character', label: 'Characters', icon: 'User' },
      { id: 'antagonist', label: 'Antagonists', icon: 'Skull' },
      { id: 'location', label: 'Locations', icon: 'MapPin' },
      { id: 'arc', label: 'Story Arcs', icon: 'TrendingUp' },
      { id: 'theme', label: 'Themes', icon: 'Feather' },
    ]},
    { section: 'Tools', items: [
      { id: 'relationships', label: 'Relationships', icon: 'Link' },
      { id: 'versions', label: 'Versions', icon: 'Clock' },
      { id: 'export', label: 'Export', icon: 'Download' },
    ]},
  ];

  const handleNavigate = (view) => {
    onNavigate(view);
    onClose?.();
  };

  return (
    <>
      {/* Overlay - closes sidebar when clicking outside */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      {/* Sidebar - slides from right */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Close button */}
        <button 
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close menu"
        >
          <Icons.X size={24} />
        </button>

        <div className="sidebar-header">
          <Icons.Book size={28} className="text-sf-purple" />
          <span className="sidebar-logo">StoryForge</span>
        </div>

        {/* Story info */}
        <div className="px-4 py-3 border-b border-sf-brown-700">
          <p className="text-sm text-sf-brown-400 truncate">
            {storyTitle || 'No story loaded'}
          </p>
          <button 
            className="text-xs text-sf-accent hover:text-sf-purple mt-1"
            onClick={onNewStory}
          >
            + New Story
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((group, gi) => (
            <div key={gi}>
              {group.section && (
                <div className="sidebar-section">{group.section}</div>
              )}
              {group.items.map((item) => {
                const IconComponent = Icons[item.icon] || Icons.FileText;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavigate(item.id)}
                  >
                    <IconComponent size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button 
            className="sidebar-item w-full"
            onClick={() => handleNavigate('settings')}
          >
            <Icons.Settings size={18} />
            <span>Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
}

/**
 * Mobile header with menu button
 * @param {Object} props - Component props
 */
export function MobileHeader({ onOpenSidebar, storyTitle }) {
  return (
    <header className="mobile-header">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Icons.Book size={20} className="text-sf-purple flex-shrink-0" />
        <span className="font-display font-semibold truncate">
          {storyTitle || 'StoryForge'}
        </span>
      </div>
      <button 
        className="btn-icon"
        onClick={onOpenSidebar}
        aria-label="Open menu"
      >
        <Icons.Menu size={24} />
      </button>
    </header>
  );
}

export default Sidebar;