import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * CustomSelect – a luxury-branded dropdown that matches the app's design system.
 *
 * Props:
 *   value        – current value (string)
 *   onChange     – (value: string) => void
 *   options      – [{ value, label }]
 *   placeholder  – string shown when value is empty/falsy
 *   label        – optional label rendered above the trigger
 *   className    – extra classes on the outer wrapper div
 *   triggerClass – extra classes on the trigger button
 *   minWidth     – min-width of the dropdown panel (default '160px')
 *   disabled     – boolean
 */
const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  label,
  className = '',
  triggerClass = '',
  minWidth = '160px',
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find(o => o.value === value);

  const close = useCallback(() => setOpen(false), []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, close]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, close]);

  const handleSelect = (val) => {
    onChange(val);
    close();
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <p className="text-xs uppercase tracking-widest text-gray-dark mb-2 select-none">
          {label}
        </p>
      )}

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        className={`
          group flex items-center justify-between gap-3
          w-full px-4 py-[10px]
          border text-sm font-sans tracking-wide
          transition-all duration-200 select-none text-left
          ${open
            ? 'border-black bg-white text-black'
            : 'border-border bg-white text-black hover:border-gray-dark'
          }
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
          ${triggerClass}
        `}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selectedOption ? 'text-black' : 'text-gray-dark'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`flex-shrink-0 transition-transform duration-200 text-gray-dark
            ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          style={{ minWidth }}
          className="
            absolute z-50 top-full left-0 mt-[1px]
            bg-white border border-black
            shadow-[4px_4px_0px_rgba(5,5,5,0.08)]
            animate-scale-up origin-top
            overflow-hidden
          "
        >
          {options.map((opt) => {
            const isActive = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => handleSelect(opt.value)}
                className={`
                  w-full text-left px-4 py-[10px]
                  text-sm font-sans tracking-wide
                  transition-colors duration-150
                  ${isActive
                    ? 'bg-black text-white'
                    : 'text-black hover:bg-gray-light'
                  }
                `}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
