import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const hasError = !!error

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[13px] font-medium text-[#1A1D2E] mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full h-12 px-4 bg-white border rounded-xl text-[#1A1D2E] placeholder-[#94A3B8]
              focus:outline-none focus:ring-2 focus:border-[#5A5FF0]
              transition-all duration-150
              ${hasError 
                ? 'border-[#DC2626] focus:ring-[#DC2626]/40 focus:border-[#DC2626]' 
                : 'border-[#94A3B8]/30 focus:ring-[#5A5FF0]/40 focus:border-[#5A5FF0]'
              }
              disabled:bg-[#F1F5F9] disabled:text-[#94A3B8] disabled:cursor-not-allowed
              ${className}
            `}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />
          {/* Bookmark tab indicator on focus */}
          <div className="absolute top-0 right-4 w-[12px] h-[8px] bg-[#5A5FF0] rounded-b-[2px] opacity-0 group-focus-within:opacity-100 transition-opacity duration-150 pointer-events-none" />
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-2 text-[13px] text-[#DC2626] font-medium"
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="mt-2 text-[13px] text-[#64748B]"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
