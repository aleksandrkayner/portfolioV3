import { useId } from 'react'

interface PrismaticCrystalIconProps {
  className?: string
}

/**
 * Faceted crystal with per-face gradients (prismatic / iridescent look).
 */
export function PrismaticCrystalIcon({ className = 'h-4 w-4 shrink-0' }: PrismaticCrystalIconProps) {
  const uid = useId().replace(/:/g, '')

  const g = (name: string) => `${uid}-${name}`

  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <defs>
        <linearGradient id={g('left')} x1="10" y1="2" x2="4" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c084fc" />
          <stop offset="0.45" stopColor="#6366f1" />
          <stop offset="1" stopColor="#e40303" />
        </linearGradient>
        <linearGradient id={g('right')} x1="10" y1="2" x2="16" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="#67e8f9" />
          <stop offset="0.45" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#008026" />
        </linearGradient>
        <linearGradient id={g('crown')} x1="4" y1="8" x2="16" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffed00" />
          <stop offset="0.35" stopColor="#ff8c00" />
          <stop offset="0.7" stopColor="#ff6b9d" />
          <stop offset="1" stopColor="#732982" />
        </linearGradient>
        <linearGradient id={g('base')} x1="5" y1="14" x2="15" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4c1d95" />
          <stop offset="0.5" stopColor="#7c3aed" />
          <stop offset="1" stopColor="#24408e" />
        </linearGradient>
        <linearGradient id={g('shine')} x1="7" y1="3" x2="12" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Crown (top facet) */}
      <path d="M10 1.75 4.25 8.25 15.75 8.25 10 1.75Z" fill={`url(#${g('crown')})`} />

      {/* Left facet */}
      <path d="M10 1.75 4.25 8.25 10 18.5 10 8.25 10 1.75Z" fill={`url(#${g('left')})`} />

      {/* Right facet */}
      <path d="M10 1.75 15.75 8.25 10 18.5 10 8.25 10 1.75Z" fill={`url(#${g('right')})`} />

      {/* Base facet */}
      <path d="M4.25 8.25 7.1 17.1 12.9 17.1 15.75 8.25 10 8.25 4.25 8.25Z" fill={`url(#${g('base')})`} />

      {/* Center ridge highlight */}
      <path
        d="M10 1.75 10 18.5"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.6"
        strokeLinecap="round"
      />

      {/* Specular shine on left facet */}
      <path d="M7.2 4.2 8.6 9.2 6.8 11.5 7.2 4.2Z" fill={`url(#${g('shine')})`} opacity="0.85" />

      {/* Sparkles */}
      <circle cx="13.6" cy="5.2" r="0.65" fill="#fff" opacity="0.9" />
      <circle cx="6.4" cy="12.8" r="0.45" fill="#fff" opacity="0.55" />
    </svg>
  )
}
