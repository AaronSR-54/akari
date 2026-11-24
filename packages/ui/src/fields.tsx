'use client';

import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from './cn.js';
import { IconSearch } from './icons.js';

const controlClass =
  'w-full rounded-lg border border-border-subtle bg-surface-default px-3.5 text-ui-14 text-text-primary placeholder:text-text-placeholder transition-colors duration-fast focus-visible:border-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:bg-surface-sunken disabled:text-text-disabled';

type FieldShellProps = {
  id: string;
  label: string;
  help?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

function FieldShell({ id, label, help, error, required, children, className }: FieldShellProps) {
  const describedBy = error ? `${id}-error` : help ? `${id}-help` : undefined;
  return (
    <div className={cn('flex flex-col gap-1.5', className)} data-describedby={describedBy}>
      <label htmlFor={id} className="text-ui-12-strong text-text-primary">
        {label}
        {required ? (
          <>
            <span aria-hidden="true" className="text-status-danger">
              {' '}
              *
            </span>
            <span className="sr-only"> (obligatorio)</span>
          </>
        ) : null}
      </label>
      {children}
      <div className="min-h-4 text-ui-11">
        {error ? (
          <p id={`${id}-error`} role="alert" className="text-status-danger-text">
            {error}
          </p>
        ) : help ? (
          <p id={`${id}-help`} className="text-text-secondary">
            {help}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string;
  help?: string;
  error?: string;
  id?: string;
  containerClassName?: string;
};

export function TextField({
  label,
  help,
  error,
  id,
  required,
  className,
  containerClassName,
  ...props
}: TextFieldProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <FieldShell
      id={fieldId}
      label={label}
      help={help}
      error={error}
      required={required}
      className={containerClassName}
    >
      <input
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : help ? `${fieldId}-help` : undefined}
        className={cn(controlClass, 'h-12', error && 'border-status-danger', className)}
        {...props}
      />
    </FieldShell>
  );
}

export type TextareaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
  label: string;
  help?: string;
  error?: string;
  id?: string;
};

export function TextareaField({
  label,
  help,
  error,
  id,
  required,
  className,
  ...props
}: TextareaFieldProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <FieldShell id={fieldId} label={label} help={help} error={error} required={required}>
      <textarea
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : help ? `${fieldId}-help` : undefined}
        className={cn(controlClass, 'min-h-28 py-3', error && 'border-status-danger', className)}
        {...props}
      />
    </FieldShell>
  );
}

export type DateFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> & {
  label: string;
  help?: string;
  error?: string;
  id?: string;
};

export function DateField({ label, help, error, id, required, className, ...props }: DateFieldProps) {
  return (
    <TextField
      type="date"
      label={label}
      help={help}
      error={error}
      id={id}
      required={required}
      className={className}
      {...props}
    />
  );
}

export type SelectOption = { value: string; label: string };

export type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
  label: string;
  help?: string;
  error?: string;
  id?: string;
  options: SelectOption[];
  containerClassName?: string;
};

export function SelectField({
  label,
  help,
  error,
  id,
  required,
  options,
  className,
  containerClassName,
  ...props
}: SelectFieldProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <FieldShell
      id={fieldId}
      label={label}
      help={help}
      error={error}
      required={required}
      className={containerClassName}
    >
      <select
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : help ? `${fieldId}-help` : undefined}
        className={cn(controlClass, 'h-12 pr-10', error && 'border-status-danger', className)}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function SelectPill({
  ariaLabel,
  value,
  onChange,
  options,
  className,
}: {
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        'h-8 rounded-full border border-border-subtle bg-surface-default px-3 text-ui-10-strong text-text-primary',
        'focus-visible:border-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
        className,
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export type SearchFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> & {
  id?: string;
};

export function SearchField({ className, ...props }: SearchFieldProps) {
  const generated = useId();
  const fieldId = props.id ?? generated;
  return (
    <div className={cn('relative', className)}>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
        <IconSearch size={16} />
      </span>
      <input
        id={fieldId}
        type="search"
        className={cn(
          'h-10 w-full rounded-full border border-border-subtle bg-surface-default pl-10 pr-12 text-ui-11 text-text-primary placeholder:text-text-tertiary',
          'focus-visible:border-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
        )}
        {...props}
      />
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 rounded border border-border-subtle px-1 text-ui-9 text-text-tertiary">
        ⌘K
      </span>
    </div>
  );
}

export type AmountFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'value'> & {
  label: string;
  value: string;
  currency: string;
  help?: string;
  error?: string;
  id?: string;
};

export function AmountField({
  label,
  value,
  currency,
  help,
  error,
  id,
  required,
  className,
  ...props
}: AmountFieldProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  const symbol =
    new Intl.NumberFormat('es-ES', { style: 'currency', currency })
      .formatToParts(0)
      .find((part) => part.type === 'currency')?.value ?? currency;
  return (
    <FieldShell id={fieldId} label={label} help={help} error={error} required={required}>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ui-14-strong text-text-tertiary"
        >
          {symbol}
        </span>
        <input
          id={fieldId}
          inputMode="decimal"
          value={value}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fieldId}-error` : help ? `${fieldId}-help` : undefined}
          className={cn(
            controlClass,
            'h-16 pl-12 text-right font-tabular text-ui-20-strong',
            error && 'border-status-danger',
            className,
          )}
          {...props}
        />
      </div>
    </FieldShell>
  );
}

export type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  help?: string;
  disabled?: boolean;
  id?: string;
};

export function Switch({ checked, onChange, label, help, disabled, id }: SwitchProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <label htmlFor={fieldId} className="text-ui-12-strong text-text-primary">
          {label}
        </label>
        {help ? <p className="text-ui-10 text-text-tertiary">{help}</p> : null}
      </div>
      <button
        id={fieldId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border p-0.5 transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
          checked ? 'border-text-primary bg-text-primary' : 'border-border-strong bg-surface-sunken',
          disabled && 'opacity-50',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'inline-block h-[22px] w-[22px] rounded-full bg-surface-default shadow transition-transform duration-fast',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
    </div>
  );
}

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
};

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  const generated = useId();
  const fieldId = props.id ?? generated;
  return (
    <label htmlFor={fieldId} className={cn('flex cursor-pointer items-center gap-3 text-ui-12 text-text-primary', className)}>
      <input
        id={fieldId}
        type="checkbox"
        className="h-5 w-5 rounded-sm border-border-strong text-text-primary accent-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
        {...props}
      />
      {label}
    </label>
  );
}
