import { forwardRef, useId } from 'react';
import type { FormInputFieldProps } from '@/shared/types';

export const FormInputField = forwardRef<HTMLInputElement, FormInputFieldProps>(
  (
    {
      label,
      labelClassName = '',
      helperText,
      error,
      required = false,
      className = '',
      id,
      ...inputProps
    },
    ref,
  ) => {
    const reactId = useId();
    const inputId = id ?? reactId;

    return (
      <div>
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          {...inputProps}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
            error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
          } ${className}`}
        />
        {helperText && !error && (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);

FormInputField.displayName = 'FormInputField';
