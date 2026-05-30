'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, children, className = '', disabled, ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center font-medium rounded-[10px] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC]/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variantClasses = {
      primary: 'bg-[#0066CC] hover:bg-[#0055AA] text-white',
      secondary: 'bg-black/5 hover:bg-black/10 text-[#1D1D1F]',
      danger: 'bg-[#FF3B30]/10 hover:bg-[#FF3B30]/15 text-[#FF3B30]',
      ghost: 'text-[#6E6E73] hover:bg-black/5 hover:text-[#1D1D1F]',
      outline: 'border border-[rgba(0,0,0,0.12)] text-[#1D1D1F] hover:bg-black/[0.03]',
    }

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-[13px] gap-1.5',
      md: 'px-4 py-2 text-[14px] gap-2',
      lg: 'px-5 py-2.5 text-[15px] font-medium gap-2',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
