import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext.jsx';

const Input = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  className = '',
  id,
  ...props
}) => {
  const { currentTheme } = useTheme();
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const baseClasses = 'form-input';
  const errorClasses = error ? 'error' : '';
  const classes = [baseClasses, errorClasses, className].filter(Boolean).join(' ');

  const inputElement = (
    <input
      type={type}
      id={inputId}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      className={classes}
      aria-invalid={error ? 'true' : 'false'}
      aria-describedby={error ? `${inputId}-error` : undefined}
      {...props}
    />
  );

  if (label) {
    return (
      <div className="form-group">
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="required" aria-label="required">*</span>}
        </label>
        {inputElement}
        {error && (
          <div id={`${inputId}-error`} className="form-error" role="alert">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {inputElement}
      {error && (
        <div id={`${inputId}-error`} className="form-error" role="alert">
          {error}
        </div>
      )}
    </>
  );
};

Input.propTypes = {
  type: PropTypes.oneOf([
    'text', 'email', 'tel', 'password', 'number', 'date', 'time', 'url'
  ]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
  id: PropTypes.string
};

export default Input;