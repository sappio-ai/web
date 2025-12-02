'use client'

import { InputHTMLAttributes, forwardRef, useState, useMemo } from 'react'

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  helperText?: string
  showStrength?: boolean
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, helperText, showStrength = false, className = '', id, value, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const hasError = !!error
    const [showPassword, setShowPassword] = useState(false)
    const [capsLockOn, setCapsLockOn] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    // Calculate password strength
    const strength = useMemo(() => {
      if (!showStrength || !value) return 0
      
      const password = String(value)
      let score = 0
      
      // Length check
      if (password.length >= 8) score++
      if (password.length >= 12) score++
      
      // Has lowercase and uppercase
      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
      
      // Has numbers
      if (/\d/.test(password)) score++
      
      // Has special characters
      if (/[^A-Za-z0-9]/.test(password)) score++
      
      // Return 0-3 scale (weak, medium, strong)
      if (score <= 2) return 1 // weak
      if (score <= 4) return 2 // medium
      return 3 // strong
    }, [value, showStrength])

    const strengthConfig = {
      1: { label: 'Weak', color: 'bg-red-400', width: 'w-1/3' },
      2: { label: 'Medium', color: 'bg-yellow-400', width: 'w-2/3' },
      3: { label: 'Strong', color: 'bg-green-400', width: 'w-full' },
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.getModifierState && e.getModifierState('CapsLock')) {
        setCapsLockOn(true)
      }
      props.onKeyDown?.(e)
    }

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.getModifierState && !e.getModifierState('CapsLock')) {
        setCapsLockOn(false)
      }
      props.onKeyUp?.(e)
    }

    // Only show strength indicator while typing and not yet strong
    const shouldShowStrength = showStrength && value && String(value).length > 0 && strength < 3 && isFocused

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
            type={showPassword ? 'text' : 'password'}
            value={value}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              setCapsLockOn(false)
              props.onBlur?.(e)
            }}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            className={`
              w-full h-12 px-4 pr-12 bg-white border rounded-xl text-[#1A1D2E] placeholder-[#94A3B8]
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
          <div className="absolute top-0 right-16 w-[12px] h-[8px] bg-[#5A5FF0] rounded-b-[2px] opacity-0 group-focus-within:opacity-100 transition-opacity duration-150 pointer-events-none" />
          
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1A1D2E] transition-colors duration-150 z-10"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Caps Lock warning */}
        {capsLockOn && isFocused && (
          <div className="mt-2 flex items-center gap-1.5 text-[12px] text-[#DC2626] font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Caps Lock is on</span>
          </div>
        )}
        
        {/* Password strength bar - only show while typing and not yet strong */}
        {shouldShowStrength && (
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-1 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div 
                  className={`h-full ${strengthConfig[strength as keyof typeof strengthConfig].color} transition-all duration-300 ${strengthConfig[strength as keyof typeof strengthConfig].width}`}
                />
              </div>
              <span className="text-[12px] text-[#64748B] font-medium">
                {strengthConfig[strength as keyof typeof strengthConfig].label}
              </span>
            </div>
          </div>
        )}
        
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

PasswordInput.displayName = 'PasswordInput'

export default PasswordInput
