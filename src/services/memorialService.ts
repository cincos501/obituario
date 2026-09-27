import { 
  Obituary, 
  Tribute, 
  TributeType, 
  SubscriptionPlanId, 
  FuneralService, 
  TimelineMilestone,
  MemorialFont,
  MemorialThemePreset,
  MemorialAccent
} from '../types/memorial';
import { INITIAL_MEMORIALS } from '../data/mockMemorials';
import { supabase, isSupabaseConfigured } from './supabase';
import { moderationService } from './moderationService';

const STORAGE_KEY = 'hobituario_memorials_v1';

function mapDbToObituary(row: any): Obituary {
  return {
    id: row.id,
    slug: row.slug,
    fullName: row.full_name || '',
    nickname: row.nickname || undefined,
    birthDate: row.birth_date ? String(row.birth_date).slice(0, 10) : '',
    deathDate: row.death_date ? String(row.death_date).slice(0, 10) : '',
    birthPlace: row.birth_place || undefined,
    deathPlace: row.death_place || undefined,
    epitaph: row.epitaph || '',
    biography: row.biography || '',
    mainPhotoUrl: row.main_photo_url || '',
    coverPhotoUrl: row.cover_photo_url || undefined,
    isPublic: row.is_public ?? true,
    accessPin: row.access_pin || '1234',
    planId: (row.plan_id as SubscriptionPlanId) || 'legado',
    moderationRequired: row.moderation_required ?? true,
    ownerEmail: row.owner_email || undefined,
    ownerName: row.owner_name || undefined,
    fontFamily: (row.font_family as MemorialFont) || 'serif-cormorant',
    themePreset: (row.theme_preset as MemorialThemePreset) || 'ivory-warm',
    primaryAccent: (row.primary_accent as MemorialAccent) || 'gold',
    backgroundMusicUrl: row.background_music_url || undefined,
    candlesCount: Number(row.candles_count) || 0,
    flowersCount: Number(row.flowers_count) || 0,
    services: (row.services || []).map((s: any): FuneralService => ({
      id: s.id,
      obituaryId: s.obituary_id || row.id,
      serviceType: s.service_type,
      title: s.title,
      locationName: s.location_name,
      address: s.address,
      date: s.date ? String(s.date).slice(0, 10) : '',
      time: s.time,
      photoUrl: s.photo_url || undefined,
      googleMapsUrl: s.google_maps_url || undefined,
      coordinatesLat: s.coordinates_lat ? Number(s.coordinates_lat) : undefined,
      coordinatesLng: s.coordinates_lng ? Number(s.coordinates_lng) : undefined,
      livestreamUrl: s.livestream_url || undefined,
      notes: s.notes || undefined,
    })),
    timeline: (row.timeline || []).map((t: any): TimelineMilestone => ({
      id: t.id,
      obituaryId: t.obituary_id || row.id,
      year: String(t.year),
      title: t.title,
      description: t.description,
      photoUrl: t.photo_url || undefined,
    })),
    tributes: (row.tributes || []).map((tr: any): Tribute => ({
      id: tr.id,
      obituaryId: tr.obituary_id || row.id,
      authorName: tr.author_name,
      authorEmail: tr.author_email || undefined,
      relationship: tr.relationship || undefined,
      message: tr.message,
      tributeType: tr.tribute_type,
      candleColor: tr.candle_color || undefined,
      flowerType: tr.flower_type || undefined,
      photoUrl: tr.photo_url || undefined,
      createdAt: tr.created_at,
      isApproved: tr.is_approved ?? false,
      moderationStatus: tr.moderation_status || 'pending',
      flaggedReason: tr.flagged_reason || undefined,
    })),
    gallery: [],
  };
}

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
          .select(`
            *,
            services:funeral_services(*),
            timeline:timeline_events(*),
            tributes:condolences_and_tributes(*)
          `)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped = data.map(mapDbToObituary);
          this.saveLocalMemorials(mapped);
          return mapped;
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
          .select(`
            *,
            services:funeral_services(*),
            timeline:timeline_events(*),
            tributes:condolences_and_tributes(*)
          `)
          .eq('slug', slug)
          .single();

        if (!error && data) {
          return mapDbToObituary(data);
        }
      } catch (err) {
        console.warn('Supabase getBySlug error, using local:', err);
      }
    }

    const all = this.getLocalMemorials();
    return all.find((m) => m.slug === slug) || null;
  }

  async createObituary(
    obituary: Omit<Obituary, 'id' | 'candlesCount' | 'flowersCount' | 'tributes' | 'timeline' | 'gallery'> & {
      services?: FuneralService[];
      timeline?: TimelineMilestone[];
    }
  ): Promise<Obituary> {
    let newId = 'obit-' + Date.now();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('obituaries')
          .insert({
            slug: obituary.slug,
            full_name: obituary.fullName,
            nickname: obituary.nickname || null,
            birth_date: obituary.birthDate,
            death_date: obituary.deathDate,
            birth_place: obituary.birthPlace || null,
            death_place: obituary.deathPlace || null,
            epitaph: obituary.epitaph,
            biography: obituary.biography,
            main_photo_url: obituary.mainPhotoUrl,
            cover_photo_url: obituary.coverPhotoUrl || null,
            is_public: obituary.isPublic ?? true,
            access_pin: obituary.accessPin || '1234',
            plan_id: obituary.planId || 'legado',
            moderation_required: obituary.moderationRequired ?? true,
            owner_email: obituary.ownerEmail || null,
            owner_name: obituary.ownerName || null,
            font_family: obituary.fontFamily || 'serif-cormorant',
            theme_preset: obituary.themePreset || 'ivory-warm',
            primary_accent: obituary.primaryAccent || 'gold',
            candles_count: 0,
            flowers_count: 0,
          })
          .select()
          .single();

        if (!error && data) {
          newId = data.id;

          // Insertar servicios iniciales si existen
          if (obituary.services && obituary.services.length > 0) {
            const servicesToInsert = obituary.services.map((srv) => ({
              obituary_id: newId,
              service_type: srv.serviceType,
              title: srv.title,
              location_name: srv.locationName,
              address: srv.address,
              date: srv.date,
              time: srv.time,
              photo_url: srv.photoUrl || null,
              google_maps_url: srv.googleMapsUrl || null,
              coordinates_lat: srv.coordinatesLat || null,
              coordinates_lng: srv.coordinatesLng || null,
              livestream_url: srv.livestreamUrl || null,
              notes: srv.notes || null,
            }));
            await supabase.from('funeral_services').insert(servicesToInsert);
          }

          // Insertar hitos iniciales si existen
          if (obituary.timeline && obituary.timeline.length > 0) {
            const timelineToInsert = obituary.timeline.map((tm) => ({
              obituary_id: newId,
              year: tm.year,
              title: tm.title,
              description: tm.description,
              photo_url: tm.photoUrl || null,
            }));
            await supabase.from('timeline_events').insert(timelineToInsert);
          }
        }
      } catch (err) {
        console.warn('Supabase create error:', err);
      }
    }

    const newObituary: Obituary = {
      ...obituary,
      id: newId,
      candlesCount: 0,
      flowersCount: 0,
      tributes: [],
      timeline: obituary.timeline || [],
      gallery: [],
      services: obituary.services || [],
      planId: obituary.planId || 'legado',
      moderationRequired: obituary.moderationRequired ?? true,
    };

    const all = this.getLocalMemorials();
    this.saveLocalMemorials([newObituary, ...all]);
    return newObituary;
  }

  async updateObituary(updated: Obituary): Promise<void> {
    // 1. Guardar en Supabase si está disponible
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('obituaries')
          .update({
            full_name: updated.fullName,
            nickname: updated.nickname || null,
            birth_date: updated.birthDate,
            death_date: updated.deathDate,
            birth_place: updated.birthPlace || null,
            death_place: updated.deathPlace || null,
            epitaph: updated.epitaph,
            biography: updated.biography,
            main_photo_url: updated.mainPhotoUrl,
            cover_photo_url: updated.coverPhotoUrl || null,
            is_public: updated.isPublic,
            access_pin: updated.accessPin || '1234',
            plan_id: updated.planId,
            moderation_required: updated.moderationRequired,
            font_family: updated.fontFamily || 'serif-cormorant',
            theme_preset: updated.themePreset || 'ivory-warm',
            primary_accent: updated.primaryAccent || 'gold',
            updated_at: new Date().toISOString(),
          })
          .eq('id', updated.id);

        // Sincronizar servicios
        if (updated.services) {
          await supabase.from('funeral_services').delete().eq('obituary_id', updated.id);
          if (updated.services.length > 0) {
            const mappedServices = updated.services.map((s) => ({
              obituary_id: updated.id,
              service_type: s.serviceType,
              title: s.title,
              location_name: s.locationName,
              address: s.address,
              date: s.date,
              time: s.time,
              photo_url: s.photoUrl || null,
              google_maps_url: s.googleMapsUrl || null,
              coordinates_lat: s.coordinatesLat || null,
              coordinates_lng: s.coordinatesLng || null,
              livestream_url: s.livestreamUrl || null,
              notes: s.notes || null,
            }));
            await supabase.from('funeral_services').insert(mappedServices);
          }
        }

        // Sincronizar timeline
        if (updated.timeline) {
          await supabase.from('timeline_events').delete().eq('obituary_id', updated.id);
          if (updated.timeline.length > 0) {
            const mappedTimeline = updated.timeline.map((tm) => ({
              obituary_id: updated.id,
              year: tm.year,
              title: tm.title,
              description: tm.description,
              photo_url: tm.photoUrl || null,
            }));
            await supabase.from('timeline_events').insert(mappedTimeline);
          }
        }
      } catch (err) {
        console.warn('Supabase update failed:', err);
      }
    }

    // 2. Guardar en almacenamiento local
    const all = this.getLocalMemorials();
    const updatedList = all.map((m) => (m.id === updated.id ? updated : m));
    this.saveLocalMemorials(updatedList);
  }

  async addTribute(params: {
    obituaryId: string;
    authorName: string;
    authorEmail?: string;
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
    let tributeId = 'trib-' + Date.now();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('condolences_and_tributes')
          .insert({
            obituary_id: params.obituaryId,
            author_name: params.authorName,
            author_email: params.authorEmail || null,
            relationship: params.relationship || null,
            message: params.message,
            tribute_type: params.tributeType,
            candle_color: params.candleColor || null,
            flower_type: params.flowerType || null,
            photo_url: params.photoUrl || null,
            is_approved: isApproved,
            moderation_status: evaluation.status,
            flagged_reason: evaluation.reason || null,
          })
          .select()
          .single();

        if (!error && data) {
          tributeId = data.id;
        }
      } catch (err) {
        console.warn('Supabase tribute insert failed:', err);
      }
    }

    const newTribute: Tribute = {
      id: tributeId,
      obituaryId: params.obituaryId,
      authorName: params.authorName,
      authorEmail: params.authorEmail,
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
}

export const memorialService = new MemorialService();
