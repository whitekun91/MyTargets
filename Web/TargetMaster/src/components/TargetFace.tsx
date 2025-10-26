import React from 'react'

interface TargetFaceProps {
  type: 'WA Vertical 3 Spot'
  diameter?: number
  style?: 'recurve' | 'compound'
}

export default function TargetFace({ type, diameter = 60, style = 'recurve' }: TargetFaceProps) {
  if (type === 'WA Vertical 3 Spot') {
    return <WAVertical3Spot diameter={diameter} style={style} />
  }
  return null
}

function WAVertical3Spot({ diameter, style }: { diameter: number; style: string }) {
  const radius = diameter / 2
  const faceRadius = 0.32
  const spotPositions = [
    { x: 0, y: -0.68 },
    { x: 0, y: 0 },
    { x: 0, y: 0.68 }
  ]

  const colors = {
    lemonYellow: '#FFFF00',
    flamingoRed: '#FF1744',
    ceruleanBlue: '#03A9F4',
    darkGray: '#424242'
  }

  // WA5Ring zones (radius from 0 to 1)
  const zones = [
    { r: 0.1, color: colors.lemonYellow },
    { r: 0.2, color: colors.lemonYellow },
    { r: 0.4, color: colors.lemonYellow },
    { r: 0.6, color: colors.flamingoRed },
    { r: 0.8, color: colors.flamingoRed },
    { r: 1.0, color: colors.ceruleanBlue }
  ]

  return (
    <div className="flex flex-col items-center gap-4">
      {spotPositions.map((pos, index) => (
        <svg
          key={index}
          viewBox="-1.2 -1.2 2.4 2.4"
          width={radius}
          height={radius}
          className="drop-shadow-md"
        >
          {zones.map((zone, zoneIndex) => {
            const isCompoundZone = style === 'compound' && (zoneIndex === 0 || zoneIndex === 1)
            if (isCompoundZone) return null
            
            return (
              <circle
                key={zoneIndex}
                cx={0}
                cy={0}
                r={zone.r * faceRadius}
                fill={zone.color}
                stroke={colors.darkGray}
                strokeWidth="0.015"
              />
            )
          })}
          {/* Center mark */}
          <circle
            cx={0}
            cy={0}
            r={0.02}
            fill={colors.darkGray}
          />
        </svg>
      ))}
    </div>
  )
}
