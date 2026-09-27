/**
 * Colección de fondos y avatares solemnes predeterminados para memoriales.
 * Evita el uso de fotos de personas aleatorias como placeholders genéricos.
 */

export interface CoverPreset {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
}

export const MEMORIAL_COVER_PRESETS: CoverPreset[] = [
  {
    id: 'cielo_eterno',
    name: 'Cielo Eterno y Luz Divina',
    url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'flores_blancas',
    name: 'Lirios Blancos y Respeto',
    url: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=1600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'olivos_paz',
    name: 'Jardín de Paz y Olivos',
    url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'montanas_niebla',
    name: 'Montañas y Niebla Eterna',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'velas_esperanza',
    name: 'Capilla y Velas de Esperanza',
    url: 'https://images.unsplash.com/photo-1602615576820-ea14cf3e476a?auto=format&fit=crop&w=1600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1602615576820-ea14cf3e476a?auto=format&fit=crop&w=300&q=80',
  },
];

/**
 * Avatar neutro y digno para retratos donde aún no se ha subido una fotografía familiar.
 * Representa una silueta respetuosa con halo cálido y marco dorado sutil.
 */
export const DEFAULT_AVATAR_PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FAF7F2"/>
      <stop offset="100%" stop-color="#EBE3D5"/>
    </linearGradient>
    <radialGradient id="haloGrad" cx="50%" cy="38%" r="48%">
      <stop offset="0%" stop-color="#FFF8E8" stop-opacity="1"/>
      <stop offset="100%" stop-color="#EBE3D5" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bgGrad)"/>
  <circle cx="100" cy="85" r="75" fill="url(#haloGrad)"/>
  <!-- Cabeza silueta solemne -->
  <circle cx="100" cy="78" r="32" fill="#8C7F72"/>
  <!-- Hombros y torso -->
  <path d="M42,178 C42,130 68,122 100,122 C132,122 158,130 158,178 Z" fill="#8C7F72"/>
  <!-- Halo espiritual dorado -->
  <circle cx="100" cy="78" r="42" fill="none" stroke="#C29837" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.65"/>
</svg>
`);

export const DEFAULT_COVER_PLACEHOLDER = MEMORIAL_COVER_PRESETS[0].url;
