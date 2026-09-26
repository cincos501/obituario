-- ==============================================================================
-- HOBITUARIO - PLATAFORMA SAAS DE MEMORIALES Y RECUERDOS ETERNOS
-- Esquema DDL Completo para Supabase (PostgreSQL 15+)
-- Incluye Tablas, Índices, Triggers de Contadores, RLS y Políticas de Seguridad
-- ==============================================================================

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE PERFILES DE USUARIO (Super Admin y Familias)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'family' CHECK (role IN ('family', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE MEMORIALES (OBITUARIES)
CREATE TABLE IF NOT EXISTS public.obituaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  nickname TEXT,
  birth_date DATE NOT NULL,
  death_date DATE NOT NULL,
  birth_place TEXT,
  death_place TEXT,
  epitaph TEXT NOT NULL,
  biography TEXT NOT NULL,
  main_photo_url TEXT NOT NULL,
  cover_photo_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  access_pin TEXT DEFAULT '1234',
  plan_id TEXT NOT NULL DEFAULT 'legado' CHECK (plan_id IN ('esencial', 'legado', 'infinito')),
  moderation_required BOOLEAN DEFAULT TRUE,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  owner_name TEXT,
  owner_email TEXT,
  font_family TEXT DEFAULT 'serif-cormorant',
  theme_preset TEXT DEFAULT 'ivory-warm',
  primary_accent TEXT DEFAULT 'gold',
  background_music_url TEXT,
  candles_count INTEGER DEFAULT 0,
  flowers_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA DE SERVICIOS Y CEREMONIAS FUNERARIAS
CREATE TABLE IF NOT EXISTS public.funeral_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obituary_id UUID NOT NULL REFERENCES public.obituaries(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN (
    'velatorio', 
    'misa_cuerpo_presente', 
    'sepelio', 
    'cremacion', 
    'homenaje_virtual', 
    'novenario', 
    'cabo_de_ano'
  )),
  title TEXT NOT NULL,
  location_name TEXT NOT NULL,
  address TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  photo_url TEXT,
  google_maps_url TEXT,
  coordinates_lat DOUBLE PRECISION DEFAULT -21.5330, -- Coordenadas predeterminadas (ej. Tarija)
  coordinates_lng DOUBLE PRECISION DEFAULT -64.7330,
  livestream_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA DE HITOS DE LA LÍNEA DE TIEMPO (BIOGRAFÍA CRONOLÓGICA)
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obituary_id UUID NOT NULL REFERENCES public.obituaries(id) ON DELETE CASCADE,
  year TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA DE CONDOLENCIAS, VELAS Y FLORES (TRIBUTOS VIRTUALES)
CREATE TABLE IF NOT EXISTS public.condolences_and_tributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obituary_id UUID NOT NULL REFERENCES public.obituaries(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT,
  relationship TEXT,
  message TEXT NOT NULL,
  tribute_type TEXT NOT NULL CHECK (tribute_type IN ('candle', 'flower', 'message')),
  candle_color TEXT DEFAULT 'warm-gold',
  flower_type TEXT DEFAULT 'rosa-blanca',
  photo_url TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  moderation_status TEXT NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  flagged_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLA DE GALERÍA Y MULTIMEDIA FAMILIAR
CREATE TABLE IF NOT EXISTS public.memory_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obituary_id UUID NOT NULL REFERENCES public.obituaries(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  caption TEXT,
  author_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ÍNDICES DE RENDIMIENTO PARA ACCESO RÁPIDO
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_obituaries_slug ON public.obituaries(slug);
CREATE INDEX IF NOT EXISTS idx_funeral_services_obituary ON public.funeral_services(obituary_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_obituary ON public.timeline_events(obituary_id);
CREATE INDEX IF NOT EXISTS idx_tributes_obituary_status ON public.condolences_and_tributes(obituary_id, moderation_status);

-- ==============================================================================
-- TRIGGER PARA ACTUALIZAR CONTADORES DE VELAS Y FLORES EN EL MEMORIAL
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_tribute_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.is_approved = TRUE) OR (TG_OP = 'UPDATE' AND OLD.is_approved = FALSE AND NEW.is_approved = TRUE) THEN
    IF NEW.tribute_type = 'candle' THEN
      UPDATE public.obituaries SET candles_count = candles_count + 1 WHERE id = NEW.obituary_id;
    ELSIF NEW.tribute_type = 'flower' THEN
      UPDATE public.obituaries SET flowers_count = flowers_count + 1 WHERE id = NEW.obituary_id;
    END IF;
  ELSIF (TG_OP = 'DELETE' AND OLD.is_approved = TRUE) OR (TG_OP = 'UPDATE' AND OLD.is_approved = TRUE AND NEW.is_approved = FALSE) THEN
    IF OLD.tribute_type = 'candle' THEN
      UPDATE public.obituaries SET candles_count = GREATEST(0, candles_count - 1) WHERE id = OLD.obituary_id;
    ELSIF OLD.tribute_type = 'flower' THEN
      UPDATE public.obituaries SET flowers_count = GREATEST(0, flowers_count - 1) WHERE id = OLD.obituary_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_tribute_counters ON public.condolences_and_tributes;
CREATE TRIGGER trigger_tribute_counters
  AFTER INSERT OR UPDATE OR DELETE ON public.condolences_and_tributes
  FOR EACH ROW EXECUTE FUNCTION public.handle_tribute_counters();

-- ==============================================================================
-- SEGURIDAD ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.obituaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funeral_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condolences_and_tributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. Políticas de Memoriales Públicos
CREATE POLICY "Memoriales públicos son visibles para cualquier visitante"
  ON public.obituaries FOR SELECT
  USING (is_public = TRUE OR auth.role() = 'authenticated');

CREATE POLICY "Super admin y dueños pueden modificar su memorial"
  ON public.obituaries FOR ALL
  USING (auth.uid() = owner_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'
  ));

-- 2. Políticas de Servicios Funerarios
CREATE POLICY "Servicios funerarios son públicos"
  ON public.funeral_services FOR SELECT
  USING (TRUE);

CREATE POLICY "Familia y admin pueden editar servicios"
  ON public.funeral_services FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.obituaries 
    WHERE id = funeral_services.obituary_id 
    AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'))
  ));

-- 3. Políticas de Hitos de Vida
CREATE POLICY "Hitos de vida son públicos"
  ON public.timeline_events FOR SELECT
  USING (TRUE);

CREATE POLICY "Familia y admin pueden editar hitos"
  ON public.timeline_events FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.obituaries 
    WHERE id = timeline_events.obituary_id 
    AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'))
  ));

-- 4. Políticas de Tributos y Condolencias
CREATE POLICY "Cualquier persona puede leer homenajes aprobados"
  ON public.condolences_and_tributes FOR SELECT
  USING (is_approved = TRUE OR moderation_status = 'approved');

CREATE POLICY "Cualquier persona puede ofrendar una vela o flor"
  ON public.condolences_and_tributes FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Familia y admin pueden moderar condolencias"
  ON public.condolences_and_tributes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.obituaries 
    WHERE id = condolences_and_tributes.obituary_id 
    AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'))
  ));

-- ==============================================================================
-- DATOS INICIALES SEMILLA (SEED DEMO)
-- ==============================================================================
INSERT INTO public.obituaries (
  id,
  slug,
  full_name,
  nickname,
  birth_date,
  death_date,
  birth_place,
  death_place,
  epitaph,
  biography,
  main_photo_url,
  cover_photo_url,
  is_public,
  access_pin,
  plan_id,
  moderation_required,
  owner_name,
  owner_email,
  font_family,
  theme_preset,
  primary_accent,
  candles_count,
  flowers_count
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'carlos-alberto-mendoza-1948',
  'Dr. Carlos Alberto Mendoza Vega',
  'Carlitos',
  '1948-03-15',
  '2026-03-20',
  'Tarija, Bolivia',
  'La Paz, Bolivia',
  '«Tu vocación curó cuerpos, tu bondad abrigó almas. Tu luz vivirá por siempre en cada vida que tocaste.»',
  'El Dr. Carlos Alberto Mendoza Vega dedicó más de cuatro décadas de su vida al servicio de la medicina comunitaria y la docencia universitaria. Graduado con honores de la Universidad Mayor de San Andrés, ejerció con admirable empatía y entrega desinteresada en zonas rurales y urbanas.',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&q=80&w=1600',
  TRUE,
  '1948',
  'legado',
  TRUE,
  'Familia Mendoza',
  'familiar@hobituario.com',
  'serif-cormorant',
  'ivory-warm',
  'gold',
  12,
  5
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.funeral_services (
  obituary_id,
  service_type,
  title,
  location_name,
  address,
  date,
  time,
  photo_url,
  coordinates_lat,
  coordinates_lng,
  notes
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'velatorio',
  'Capilla Ardiente y Velatorio Solemne',
  'Parroquia San Roque - Salón San Cayetano',
  'Plaza Campero esq. Corrado, Zona San Roque, Tarija',
  '2026-03-27',
  '10:00 AM - 22:00 PM',
  'https://images.unsplash.com/photo-1548625361-1959779dfb8a?auto=format&fit=crop&w=800&q=80',
  -21.5330,
  -64.7330,
  'Se celebrará una liturgia de oración a las 19:30. Se agradece vestir prendas sobrias.'
), (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'misa_cuerpo_presente',
  'Misa de Cuerpo Presente',
  'Catedral Metropolitana de Tarija',
  'Plaza Luis de Fuentes, Centro Histórico, Tarija',
  '2026-03-28',
  '11:00 AM',
  'https://images.unsplash.com/photo-1543872084-c7bd3822856f?auto=format&fit=crop&w=800&q=80',
  -21.5323,
  -64.7338,
  'Concelebrada por el clero diocesano y transmitida en directo para familiares en el exterior.'
), (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'sepelio',
  'Cortejo Fúnebre y Descanso Eterno',
  'Cementerio General de Tarija - Pabellón Los Ángeles',
  'Calle Isaac Attie y Av. Membrillos, Tarija',
  '2026-03-28',
  '14:30 PM',
  'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=800&q=80',
  -21.5390,
  -64.7280,
  'Acompañamiento a pie desde la plaza de San Roque hasta el pabellón familiar.'
) ON CONFLICT DO NOTHING;

INSERT INTO public.timeline_events (
  obituary_id,
  year,
  title,
  description,
  photo_url
) VALUES 
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '1948',
  'Nacimiento en San Lorenzo, Tarija',
  'Nació en el seno de una familia de maestros de provincia. Desde temprana edad demostró gran vocación por el prójimo.',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '1974',
  'Graduación en Medicina con Máximos Honores',
  'Culminó sus estudios universitarios y realizó su servicio social con abnegación en comunidades del Chaco.',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80'
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '1979',
  'Matrimonio con Mariana Valdivia',
  'Unieron sus vidas para edificar un hogar de principios intachables, criando a sus tres hijos con amor incondicional.',
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
) ON CONFLICT DO NOTHING;
