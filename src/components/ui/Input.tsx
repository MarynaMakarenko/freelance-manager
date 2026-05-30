'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full bg-[#F5F5F7] border-0 rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#1D1D1F] placeholder:text-[#AEAEB2] transition-all focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0066CC]/30 disabled:opacity-50 ${
            error
              ? 'bg-[#FF3B30]/5 ring-2 ring-[#FF3B30]/30'
              : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-[12px] text-[#FF3B30]">{error}</p>}
        {helpText && !error && <p className="mt-1 text-[12px] text-[#6E6E73]">{helpText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
