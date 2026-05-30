'use client'

import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`w-full bg-[#F5F5F7] border-0 rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#1D1D1F] transition-all focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0066CC]/30 disabled:opacity-50 ${
            error ? 'bg-[#FF3B30]/5 ring-2 ring-[#FF3B30]/30' : ''
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-[12px] text-[#FF3B30]">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
