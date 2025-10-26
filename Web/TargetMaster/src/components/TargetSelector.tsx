import React, { useState } from 'react'

interface TargetOption {
  id: string
  name: string
  type: 'single' | 'multiple'
  colors: string[]
  description?: string
}

const targets: TargetOption[] = [
  {
    id: 'wa_full',
    name: 'WA Full',
    type: 'single',
    colors: [], // No longer used
    description: '122cm (X-5 Recurve style)'
  },
  {
    id: 'wa_6_ring',
    name: 'WA 6 Ring',
    type: 'single',
    colors: [], // No longer used
    description: '80cm (X-5 Recurve style)'
  },
  {
    id: 'wa_vertical_3_spot',
    name: 'WA Vertical 3 Spot',
    type: 'multiple',
    colors: [], // No longer used
    description: '20cm (X-5 Recurve style)'
  }
]

function TargetIcon({ targetType }: { targetType: string }) {
  const size = 100
  const viewBox = 1 // Normalized viewBox (-1 to 1 = 2 units)
  const center = viewBox / 2
  let zones: Array<{ r: number; fill: string; strokeColor: string; strokeWidth: number }> = []

  // Colors based on the target image - bright and vivid
  // Yellow (10, 9점): bright lemon yellow
  // Red (8, 7점): bright red
  // Blue (6, 5점): bright sky blue
  // Black (4, 3점): pure black
  // White (2, 1점): pure white
  
  const LEMON_YELLOW = '#FFEB3B'    // Bright yellow
  const FLAMINGO_RED = '#F44336'    // Bright red
  const CERULEAN_BLUE = '#2196F3'   // Bright blue
  const DARK_GRAY = '#424242'       // Medium gray for borders
  const BLACK = '#000000'
  const WHITE = '#FFFFFF'

  // WA5Ring zones (exact match with Kotlin WA5Ring.kt)
  const wa5RingZones = [
    { r: 0.1, fill: LEMON_YELLOW, strokeColor: DARK_GRAY, strokeWidth: 4 },
    { r: 0.2, fill: LEMON_YELLOW, strokeColor: DARK_GRAY, strokeWidth: 4 },
    { r: 0.4, fill: LEMON_YELLOW, strokeColor: DARK_GRAY, strokeWidth: 4 },
    { r: 0.6, fill: FLAMINGO_RED, strokeColor: DARK_GRAY, strokeWidth: 4 },
    { r: 0.8, fill: FLAMINGO_RED, strokeColor: DARK_GRAY, strokeWidth: 4 },
    { r: 1.0, fill: CERULEAN_BLUE, strokeColor: DARK_GRAY, strokeWidth: 4 },
  ]

  // WA3Ring zones (exact match with Kotlin WA3Ring.kt)
  const wa3RingZones = [
    { r: 0.166, fill: LEMON_YELLOW, strokeColor: DARK_GRAY, strokeWidth: 4 },
    { r: 0.334, fill: LEMON_YELLOW, strokeColor: DARK_GRAY, strokeWidth: 4 },
    { r: 0.666, fill: LEMON_YELLOW, strokeColor: DARK_GRAY, strokeWidth: 4 },
    { r: 1.0, fill: FLAMINGO_RED, strokeColor: DARK_GRAY, strokeWidth: 4 },
  ]

  // WA Full zones (exact match with Kotlin WAFull.kt)
  const waFullZones = [
    { r: 0.05, fill: LEMON_YELLOW, strokeColor: DARK_GRAY, strokeWidth: 2 },
    { r: 0.1, fill: LEMON_YELLOW, strokeColor: DARK_GRAY, strokeWidth: 2 },
    { r: 0.2, fill: LEMON_YELLOW, strokeColor: DARK_GRAY, strokeWidth: 2 },
    { r: 0.3, fill: FLAMINGO_RED, strokeColor: DARK_GRAY, strokeWidth: 2 },
    { r: 0.4, fill: FLAMINGO_RED, strokeColor: DARK_GRAY, strokeWidth: 2 },
    { r: 0.5, fill: CERULEAN_BLUE, strokeColor: DARK_GRAY, strokeWidth: 2 },
    { r: 0.6, fill: CERULEAN_BLUE, strokeColor: DARK_GRAY, strokeWidth: 2 },
    { r: 0.7, fill: BLACK, strokeColor: DARK_GRAY, strokeWidth: 2 },
    { r: 0.8, fill: BLACK, strokeColor: DARK_GRAY, strokeWidth: 2 },
    { r: 0.9, fill: WHITE, strokeColor: DARK_GRAY, strokeWidth: 2 },
    { r: 1.0, fill: WHITE, strokeColor: DARK_GRAY, strokeWidth: 2 },
  ]

  // WA 6 Ring zones (exact match with Kotlin WA6Ring.kt)
  const wa6RingZones = [
    { r: 0.084, fill: LEMON_YELLOW, strokeColor: DARK_GRAY, strokeWidth: 3 },
    { r: 0.166, fill: LEMON_YELLOW, strokeColor: DARK_GRAY, strokeWidth: 3 },
    { r: 0.334, fill: LEMON_YELLOW, strokeColor: DARK_GRAY, strokeWidth: 3 },
    { r: 0.5, fill: FLAMINGO_RED, strokeColor: DARK_GRAY, strokeWidth: 3 },
    { r: 0.666, fill: FLAMINGO_RED, strokeColor: DARK_GRAY, strokeWidth: 3 },
    { r: 0.834, fill: CERULEAN_BLUE, strokeColor: DARK_GRAY, strokeWidth: 3 },
    { r: 1.0, fill: CERULEAN_BLUE, strokeColor: DARK_GRAY, strokeWidth: 3 },
  ]

  if (targetType === 'wa_full') zones = waFullZones
  else if (targetType === 'wa_6_ring') zones = wa6RingZones
  else if (targetType === 'wa_5_ring') zones = wa5RingZones
  else if (targetType === 'wa_3_ring') zones = wa3RingZones
  else if (targetType === 'wa_vertical_3_spot') zones = wa6RingZones // Uses WA6Ring style
  else zones = wa5RingZones

  // For WA Vertical 3 Spot, render 3 targets vertically
  if (targetType === 'wa_vertical_3_spot') {
    const spotPositions = [
      { cx: 0.5, cy: 0.16 }, // Top spot
      { cx: 0.5, cy: 0.5 },  // Middle spot
      { cx: 0.5, cy: 0.84 }, // Bottom spot
    ]
    const spotRadius = 0.16 // faceRadius = 0.32f, scaled by 0.5

    return (
      <svg width={size} height={size} viewBox="0 0 1 1" className="flex-shrink-0 mr-3">
        {spotPositions.map((spot, spotIdx) => (
          <g key={spotIdx} transform={`translate(${spot.cx}, ${spot.cy})`}>
            {[...wa6RingZones].reverse().map((zone, zoneIdx) => {
              const radius = zone.r * spotRadius
              const strokeWidth = zone.strokeWidth * 0.002
              return (
                <circle
                  key={`${spotIdx}-${zoneIdx}`}
                  cx={0}
                  cy={0}
                  r={radius}
                  fill={zone.fill}
                  stroke={zone.strokeColor}
                  strokeWidth={strokeWidth}
                />
              )
            })}
          </g>
        ))}
      </svg>
    )
  }

  return (
    <svg width={size} height={size} viewBox="0 0 1 1" className="flex-shrink-0 mr-3">
      {[...zones].reverse().map((zone, index) => {
        // Convert radius to SVG coordinates: multiply by 0.5 (from 0-1 to 0-0.5 in normalized viewBox)
        const radius = zone.r * 0.5
        // strokeWidth conversion: zone.strokeWidth in pixels, convert to normalized (0.002 factor from ZoneBase)
        const strokeWidth = zone.strokeWidth * 0.002
        return (
          <circle
            key={index}
            cx={0.5}
            cy={0.5}
            r={radius}
            fill={zone.fill}
            stroke={zone.strokeColor}
            strokeWidth={strokeWidth}
          />
        )
      })}
    </svg>
  )
}

interface TargetSelectorProps {
  value: string
  onChange: (value: string) => void
}

export default function TargetSelector({ value, onChange }: TargetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedTarget = targets.find(t => t.id === value)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-6 px-4 py-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
        style={{ border: 'none', outline: 'none' }}
      >
                          {selectedTarget && (
            <>
              <TargetIcon targetType={selectedTarget.id} />
              <div className="flex-1 text-left pl-2">
                <p className="text-lg font-medium text-gray-900">{selectedTarget.name}</p>
                <p className="text-sm text-gray-500">{selectedTarget.description || '60cm (Recurve style 10-6)'}</p>
              </div>
            </>
          )}
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {targets.map((target) => (
              <button
                key={target.id}
                type="button"
                onClick={() => {
                  onChange(target.id)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-6 px-4 py-4 hover:bg-gray-50 transition-colors ${
                  value === target.id ? 'bg-gray-100' : ''
                }`}
                style={{ border: 'none', outline: 'none' }}
              >
                                                  <TargetIcon targetType={target.id} />
                  <div className="flex-1 text-left pl-2">
                    <p className="text-lg font-medium text-gray-900">{target.name}</p>
                    <p className="text-sm text-gray-500">{target.description || '60cm (Recurve style 10-6)'}</p>
                  </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
