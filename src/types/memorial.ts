export type ServiceType = 
  | 'velatorio' 
  | 'misa_cuerpo_presente' 
  | 'sepelio' 
  | 'cremacion' 
  | 'homenaje_virtual' 
  | 'novenario' 
  | 'cabo_de_ano';

export interface FuneralService {
  id: string;
  obituaryId: string;
  serviceType: ServiceType;
  title: string;
  locationName: string;
  address: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  photoUrl?: string; // Foto opcional de la capilla o camposanto
  googleMapsUrl?: string;
  coordinatesLat?: number;
  coordinatesLng?: number;
  livestreamUrl?: string;
  notes?: string;
}

export type TributeType = 'candle' | 'flower' | 'message';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export interface Tribute {
  id: string;
  obituaryId: string;
  authorName: string;
  authorEmail?: string;
  relationship?: string; // e.g. "Hijo", "Amigo de la infancia", "Colega"
  message: string;
  tributeType: TributeType;
  candleColor?: string; // warm-gold, soft-white, celestial-blue, rose
  flowerType?: string; // rosa-blanca, azucena, lirio, crisantemo
  photoUrl?: string; // Foto opcional del recuerdo adjuntada por el allegado
  createdAt: string;
  isApproved: boolean;
  moderationStatus: ModerationStatus;
  flaggedReason?: string;
}

export interface TimelineMilestone {
  id: string;
  obituaryId: string;
  year: string;
  title: string;
  description: string;
  photoUrl?: string; // Foto histórica del momento
}

export interface MemoryMedia {
  id: string;
  obituaryId: string;
  mediaUrl: string;
  caption?: string;
  authorName: string;
  createdAt: string;
}

// ==========================================
// OPCIONES DE PERSONALIZACIÓN VISUAL Y SAAS
// ==========================================
export type MemorialFont = 
  | 'serif-cormorant' 
  | 'serif-cinzel' 
  | 'serif-playfair' 
  | 'sans-inter'
  | 'serif-lora'
  | 'serif-merriweather'
  | 'serif-bodoni'
  | 'sans-montserrat';
export type MemorialThemePreset = 'ivory-warm' | 'charcoal-dark' | 'olive-peace' | 'rose-memory';
export type MemorialAccent = 'gold' | 'bronze' | 'silver' | 'amber';

export type SubscriptionPlanId = 'esencial' | 'legado' | 'infinito';

export interface SubscriptionPlanLimits {
  maxPhotos: number;
  maxCandlesAndFlowers: number;
  maxTimelineMilestones: number;
  allowsTimelinePhotos: boolean;
  maxServices: number;
  allowsServicePhotos: boolean;
  allowsTributePhotos: boolean;
  allowsVideo: boolean;
  allowsAudio: boolean;
  allowsLivestream: boolean;
  allowsBackgroundMusic: boolean;
  hasAdminDashboard: boolean;
  hasProfanityFilter: boolean;
  storageLimitMB: number;
}

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  tagline: string;
  priceUSD: number;
  priceLocal: string;
  period: string;
  isPopular?: boolean;
  badge?: string;
  limits: SubscriptionPlanLimits;
  features: string[];
}

export interface Obituary {
  id: string;
  slug: string;
  fullName: string;
  nickname?: string;
  birthDate: string; // YYYY-MM-DD
  deathDate: string; // YYYY-MM-DD
  birthPlace?: string;
  deathPlace?: string;
  epitaph: string;
  biography: string;
  mainPhotoUrl: string;
  coverPhotoUrl?: string;
  isPublic: boolean;
  accessPin?: string;
  services: FuneralService[];
  tributes: Tribute[];
  timeline: TimelineMilestone[];
  gallery: MemoryMedia[];
  candlesCount: number;
  flowersCount: number;
  // Campos SaaS & Moderación
  planId: SubscriptionPlanId;
  moderationRequired: boolean;
  ownerEmail?: string;
  ownerName?: string;
  backgroundMusicUrl?: string;
  // Campos de Personalización Visual del Memorial
  fontFamily?: MemorialFont;
  themePreset?: MemorialThemePreset;
  primaryAccent?: MemorialAccent;
}
