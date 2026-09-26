import { Obituary, Tribute, TributeType, SubscriptionPlanId } from '../types/memorial';
import { INITIAL_MEMORIALS } from '../data/mockMemorials';
import { supabase, isSupabaseConfigured } from './supabase';
import { moderationService } from './moderationService';

const STORAGE_KEY = 'hobituario_memorials_v1';

class MemorialService {
  private getLocalMemorials(): Obituary[] {
    if (typeof window === 'undefined') return INITIAL_MEMORIALS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MEMORIALS));
        return INITIAL_MEMORIALS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_MEMORIALS;
    }
  }

  private saveLocalMemorials(memorials: Obituary[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memorials));
    } catch (e) {
      console.warn('Error saving to localStorage:', e);
    }
  }

  async getAll(): Promise<Obituary[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('obituaries')
          .select('*, services:funeral_services(*), tributes:condolences_and_tributes(*), timeline:timeline_events(*)')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as unknown as Obituary[];
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local store:', err);
      }
    }
    return this.getLocalMemorials();
  }

  async getBySlug(slug: string): Promise<Obituary | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('obituaries')
          .select('*, services:funeral_services(*), tributes:condolences_and_tributes(*), timeline:timeline_events(*)')
          .eq('slug', slug)
          .single();

        if (!error && data) {
          return data as unknown as Obituary;
        }
      } catch (err) {
        console.warn('Supabase getBySlug error, using local:', err);
      }
    }

    const all = this.getLocalMemorials();
    return all.find((m) => m.slug === slug) || null;
  }

  async addTribute(params: {
    obituaryId: string;
    authorName: string;
    relationship?: string;
    message: string;
    tributeType: TributeType;
    candleColor?: string;
    flowerType?: string;
    photoUrl?: string;
  }): Promise<{ tribute: Tribute; messageStatusNotice: string }> {
    const all = this.getLocalMemorials();
    const currentMemorial = all.find((m) => m.id === params.obituaryId);
    const moderationRequired = currentMemorial ? currentMemorial.moderationRequired : true;

    // Evaluación mediante el motor de moderación y filtro de palabras
    const evaluation = moderationService.evaluateTribute({
      message: params.message,
      authorName: params.authorName,
      moderationRequired,
    });

    const isApproved = evaluation.status === 'approved';

    const newTribute: Tribute = {
      id: 'trib-' + Date.now(),
      obituaryId: params.obituaryId,
      authorName: params.authorName,
      relationship: params.relationship || 'Familiar o Amigo',
      message: params.message,
      tributeType: params.tributeType,
      candleColor: params.candleColor || 'warm-gold',
      flowerType: params.flowerType || 'azucena',
      photoUrl: params.photoUrl,
      createdAt: new Date().toISOString(),
      isApproved,
      moderationStatus: evaluation.status,
      flaggedReason: evaluation.reason,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('condolences_and_tributes').insert({
          obituary_id: params.obituaryId,
          author_name: params.authorName,
          relationship: params.relationship,
          message: params.message,
          tribute_type: params.tributeType,
          candle_color: params.candleColor,
          flower_type: params.flowerType,
          photo_url: params.photoUrl,
          is_approved: isApproved,
          moderation_status: evaluation.status,
          flagged_reason: evaluation.reason,
        });
      } catch (err) {
        console.warn('Supabase tribute insert failed:', err);
      }
    }

    // Actualizar almacenamiento local
    const updated = all.map((m) => {
      if (m.id === params.obituaryId) {
        return {
          ...m,
          tributes: [newTribute, ...m.tributes],
          candlesCount: (isApproved && params.tributeType === 'candle') ? m.candlesCount + 1 : m.candlesCount,
          flowersCount: (isApproved && params.tributeType === 'flower') ? m.flowersCount + 1 : m.flowersCount,
        };
      }
      return m;
    });

    this.saveLocalMemorials(updated);

    let messageStatusNotice = 'Tu homenaje y luz han sido publicados en el memorial.';
    if (evaluation.status === 'pending') {
      messageStatusNotice = 'Tu mensaje ha sido recibido con respeto. Para resguardar la serenidad familiar, será visible una vez confirmado por los administradores.';
    } else if (evaluation.status === 'rejected') {
      messageStatusNotice = 'El mensaje no pudo ser publicado porque contiene expresiones incompatibles con el respeto y la solemnidad del memorial.';
    }

    return { tribute: newTribute, messageStatusNotice };
  }

  async approveTribute(obituaryId: string, tributeId: string): Promise<void> {
    const all = this.getLocalMemorials();
    const updated = all.map((m) => {
      if (m.id === obituaryId) {
        const tributes = m.tributes.map((t) => {
          if (t.id === tributeId) {
            return { ...t, isApproved: true, moderationStatus: 'approved' as const };
          }
          return t;
        });
        const newlyApproved = m.tributes.find((t) => t.id === tributeId);
        const candleIncrement = newlyApproved?.tributeType === 'candle' ? 1 : 0;
        const flowerIncrement = newlyApproved?.tributeType === 'flower' ? 1 : 0;

        return {
          ...m,
          tributes,
          candlesCount: m.candlesCount + candleIncrement,
          flowersCount: m.flowersCount + flowerIncrement,
        };
      }
      return m;
    });

    this.saveLocalMemorials(updated);

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('condolences_and_tributes')
        .update({ is_approved: true, moderation_status: 'approved' })
        .eq('id', tributeId);
    }
  }

  async rejectTribute(obituaryId: string, tributeId: string): Promise<void> {
    const all = this.getLocalMemorials();
    const updated = all.map((m) => {
      if (m.id === obituaryId) {
        return {
          ...m,
          tributes: m.tributes.filter((t) => t.id !== tributeId),
        };
      }
      return m;
    });

    this.saveLocalMemorials(updated);

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('condolences_and_tributes')
        .delete()
        .eq('id', tributeId);
    }
  }

  async updatePlan(obituaryId: string, planId: SubscriptionPlanId): Promise<void> {
    const all = this.getLocalMemorials();
    const updated = all.map((m) => (m.id === obituaryId ? { ...m, planId } : m));
    this.saveLocalMemorials(updated);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('obituaries').update({ plan_id: planId }).eq('id', obituaryId);
    }
  }

  async toggleModeration(obituaryId: string, enabled: boolean): Promise<void> {
    const all = this.getLocalMemorials();
    const updated = all.map((m) => (m.id === obituaryId ? { ...m, moderationRequired: enabled } : m));
    this.saveLocalMemorials(updated);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('obituaries').update({ moderation_required: enabled }).eq('id', obituaryId);
    }
  }

  async createObituary(obituary: Omit<Obituary, 'id' | 'candlesCount' | 'flowersCount' | 'tributes' | 'timeline' | 'gallery'>): Promise<Obituary> {
    const newObituary: Obituary = {
      ...obituary,
      id: 'obit-' + Date.now(),
      candlesCount: 0,
      flowersCount: 0,
      tributes: [],
      timeline: [],
      gallery: [],
      planId: obituary.planId || 'legado',
      moderationRequired: obituary.moderationRequired ?? true,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('obituaries').insert({
          slug: newObituary.slug,
          full_name: newObituary.fullName,
          nickname: newObituary.nickname,
          birth_date: newObituary.birthDate,
          death_date: newObituary.deathDate,
          birth_place: newObituary.birthPlace,
          death_place: newObituary.deathPlace,
          epitaph: newObituary.epitaph,
          biography: newObituary.biography,
          main_photo_url: newObituary.mainPhotoUrl,
          cover_photo_url: newObituary.coverPhotoUrl,
          is_public: newObituary.isPublic,
          plan_id: newObituary.planId,
          moderation_required: newObituary.moderationRequired,
          owner_email: newObituary.ownerEmail,
          owner_name: newObituary.ownerName,
        });
      } catch (err) {
        console.warn('Supabase create error:', err);
      }
    }

    const all = this.getLocalMemorials();
    this.saveLocalMemorials([newObituary, ...all]);
    return newObituary;
  }
}

export const memorialService = new MemorialService();
