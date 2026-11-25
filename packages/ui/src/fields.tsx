'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from './cn.js';
import { Calendar } from './calendar.js';
import { formatBusinessDate } from './dates.js';
import { BottomSheet } from './feedback.js';
import { useFloatingPanel } from './floating.js';
import { IconCalendar, IconChevronDown, IconSearch } from './icons.js';
import { MOBILE_MEDIA_QUERY, useMediaQuery } from './media.js';

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
      <label id={`${id}-label`} htmlFor={id} className="text-ui-12-strong text-text-primary">
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

export type DateFieldProps = {
  label: string;
  value?: string;
  onValueChange: (value: string) => void;
  help?: string;
  error?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export function DateField({
  label,
  value,
  onValueChange,
  help,
  error,
  id,
  name,
  required,
  disabled,
  className,
}: DateFieldProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  const panelId = `${fieldId}-panel`;
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const showPanel = open && !isMobile;

  const close = useCallback((focusTrigger = true) => {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }, []);

  const position = useFloatingPanel({
    open: showPanel,
    anchorRef: triggerRef,
    panelRef,
    minWidth: 320,
    onDismiss: () => close(false),
  });

  const selectDate = (next: string) => {
    onValueChange(next);
    close();
  };

  const displayValue = value ? formatBusinessDate(value) : 'Elegir fecha';

  return (
    <FieldShell
      id={fieldId}
      label={label}
      help={help}
      error={error}
      required={required}
      className={className}
    >
      <button
        ref={triggerRef}
        id={fieldId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={showPanel ? panelId : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : help ? `${fieldId}-help` : undefined}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          controlClass,
          'flex h-12 items-center justify-between gap-2 pr-3.5 text-left',
          error && 'border-status-danger',
        )}
      >
        <span className={cn('truncate', !value && 'text-text-placeholder')}>{displayValue}</span>
        <IconCalendar size={16} className="shrink-0 text-text-secondary" />
      </button>
      {name ? <input type="hidden" name={name} value={value ?? ''} /> : null}
      {showPanel ? (
        <div
          id={panelId}
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby={`${fieldId}-label`}
          style={{
            position: 'fixed',
            left: position?.left,
            width: position?.width,
            top: position?.top,
            bottom: position?.bottom,
            visibility: position ? 'visible' : 'hidden',
          }}
          className="z-50 rounded-lg border border-border-subtle bg-surface-raised p-3 elevation-2"
        >
          <Calendar
            value={value}
            onSelect={selectDate}
            onCancel={() => close()}
            labelledBy={`${fieldId}-label`}
          />
        </div>
      ) : null}
      {open && isMobile ? (
        <BottomSheet open onClose={() => close()} title={label}>
          <Calendar
            value={value}
            onSelect={selectDate}
            onCancel={() => close()}
            labelledBy={`${fieldId}-label`}
          />
        </BottomSheet>
      ) : null}
    </FieldShell>
  );
}

export type SelectOption = { value: string; label: string; icon?: ReactNode };

const SELECT_TYPEAHEAD_TIMEOUT = 500;

type SelectControlProps = {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  listboxLabel: string;
  ariaLabel?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  variant: 'field' | 'pill';
  className?: string;
};

function SelectControl({
  id,
  value,
  onValueChange,
  options,
  listboxLabel,
  ariaLabel,
  name,
  required,
  disabled,
  invalid,
  describedBy,
  variant,
  className,
}: SelectControlProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const typeahead = useRef({ text: '', at: 0 });
  const listboxId = `${id}-listbox`;
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;
  const selectedLabel = selected?.label;

  const optionId = (index: number) => `${listboxId}-option-${index}`;

  const closePanel = useCallback((focusTrigger = false) => {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }, []);

  const openPanel = useCallback(() => {
    if (options.length === 0) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }, [options.length, selectedIndex]);

  const position = useFloatingPanel({
    open,
    anchorRef: triggerRef,
    panelRef,
    minWidth: variant === 'pill' ? 192 : undefined,
    onDismiss: closePanel,
  });

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    optionRefs.current[activeIndex]?.scrollIntoView?.({ block: 'nearest' });
  }, [open, activeIndex]);

  const commit = (index: number) => {
    const option = options[index];
    if (!option) return;
    closePanel();
    if (option.value !== value) onValueChange(option.value);
  };

  const moveActive = (delta: number) => {
    if (options.length === 0) return;
    setActiveIndex((current) => {
      const start = current >= 0 ? current : 0;
      return (start + delta + options.length) % options.length;
    });
  };

  const handleTypeahead = (key: string) => {
    const now = Date.now();
    const previous = typeahead.current;
    const text = (now - previous.at > SELECT_TYPEAHEAD_TIMEOUT ? key : previous.text + key).toLowerCase();
    typeahead.current = { text, at: now };
    const match = options.findIndex((option) => option.label.toLowerCase().startsWith(text));
    if (match < 0) return;
    setActiveIndex(match);
    if (!open) setOpen(true);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const { key } = event;

    if (key === 'Tab') {
      if (open) closePanel();
      return;
    }

    if (key === 'Escape') {
      if (open) {
        event.preventDefault();
        closePanel(true);
      }
      return;
    }

    if (key === 'ArrowDown') {
      event.preventDefault();
      if (open) moveActive(1);
      else openPanel();
      return;
    }

    if (key === 'ArrowUp') {
      event.preventDefault();
      if (open) moveActive(-1);
      else openPanel();
      return;
    }

    if (key === 'Home' || key === 'End') {
      if (!open) return;
      event.preventDefault();
      setActiveIndex(key === 'Home' ? 0 : options.length - 1);
      return;
    }

    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      if (open && activeIndex >= 0) commit(activeIndex);
      else openPanel();
      return;
    }

    if (key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      handleTypeahead(key);
    }
  };

  return (
    <>
      <button
        type="button"
        role="combobox"
        id={id}
        ref={triggerRef}
        disabled={disabled}
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-activedescendant={open && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        aria-required={required ? true : undefined}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        aria-label={ariaLabel}
        data-value={value}
        onClick={() => {
          if (open) closePanel();
          else openPanel();
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          variant === 'field'
            ? cn(
                controlClass,
                'flex h-12 items-center justify-between gap-2 pr-3.5 text-left',
                invalid && 'border-status-danger',
              )
            : 'flex h-8 items-center gap-2 rounded-full border border-border-subtle bg-surface-default px-3 text-left text-ui-10-strong text-text-primary transition-colors duration-fast focus-visible:border-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:bg-surface-sunken disabled:text-text-disabled',
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected?.icon ? (
            <span aria-hidden="true" className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
              {selected.icon}
            </span>
          ) : null}
          <span className="truncate">{selectedLabel ?? ''}</span>
        </span>
        <IconChevronDown
          size={16}
          className={cn(
            'shrink-0 text-text-secondary transition-transform duration-fast motion-reduce:transition-none',
            open && 'rotate-180',
          )}
        />
      </button>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      {open ? (
        <div
          id={listboxId}
          ref={panelRef}
          role="listbox"
          aria-label={listboxLabel}
          style={{
            position: 'fixed',
            left: position?.left,
            width: position?.width,
            top: position?.top,
            bottom: position?.bottom,
            maxHeight: position?.maxHeight,
            visibility: position ? 'visible' : 'hidden',
          }}
          className="z-50 overflow-y-auto rounded-lg border border-border-subtle bg-surface-raised p-1 elevation-2"
        >
          {options.map((option, index) => (
            <div
              key={option.value}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              id={optionId(index)}
              role="option"
              aria-selected={index === selectedIndex}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => commit(index)}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-ui-13 text-text-primary',
                index === activeIndex && 'bg-surface-sunken',
                index === selectedIndex && 'text-ui-13-strong',
              )}
            >
              {option.icon ? (
                <span aria-hidden="true" className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
                  {option.icon}
                </span>
              ) : null}
              <span className="truncate">{option.label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}

export type SelectFieldProps = {
  label: string;
  help?: string;
  error?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  containerClassName?: string;
};

export function SelectField({
  label,
  help,
  error,
  id,
  name,
  required,
  disabled,
  options,
  value,
  onValueChange,
  className,
  containerClassName,
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
      <SelectControl
        id={fieldId}
        listboxLabel={label}
        value={value}
        onValueChange={onValueChange}
        options={options}
        name={name}
        required={required}
        disabled={disabled}
        invalid={Boolean(error)}
        describedBy={error ? `${fieldId}-error` : help ? `${fieldId}-help` : undefined}
        variant="field"
        className={className}
      />
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
  const generated = useId();
  return (
    <SelectControl
      id={`pill-${generated}`}
      listboxLabel={ariaLabel}
      ariaLabel={ariaLabel}
      value={value}
      onValueChange={onChange}
      options={options}
      variant="pill"
      className={className}
    />
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
