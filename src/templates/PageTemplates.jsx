/**
 * Page Templates
 * ============================================================================
 */

import React from 'react';

export function PageTemplate({ children, title, actions, loading, error }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sf-brown-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {(title || actions) && (
        <div className="page-header">
          {title && <h2 className="text-2xl font-display font-semibold">{title}</h2>}
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function PanelTemplate({ children, title, subtitle, actions, className = '' }) {
  return (
    <div className={`card ${className}`}>
      {(title || actions) && (
        <div className="card-header">
          <div>
            {title && <h3 className="font-display font-semibold text-lg">{title}</h3>}
            {subtitle && <p className="text-sm text-sf-brown-400 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
}

export function GridTemplate({ children, emptyMessage = 'No items yet' }) {
  const hasChildren = React.Children.count(children) > 0;

  if (!hasChildren) {
    return (
      <div className="empty-state py-12">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return <div className="content-grid">{children}</div>;
}

export default { PageTemplate, PanelTemplate, GridTemplate };
