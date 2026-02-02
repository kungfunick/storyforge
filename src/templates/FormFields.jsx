/**
 * Form Field Templates
 * ============================================================================
 * 
 * @description Reusable form field components
 * @module templates/FormFields
 */

import React from 'react';

/**
 * Text input field
 */
export function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  hint,
  type = 'text',
  autoFocus = false,
}) {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-sf-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`form-input ${error ? 'form-input-error' : ''}`}
      />
      {error && <span className="form-error">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
}

/**
 * Textarea field
 */
export function TextArea({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  hint,
  rows = 4,
  maxLength,
}) {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-sf-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`form-textarea ${error ? 'form-input-error' : ''}`}
      />
      {maxLength && (
        <span className="form-hint text-right block">
          {(value || '').length}/{maxLength}
        </span>
      )}
      {error && <span className="form-error">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
}

/**
 * Select dropdown field
 */
export function SelectField({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  required = false,
  disabled = false,
  error,
  hint,
}) {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-sf-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`form-select ${error ? 'form-input-error' : ''}`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="form-error">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
}

/**
 * Checkbox field
 */
export function Checkbox({
  label,
  name,
  checked,
  onChange,
  disabled = false,
  error,
  hint,
}) {
  return (
    <div className="form-group">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name={name}
          checked={checked || false}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="form-checkbox"
        />
        <span className="form-label mb-0">{label}</span>
      </label>
      {error && <span className="form-error">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
}

/**
 * Form row for horizontal layout
 */
export function FormRow({ children, cols = 2 }) {
  const gridClass = {
    2: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    3: 'grid grid-cols-1 md:grid-cols-3 gap-4',
    4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
  };

  return <div className={gridClass[cols] || gridClass[2]}>{children}</div>;
}

/**
 * Form actions (buttons container)
 */
export function FormActions({ children, align = 'right' }) {
  const alignClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div className={`flex items-center gap-3 mt-6 ${alignClass[align]}`}>
      {children}
    </div>
  );
}

/**
 * Form section with title
 */
export function FormSection({ title, description, children }) {
  return (
    <div className="form-section mb-6">
      {title && <h3 className="text-lg font-semibold text-sf-brown-800 mb-1">{title}</h3>}
      {description && <p className="text-sm text-sf-brown-500 mb-4">{description}</p>}
      {children}
    </div>
  );
}

export default {
  TextField,
  TextArea,
  SelectField,
  Checkbox,
  FormRow,
  FormActions,
  FormSection,
};
