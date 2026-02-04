/**
 * Rich Text Editor Component
 * ============================================================================
 * 
 * @description Word processor-style editor with formatting toolbar
 * @module components/common/RichTextEditor
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import Icons from './Icons';

/**
 * Toolbar button component
 */
function ToolbarButton({ icon: Icon, label, active, onClick, disabled }) {
  return (
    <button
      type="button"
      className={`toolbar-btn ${active ? 'active' : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
    >
      {typeof Icon === 'string' ? Icon : <Icon size={16} />}
    </button>
  );
}

/**
 * Toolbar select component
 */
function ToolbarSelect({ value, onChange, options, label, width = 'auto' }) {
  return (
    <select
      className="toolbar-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      title={label}
      style={{ width }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

/**
 * Toolbar divider
 */
function ToolbarDivider() {
  return <div className="toolbar-divider" />;
}

/**
 * Font options
 */
const FONT_FAMILIES = [
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Palatino Linotype, serif', label: 'Palatino' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Lucida Console, monospace', label: 'Lucida Console' },
];

const FONT_SIZES = [
  { value: '1', label: '10' },
  { value: '2', label: '12' },
  { value: '3', label: '14' },
  { value: '4', label: '16' },
  { value: '5', label: '18' },
  { value: '6', label: '24' },
  { value: '7', label: '32' },
];

const HEADING_OPTIONS = [
  { value: 'p', label: 'Paragraph' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
  { value: 'h4', label: 'Heading 4' },
  { value: 'blockquote', label: 'Quote' },
];

/**
 * Rich Text Editor component
 */
export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  className = '',
  minHeight = '400px',
}) {
  const editorRef = useRef(null);
  const [activeFormats, setActiveFormats] = useState({});
  const [currentFont, setCurrentFont] = useState('Georgia, serif');
  const [currentSize, setCurrentSize] = useState('4');
  const [currentBlock, setCurrentBlock] = useState('p');

  // Initialize content
  useEffect(() => {
    if (editorRef.current && content !== undefined) {
      // Only set if different to avoid cursor jump
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content || '';
      }
    }
  }, [content]);

  // Execute formatting command
  const execCommand = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateActiveFormats();
  }, []);

  // Update active format states based on selection
  const updateActiveFormats = useCallback(() => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
      justifyFull: document.queryCommandState('justifyFull'),
    });

    // Get current font
    const fontName = document.queryCommandValue('fontName');
    if (fontName) {
      const matchedFont = FONT_FAMILIES.find(f => 
        f.value.toLowerCase().includes(fontName.toLowerCase().replace(/"/g, ''))
      );
      if (matchedFont) setCurrentFont(matchedFont.value);
    }

    // Get current size
    const fontSize = document.queryCommandValue('fontSize');
    if (fontSize) setCurrentSize(fontSize);

    // Get current block format
    const block = document.queryCommandValue('formatBlock');
    if (block) setCurrentBlock(block.toLowerCase().replace(/[<>]/g, ''));
  }, []);

  // Handle content change
  const handleInput = useCallback(() => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
    updateActiveFormats();
  }, [onChange, updateActiveFormats]);

  // Handle selection change
  useEffect(() => {
    const handleSelectionChange = () => {
      if (editorRef.current?.contains(document.activeElement)) {
        updateActiveFormats();
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [updateActiveFormats]);

  // Format block (headings, paragraph, quote)
  const formatBlock = useCallback((tag) => {
    if (tag === 'p') {
      execCommand('formatBlock', '<p>');
    } else if (tag === 'blockquote') {
      execCommand('formatBlock', '<blockquote>');
    } else {
      execCommand('formatBlock', `<${tag}>`);
    }
    setCurrentBlock(tag);
  }, [execCommand]);

  // Change font family
  const changeFont = useCallback((font) => {
    execCommand('fontName', font);
    setCurrentFont(font);
  }, [execCommand]);

  // Change font size
  const changeSize = useCallback((size) => {
    execCommand('fontSize', size);
    setCurrentSize(size);
  }, [execCommand]);

  // Insert horizontal rule
  const insertHR = useCallback(() => {
    execCommand('insertHorizontalRule');
  }, [execCommand]);

  // Clear formatting
  const clearFormatting = useCallback(() => {
    execCommand('removeFormat');
  }, [execCommand]);

  // Handle paste - strip formatting option
  const handlePaste = useCallback((e) => {
    // Allow rich paste by default, could add option for plain text
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case '1':
          if (e.altKey) {
            e.preventDefault();
            formatBlock('h1');
          }
          break;
        case '2':
          if (e.altKey) {
            e.preventDefault();
            formatBlock('h2');
          }
          break;
        case '3':
          if (e.altKey) {
            e.preventDefault();
            formatBlock('h3');
          }
          break;
      }
    }
  }, [execCommand, formatBlock]);

  return (
    <div className={`rich-editor ${className}`}>
      {/* Toolbar */}
      <div className="rich-editor-toolbar">
        {/* Block format */}
        <ToolbarSelect
          value={currentBlock}
          onChange={formatBlock}
          options={HEADING_OPTIONS}
          label="Text style"
          width="110px"
        />

        <ToolbarDivider />

        {/* Font family */}
        <ToolbarSelect
          value={currentFont}
          onChange={changeFont}
          options={FONT_FAMILIES}
          label="Font"
          width="120px"
        />

        {/* Font size */}
        <ToolbarSelect
          value={currentSize}
          onChange={changeSize}
          options={FONT_SIZES}
          label="Size"
          width="60px"
        />

        <ToolbarDivider />

        {/* Text formatting */}
        <ToolbarButton
          icon={Icons.Bold || (() => <strong>B</strong>)}
          label="Bold (Ctrl+B)"
          active={activeFormats.bold}
          onClick={() => execCommand('bold')}
        />
        <ToolbarButton
          icon={() => <em style={{ fontFamily: 'serif' }}>I</em>}
          label="Italic (Ctrl+I)"
          active={activeFormats.italic}
          onClick={() => execCommand('italic')}
        />
        <ToolbarButton
          icon={() => <span style={{ textDecoration: 'underline' }}>U</span>}
          label="Underline (Ctrl+U)"
          active={activeFormats.underline}
          onClick={() => execCommand('underline')}
        />
        <ToolbarButton
          icon={() => <span style={{ textDecoration: 'line-through' }}>S</span>}
          label="Strikethrough"
          active={activeFormats.strikeThrough}
          onClick={() => execCommand('strikeThrough')}
        />

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton
          icon={() => <span style={{ fontSize: '12px' }}>≡</span>}
          label="Align left"
          active={activeFormats.justifyLeft}
          onClick={() => execCommand('justifyLeft')}
        />
        <ToolbarButton
          icon={() => <span style={{ fontSize: '12px' }}>≡</span>}
          label="Align center"
          active={activeFormats.justifyCenter}
          onClick={() => execCommand('justifyCenter')}
        />
        <ToolbarButton
          icon={() => <span style={{ fontSize: '12px' }}>≡</span>}
          label="Align right"
          active={activeFormats.justifyRight}
          onClick={() => execCommand('justifyRight')}
        />
        <ToolbarButton
          icon={() => <span style={{ fontSize: '12px' }}>≡</span>}
          label="Justify"
          active={activeFormats.justifyFull}
          onClick={() => execCommand('justifyFull')}
        />

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          icon={() => <span style={{ fontSize: '14px' }}>•—</span>}
          label="Bullet list"
          active={activeFormats.insertUnorderedList}
          onClick={() => execCommand('insertUnorderedList')}
        />
        <ToolbarButton
          icon={() => <span style={{ fontSize: '14px' }}>1.</span>}
          label="Numbered list"
          active={activeFormats.insertOrderedList}
          onClick={() => execCommand('insertOrderedList')}
        />

        <ToolbarDivider />

        {/* Indentation */}
        <ToolbarButton
          icon={() => <span style={{ fontSize: '12px' }}>⇤</span>}
          label="Decrease indent"
          onClick={() => execCommand('outdent')}
        />
        <ToolbarButton
          icon={() => <span style={{ fontSize: '12px' }}>⇥</span>}
          label="Increase indent"
          onClick={() => execCommand('indent')}
        />

        <ToolbarDivider />

        {/* Extra */}
        <ToolbarButton
          icon={() => <span style={{ fontSize: '12px' }}>—</span>}
          label="Horizontal line"
          onClick={insertHR}
        />
        <ToolbarButton
          icon={Icons.RotateCcw}
          label="Clear formatting"
          onClick={clearFormatting}
        />
      </div>

      {/* Editor content area */}
      <div
        ref={editorRef}
        className="rich-editor-content scrollbar-thin"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onFocus={updateActiveFormats}
        style={{ minHeight }}
        data-placeholder={placeholder}
      />
    </div>
  );
}

// Add Bold icon if not present
if (!Icons.Bold) {
  Icons.Bold = (props) => (
    <svg width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
    </svg>
  );
}

export default RichTextEditor;