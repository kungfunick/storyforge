/**
 * Modal Component
 * ============================================================================
 * 
 * @description Reusable modal dialog component
 * @module components/common/Modal
 */

import React, { useEffect, useCallback } from 'react';
import Icons from './Icons';

/**
 * Modal dialog component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Modal visibility state
 * @param {Function} props.onClose - Close handler
 * @param {string} [props.title] - Modal title
 * @param {string} [props.size='md'] - Modal size (sm, md, lg, xl)
 * @param {React.ReactNode} props.children - Modal content
 * @param {React.ReactNode} [props.footer] - Footer content
 */
export function Modal({ isOpen, onClose, title, size = 'md', children, footer }) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const sizeClass = {
    sm: 'modal-sm',
    md: 'modal-md',
    lg: 'modal-lg',
    xl: 'modal-xl',
  }[size] || 'modal-md';

  return (
    <div 
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`modal-content ${sizeClass}`}>
        {title && (
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <button 
              className="btn-icon"
              onClick={onClose}
              aria-label="Close"
            >
              <Icons.X size={20} />
            </button>
          </div>
        )}
        
        <div className="modal-body">
          {children}
        </div>

        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Confirm modal for dangerous actions
 * @param {Object} props - Component props
 */
export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm', 
  message, 
  confirmText = 'Confirm',
  danger = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sf-brown-600 mb-4">{message}</p>
      <div className="flex justify-end gap-3">
        <button className="btn" onClick={onClose}>
          Cancel
        </button>
        <button 
          className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
          onClick={() => { onConfirm(); onClose(); }}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}

export default Modal;
