import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn('flex flex-col gap-1', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-secondary-dark dark:text-gray-200"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-gray">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-4 py-2 border rounded-lg transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent',
              'bg-white dark:bg-gray-800',
              'text-secondary-dark dark:text-gray-200',
              'placeholder:text-secondary-gray',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error
                ? 'border-status-danger focus:ring-status-danger'
                : 'border-gray-300 dark:border-gray-600',
              props.disabled && 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-gray">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <span className="text-sm text-status-danger">{error}</span>
        )}

        {helperText && !error && (
          <span className="text-sm text-secondary-gray">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
