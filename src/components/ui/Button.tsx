import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 ease-out focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed relative overflow-hidden'
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] hover:from-[#8bc5c5] hover:to-[#a8d5d5] text-[#0a0e14] hover:shadow-[0_6px_24px_rgba(168,213,213,0.3)] hover:translate-y-[-2px] active:translate-y-0 focus-visible:ring-2 focus-visible:ring-[#a8d5d5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0F1A] before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/[0.04] before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:saturate-75 disabled:brightness-75 font-semibold hover:scale-[1.02]',
    secondary: 'bg-transparent text-[#EAF2FF] border border-white/10 hover:bg-[rgba(255,255,255,0.07)] hover:border-white/20 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] backdrop-blur-[8px] hover:translate-y-[-1px] active:translate-y-0 focus-visible:ring-2 focus-visible:ring-[#a8d5d5]/40',
    outline: 'border border-white/10 text-[#EAF2FF] hover:bg-[rgba(255,255,255,0.07)] hover:border-white/20 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] backdrop-blur-[8px] hover:translate-y-[-1px] active:translate-y-0 focus-visible:ring-2 focus-visible:ring-[#a8d5d5]/40',
    ghost: 'text-[#A9B4CA] hover:bg-[rgba(255,255,255,0.07)]',
  }
  
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm h-10',
    md: 'px-4 py-2.5 text-base h-12 font-semibold',
    lg: 'px-6 py-3 text-base h-[50px] font-semibold',
  }
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
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
