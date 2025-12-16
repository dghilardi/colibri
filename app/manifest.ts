import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CO-LIBRÌ - Comelit Library',
    short_name: 'CoLibrì',
    description: 'Comelit Corporate Library',
    start_url: '/',
    display: 'standalone',
    background_color: '#1C1F28',
    theme_color: '#1C1F28',
    icons: [
      {
        src: '/icon1',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon2',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
