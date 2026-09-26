import { ModerationStatus } from '../types/memorial';

// Lista de patrones y palabras ofensivas comunes para proteger la paz del memorial
const OFFENSIVE_TERMS = [
  'hijo de',
  'hdp',
  'maldit',
  'estafador',
  'ladron',
  'ladrona',
  'basura',
  'odio',
  'muerete',
  'rata',
  'sinverguenza',
  'corrupto',
  'infeliz',
  'desgraciad',
  'mierda',
  'puto',
  'puta',
  'imbecil',
  'estupido',
  'estupida',
  'idiota',
  'perra',
  'bastardo',
  'culiao',
  'conchatumadre',
  'concha tu madre',
];

export class ModerationService {
  /**
   * Analiza un texto para detectar groserías, ofensas o ataques contra el difunto o la familia
   */
  checkContent(text: string, author: string): { isClean: boolean; reason?: string } {
    const combined = `${author} ${text}`.toLowerCase();
    
    // Normalizar texto (quitar acentos, puntuación repetida)
    const normalized = combined
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ');

    for (const term of OFFENSIVE_TERMS) {
      if (normalized.includes(term)) {
        return {
          isClean: false,
          reason: `Detectado término incompatible con el respeto del memorial: "${term}"`,
        };
      }
    }

    return { isClean: true };
  }

  /**
   * Determina el estado inicial del tributo según la configuración de la familia y el filtro
   */
  evaluateTribute(params: {
    message: string;
    authorName: string;
    moderationRequired: boolean;
  }): { status: ModerationStatus; reason?: string } {
    const check = this.checkContent(params.message, params.authorName);

    if (!check.isClean) {
      // Bloqueado o enviado a cuarentena estricta
      return { status: 'rejected', reason: check.reason };
    }

    // Si la familia requiere moderación manual previa
    if (params.moderationRequired) {
      return { status: 'pending', reason: 'En espera de aprobación familiar' };
    }

    // Si todo está limpio y no requiere aprobación previa
    return { status: 'approved' };
  }
}

export const moderationService = new ModerationService();
