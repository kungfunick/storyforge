/**
 * Export Service
 * ============================================================================
 * 
 * @description Handles document export operations
 * @module services/ExportService
 * 
 * Responsibilities:
 * - Convert story to Markdown format
 * - Convert story to RTF format
 * - Generate PDF via print dialog
 * - Trigger file downloads
 */

import { downloadFile } from '@utils/helpers';
import { ELEMENT_TYPES, getElementKey } from '@models/Element';

/**
 * Export Service
 * @description Generates exportable documents in various formats
 */
const ExportService = {
  /**
   * Exports story in specified format
   * @param {Object} story - Story data
   * @param {string} format - Export format ('markdown', 'rtf', 'pdf')
   */
  export(story, format) {
    switch (format) {
      case 'markdown':
        this.exportMarkdown(story);
        break;
      case 'rtf':
        this.exportRTF(story);
        break;
      case 'pdf':
        this.exportPDF(story);
        break;
      default:
        console.error(`Unknown export format: ${format}`);
    }
  },

  /**
   * Compiles story to Markdown format
   * @param {Object} story - Story data object
   * @returns {string} Markdown formatted text
   */
  toMarkdown(story) {
    const lines = [];
    
    // Title and metadata
    lines.push(`# ${story.title}`);
    lines.push('');
    
    if (story.genre || story.tone) {
      const meta = [];
      if (story.genre) meta.push(`**Genre:** ${story.genre}`);
      if (story.tone) meta.push(`**Tone:** ${story.tone}`);
      lines.push(meta.join(' | '));
      lines.push('');
    }

    // Synopsis
    if (story.synopsis) {
      lines.push('## Synopsis');
      lines.push('');
      lines.push(story.synopsis);
      lines.push('');
    }

    // Elements
    Object.keys(ELEMENT_TYPES).forEach(type => {
      const config = ELEMENT_TYPES[type];
      const key = getElementKey(type);
      const elements = story.elements[key] || [];

      if (elements.length > 0) {
        lines.push(`## ${config.plural}`);
        lines.push('');

        elements.forEach(el => {
          lines.push(`### ${el.name}`);
          
          if (el.role || el.type) {
            lines.push(`**${el.role || el.type}**`);
          }
          
          lines.push('');
          
          if (el.description) {
            lines.push(el.description);
            lines.push('');
          }

          // Type-specific fields
          this._addTypeSpecificMarkdown(lines, el, type);
          
          lines.push('');
        });
      }
    });

    // Chapters
    if (story.chapters?.length > 0) {
      lines.push('---');
      lines.push('');
      lines.push('# Story Content');
      lines.push('');

      story.chapters.forEach((ch, i) => {
        lines.push(`## Chapter ${i + 1}: ${ch.title}`);
        lines.push('');
        lines.push(ch.content || '*No content yet*');
        lines.push('');
      });
    }

    return lines.join('\n');
  },

  /**
   * Adds type-specific markdown content
   * @private
   */
  _addTypeSpecificMarkdown(lines, element, type) {
    switch (type) {
      case 'character':
        if (element.goals) lines.push(`**Goals:** ${element.goals}`, '');
        if (element.backstory) lines.push(`**Backstory:** ${element.backstory}`, '');
        break;
      case 'antagonist':
        if (element.motivation) lines.push(`**Motivation:** ${element.motivation}`, '');
        if (element.methods) lines.push(`**Methods:** ${element.methods}`, '');
        break;
      case 'arc':
        if (element.stakes) lines.push(`**Stakes:** ${element.stakes}`, '');
        break;
      case 'theme':
        if (element.manifestation) lines.push(`**Manifestation:** ${element.manifestation}`, '');
        break;
    }
  },

  /**
   * Exports story as Markdown file
   * @param {Object} story - Story data
   */
  exportMarkdown(story) {
    const markdown = this.toMarkdown(story);
    const filename = this._sanitizeFilename(story.title);
    downloadFile(markdown, `${filename}.md`, 'text/markdown');
  },

  /**
   * Exports story as RTF file
   * @param {Object} story - Story data
   */
  exportRTF(story) {
    const markdown = this.toMarkdown(story);
    const rtf = this._markdownToRTF(markdown);
    const filename = this._sanitizeFilename(story.title);
    downloadFile(rtf, `${filename}.rtf`, 'application/rtf');
  },

  /**
   * Converts Markdown to RTF format
   * @private
   * @param {string} markdown - Markdown content
   * @returns {string} RTF content
   */
  _markdownToRTF(markdown) {
    let rtf = '{\\rtf1\\ansi\\deff0\n';
    rtf += '{\\fonttbl{\\f0 Georgia;}{\\f1 Arial;}}\n';
    rtf += '\\f0\\fs24\n';

    const lines = markdown.split('\n');
    
    lines.forEach(line => {
      if (line.startsWith('# ')) {
        rtf += `\\f1\\fs48\\b ${this._escapeRTF(line.slice(2))}\\b0\\f0\\fs24\\par\\par\n`;
      } else if (line.startsWith('## ')) {
        rtf += `\\f1\\fs36\\b ${this._escapeRTF(line.slice(3))}\\b0\\f0\\fs24\\par\\par\n`;
      } else if (line.startsWith('### ')) {
        rtf += `\\f1\\fs28\\b ${this._escapeRTF(line.slice(4))}\\b0\\f0\\fs24\\par\\par\n`;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        rtf += `\\b ${this._escapeRTF(line.slice(2, -2))}\\b0\\par\n`;
      } else if (line.includes('**')) {
        // Handle inline bold
        let processed = line.replace(/\*\*(.+?)\*\*/g, '\\b $1\\b0 ');
        rtf += `${this._escapeRTF(processed)}\\par\n`;
      } else if (line === '---') {
        rtf += '\\par\\line\\par\n';
      } else if (line.trim() === '') {
        rtf += '\\par\n';
      } else {
        rtf += `${this._escapeRTF(line)}\\par\n`;
      }
    });

    rtf += '}';
    return rtf;
  },

  /**
   * Escapes special RTF characters
   * @private
   */
  _escapeRTF(text) {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}');
  },

  /**
   * Exports story as PDF (via print dialog)
   * @param {Object} story - Story data
   */
  exportPDF(story) {
    const markdown = this.toMarkdown(story);
    const html = this._markdownToHTML(markdown, story.title);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  },

  /**
   * Converts Markdown to HTML for PDF export
   * @private
   */
  _markdownToHTML(markdown, title) {
    let html = markdown
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^---$/gm, '<hr>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${title || 'Story'}</title>
          <style>
            body {
              font-family: Georgia, serif;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
              line-height: 1.7;
              color: #333;
            }
            h1 {
              font-size: 2.5em;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
              margin-bottom: 30px;
            }
            h2 {
              font-size: 1.8em;
              color: #444;
              margin-top: 40px;
            }
            h3 {
              font-size: 1.3em;
              color: #666;
            }
            hr {
              margin: 40px 0;
              border: none;
              border-top: 1px solid #ccc;
            }
            p {
              margin: 1em 0;
            }
            @media print {
              body { margin: 0; padding: 20px; }
            }
          </style>
        </head>
        <body>
          <p>${html}</p>
        </body>
      </html>
    `;
  },

  /**
   * Sanitizes filename for download
   * @private
   */
  _sanitizeFilename(name) {
    return (name || 'story')
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },
};

export default ExportService;
