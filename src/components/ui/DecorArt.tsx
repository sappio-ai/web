import Image from 'next/image'

interface DecorArtProps {
  src: string
  alt?: string
  className?: string
  variant?: 'blob' | 'card' | 'float'
  width?: number
  height?: number
}

export default function DecorArt({ 
  src, 
  alt = '', 
  className = '', 
  variant = 'float',
  width = 400,
  height = 400
}: DecorArtProps) {
  const variantStyles = {
    blob: 'rounded-full',
    card: 'rounded-2xl shadow-lg',
    float: 'drop-shadow-xl'
  }
  
  return (
    <div 
      className={`pointer-events-none ${variantStyles[variant]} ${className}`}
      aria-hidden={!alt}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-full object-contain"
      />
    </div>
  )
}
