/**
 * StoryForge App
 * ============================================================================
 * 
 * @description Main application component
 * @module App
 */

import React, { useState } from 'react';
import { StoryProvider, useStory } from '@contexts/StoryContext';
import { Sidebar, MobileHeader, Modal } from '@components/common';
import {
  OverviewPanel,
  ElementsPanel,
  EditorPanel,
  RelationshipsPanel,
  VersionsPanel,
  ExportPanel,
  StoryGenerator,
} from '@components/panels';

/**
 * Main application layout
 */
function AppLayout() {
  const { story, loading } = useStory();
  
  const [currentView, setCurrentView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);

  // Show generator if no story loaded
  const needsStory = !loading && !story;

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const handleNewStory = () => {
    setShowGenerator(true);
  };

  const renderContent = () => {
    // Element panels
    if (['character', 'antagonist', 'location', 'arc', 'theme'].includes(currentView)) {
      return <ElementsPanel type={currentView} />;
    }

    // Other panels
    switch (currentView) {
      case 'overview':
        return <OverviewPanel onNavigate={handleNavigate} />;
      case 'editor':
        return <EditorPanel />;
      case 'relationships':
        return <RelationshipsPanel />;
      case 'versions':
        return <VersionsPanel />;
      case 'export':
        return <ExportPanel />;
      default:
        return <OverviewPanel onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="app-container">
      {/* Mobile header */}
      <MobileHeader 
        onOpenSidebar={() => setSidebarOpen(true)}
        storyTitle={story?.title}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentView={currentView}
        onNavigate={handleNavigate}
        storyTitle={story?.title}
        onNewStory={handleNewStory}
      />

      {/* Main content */}
      <main className="main-content md:ml-72 lg:ml-80">
        {needsStory || showGenerator ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <StoryGenerator onClose={() => setShowGenerator(false)} />
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="spinner mx-auto mb-4" />
              <p className="text-sf-brown-500">Loading your story...</p>
            </div>
          </div>
        ) : (
          renderContent()
        )}
      </main>
    </div>
  );
}

/**
 * App with providers
 */
function App() {
  return (
    <StoryProvider>
      <AppLayout />
    </StoryProvider>
  );
}

export default App;
