import { ReactNode } from 'react'

interface HighlightProps {
  children: ReactNode
  className?: string
}

export default function Highlight({ children, className = '' }: HighlightProps) {
  return (
    <span className={`relative inline-block ${className}`}>
      {/* Imperfect marker stroke behind text */}
      <svg
        className="absolute inset-0 w-full h-full -z-10"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 3,48 Q 8,44 18,46 L 82,44 Q 92,43 97,50 L 96,68 Q 93,74 83,72 L 15,70 Q 5,71 3,62 Z"
          fill="var(--highlight)"
          opacity="0.4"
        />
      </svg>
      <span className="relative">{children}</span>
    </span>
  )
}
