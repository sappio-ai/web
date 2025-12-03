interface BookmarkCornerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function BookmarkCorner({ 
  size = 'md',
  className = '' 
}: BookmarkCornerProps) {
  const sizes = {
    sm: { width: 20, height: 28 },
    md: { width: 24, height: 32 },
    lg: { width: 28, height: 36 }
  }
  
  const s = sizes[size]
  
  return (
    <div 
      className={`absolute -top-0 right-6 ${className}`}
      style={{ width: s.width, height: s.height }}
    >
      <svg 
        width={s.width} 
        height={s.height} 
        viewBox={`0 0 ${s.width} ${s.height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={`M 0 2 Q 0 0 2 0 L ${s.width - 2} 0 Q ${s.width} 0 ${s.width} 2 L ${s.width} ${s.height} L ${s.width / 2 + 2} ${s.height - 4} L ${s.width / 2} ${s.height} L ${s.width / 2 - 2} ${s.height - 4} L 0 ${s.height} Z`}
          fill="var(--primary)"
        />
      </svg>
    </div>
  )
}
