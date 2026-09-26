import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hobituario | Memoriales y Recuerdos Eternos',
    short_name: 'Hobituario',
    description: 'Espacio solemne de recuerdo, condolencias y homenaje digno para nuestros seres amados.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FBF9F5',
    theme_color: '#F5EFE6',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['lifestyle', 'utilities'],
  };
}
