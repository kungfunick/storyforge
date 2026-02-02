/**
 * Export Panel
 * ============================================================================
 * 
 * @description Export story to various formats
 * @module components/panels/ExportPanel
 */

import React from 'react';
import { useStory } from '@contexts/StoryContext';
import { PageTemplate } from '@templates/PageTemplates';
import { ExportCard } from '@templates/CardTemplates';
import Icons from '@components/common/Icons';
import { ExportService } from '@services';
import { EXPORT_FORMATS } from '@utils/constants';

/**
 * Export panel component
 */
export function ExportPanel() {
  const { story, loading } = useStory();

  if (loading || !story) {
    return <PageTemplate loading={loading} />;
  }

  const handleExport = (format) => {
    ExportService.export(story, format);
  };

  // Calculate export stats
  const totalWords = story.chapters?.reduce((sum, ch) => {
    return sum + (ch.content?.split(/\s+/).filter(Boolean).length || 0);
  }, 0) || 0;

  const elementCount = Object.values(story.elements || {}).reduce(
    (sum, arr) => sum + arr.length, 0
  );

  return (
    <PageTemplate title="Export Story">
      {/* Story summary */}
      <div className="card p-4 mb-6">
        <h3 className="font-semibold text-sf-brown-800 mb-2">{story.title}</h3>
        <div className="flex flex-wrap gap-4 text-sm text-sf-brown-500">
          <span>{story.chapters?.length || 0} chapters</span>
          <span>•</span>
          <span>{totalWords.toLocaleString()} words</span>
          <span>•</span>
          <span>{elementCount} elements</span>
          <span>•</span>
          <span>{story.relationships?.length || 0} relationships</span>
        </div>
      </div>

      {/* Export options */}
      <h3 className="font-semibold text-sf-brown-700 mb-4">Choose Export Format</h3>
      
      <div className="space-y-3">
        {EXPORT_FORMATS.map(format => (
          <ExportCard
            key={format.id}
            format={format}
            onClick={() => handleExport(format.id)}
          />
        ))}
      </div>

      {/* Export notes */}
      <div className="mt-6 p-4 bg-sf-cream rounded-xl">
        <div className="flex items-start gap-3">
          <Icons.Info size={18} className="text-sf-brown-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-sf-brown-500">
            <p className="font-medium text-sf-brown-600 mb-1">Export Information</p>
            <ul className="space-y-1">
              <li>• <strong>Markdown</strong> - Best for documentation, GitHub, and text editors</li>
              <li>• <strong>Rich Text</strong> - Compatible with Microsoft Word and other word processors</li>
              <li>• <strong>PDF</strong> - Opens your browser's print dialog for saving as PDF</li>
            </ul>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}

export default ExportPanel;
