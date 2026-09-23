import { useState, type ReactNode } from 'react'
import heroSetup from '../../assets/hero-setup.webp'

const assets: Record<string, string> = {
  'hero-setup.webp': heroSetup,
}

export function AssetImage({
  name,
  alt,
  fallback,
  className = '',
}: {
  name?: string
  alt: string
  fallback?: ReactNode
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const src = name ? assets[name] : undefined
  return (
    <div className={`asset-image ${className}`}>
      {src && !failed ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" onError={() => setFailed(true)} />
      ) : (
        fallback
      )}
    </div>
  )
}
