'use client'

import { BackgroundTheme } from '@/lib/types/rooms'

interface BackgroundSelectorProps {
  selected: BackgroundTheme
  onChange: (theme: BackgroundTheme) => void
}

const themes: { value: BackgroundTheme; label: string; description: string }[] = [
  { value: 'forest', label: 'Forest', description: 'Peaceful woodland' },
  { value: 'library', label: 'Library', description: 'Classic study space' },
  { value: 'cafe', label: 'Cafe', description: 'Cozy coffee shop' },
  { value: 'space', label: 'Space', description: 'Cosmic inspiration' },
  { value: 'minimal', label: 'Minimal', description: 'Clean & simple' },
]

export default function BackgroundSelector({
  selected,
  onChange,
}: BackgroundSelectorProps) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {themes.map((theme) => (
        <button
          key={theme.value}
          type="button"
          onClick={() => onChange(theme.value)}
          className={`relative group overflow-hidden rounded-lg border-2 transition-all ${
            selected === theme.value
              ? 'border-[#5A5FF0] ring-2 ring-[#5A5FF0]/20'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {/* Preview image */}
          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(/${theme.value}.png)`,
              }}
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>

          {/* Label */}
          <div className="p-2 bg-white">
            <div className="text-xs font-semibold text-gray-900">{theme.label}</div>
            <div className="text-[10px] text-gray-500">{theme.description}</div>
          </div>

          {/* Selected indicator */}
          {selected === theme.value && (
            <div className="absolute top-2 right-2 w-5 h-5 bg-[#5A5FF0] rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
