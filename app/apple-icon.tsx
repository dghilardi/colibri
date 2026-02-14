import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#1C1F28',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '0',
        }}
      >
        <svg
          width="70%"
          height="70%"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <g transform="translate(0, 4) scale(0.8) translate(3,0)">
            <path stroke="#D8DFE1" d="M12 7v14" />
            <path stroke="#D8DFE1" d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
          </g>
          <g transform="translate(12, 2) scale(0.6)">
             <path stroke="#00BC70" d="M16 7h.01" />
             <path stroke="#00BC70" d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20" />
             <path stroke="#00BC70" d="m20 7 2 .5-2 .5" />
             <path stroke="#00BC70" d="M10 18v3" />
             <path stroke="#00BC70" d="M14 17.75V21" />
             <path stroke="#00BC70" d="M7 18a6 6 0 0 0 3.84-10.61" />
          </g>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
