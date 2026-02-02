/**
 * Versions Panel
 * ============================================================================
 * 
 * @description Version history management
 * @module components/panels/VersionsPanel
 */

import React from 'react';
import { useStory } from '@contexts/StoryContext';
import { PageTemplate, GridTemplate } from '@templates/PageTemplates';
import { VersionCard } from '@templates/CardTemplates';
import Icons from '@components/common/Icons';
import { formatTimestamp } from '@utils/helpers';

/**
 * Versions panel component
 */
export function VersionsPanel() {
  const { story, loading, createVersion } = useStory();

  if (loading || !story) {
    return <PageTemplate loading={loading} />;
  }

  const versions = story.versions || [];
  const currentVersion = story.currentVersion || 1;

  const handleCreateVersion = () => {
    const summary = prompt('Enter a summary for this version:');
    if (summary) {
      createVersion(summary);
    }
  };

  const handleRestore = (version) => {
    // In a full implementation, this would restore the full story state
    alert(`Version restore coming soon! Would restore to v${version.version}`);
  };

  return (
    <PageTemplate
      title="Version History"
      actions={
        <button className="btn btn-primary" onClick={handleCreateVersion}>
          <Icons.Save size={16} />
          Save Version
        </button>
      }
    >
      {/* Current version info */}
      <div className="card p-4 mb-6 bg-sf-accent/5 border-sf-accent">
        <div className="flex items-center gap-3">
          <div className="icon-square bg-sf-accent">
            <Icons.Check size={18} />
          </div>
          <div>
            <span className="font-semibold text-sf-brown-800">
              Current: Version {currentVersion}
            </span>
            <p className="text-sm text-sf-brown-500">
              Last saved: {formatTimestamp(story.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Version history */}
      <h3 className="font-semibold text-sf-brown-700 mb-4">Previous Versions</h3>
      
      {versions.length === 0 ? (
        <div className="empty-state py-12">
          <Icons.Clock size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-sf-brown-500">No previous versions saved yet</p>
          <p className="text-sm text-sf-brown-400 mt-2">
            Versions are created automatically when using AI continuations
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {versions.slice().reverse().map(version => (
            <VersionCard
              key={version.id}
              version={version}
              onRestore={handleRestore}
            />
          ))}
        </div>
      )}

      {/* Info note */}
      <div className="mt-6 p-4 bg-sf-cream rounded-xl">
        <div className="flex items-start gap-3">
          <Icons.Info size={18} className="text-sf-brown-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-sf-brown-500">
            <p className="font-medium text-sf-brown-600 mb-1">About Versions</p>
            <p>
              StoryForge automatically saves a version snapshot before applying AI-generated 
              changes. Up to 3 previous versions are retained. You can also manually save 
              versions using the button above.
            </p>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}

export default VersionsPanel;
