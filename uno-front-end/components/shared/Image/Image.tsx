'use client'

interface ImageProps {
  src: string
  alt?: string
  ratio?: number
  className?: string
  [key: string]: any
}

export default function Image({ src, alt = ' ', ratio = 9 / 16, className, ...props }: ImageProps) {
  return (
    <div
      className={`relative w-full ${className ?? ''}`}
      style={{ paddingTop: `${ratio * 100}%` }}
      {...props}
    >
      <img
        className="absolute inset-0 h-full w-full object-cover"
        src={src}
        alt={alt}
      />
    </div>
  )
}

