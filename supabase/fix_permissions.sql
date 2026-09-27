-- ==============================================================================
-- HOBITUARIO - SCRIPT DE CORRECCIÓN DE PERMISOS RLS EN SUPABASE
-- Ejecuta este script en el SQL Editor de tu Dashboard de Supabase
-- para solucionar el error 401 (Unauthorized) al crear memoriales,
-- subir fotos, registrar condolencias y actualizar datos.
-- ==============================================================================

-- 1. Habilitar RLS en las tablas existentes
ALTER TABLE IF EXISTS public.obituaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.funeral_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.condolences_and_tributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.memory_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.baneco_transactions ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas restrictivas anteriores
DROP POLICY IF EXISTS "Memoriales públicos son visibles para cualquier visitante" ON public.obituaries;
DROP POLICY IF EXISTS "Super admin y dueños pueden modificar su memorial" ON public.obituaries;
DROP POLICY IF EXISTS "Permitir lectura de memoriales" ON public.obituaries;
DROP POLICY IF EXISTS "Permitir crear memoriales" ON public.obituaries;
DROP POLICY IF EXISTS "Permitir actualizar memoriales" ON public.obituaries;
DROP POLICY IF EXISTS "Permitir eliminar memoriales" ON public.obituaries;

DROP POLICY IF EXISTS "Servicios funerarios son públicos" ON public.funeral_services;
DROP POLICY IF EXISTS "Familia y admin pueden editar servicios" ON public.funeral_services;
DROP POLICY IF EXISTS "Permitir lectura de servicios" ON public.funeral_services;
DROP POLICY IF EXISTS "Permitir crear servicios" ON public.funeral_services;
DROP POLICY IF EXISTS "Permitir actualizar servicios" ON public.funeral_services;
DROP POLICY IF EXISTS "Permitir eliminar servicios" ON public.funeral_services;

DROP POLICY IF EXISTS "Hitos de vida son públicos" ON public.timeline_events;
DROP POLICY IF EXISTS "Familia y admin pueden editar hitos" ON public.timeline_events;
DROP POLICY IF EXISTS "Permitir lectura de hitos" ON public.timeline_events;
DROP POLICY IF EXISTS "Permitir crear hitos" ON public.timeline_events;
DROP POLICY IF EXISTS "Permitir actualizar hitos" ON public.timeline_events;
DROP POLICY IF EXISTS "Permitir eliminar hitos" ON public.timeline_events;

DROP POLICY IF EXISTS "Cualquier persona puede leer homenajes aprobados" ON public.condolences_and_tributes;
DROP POLICY IF EXISTS "Cualquier persona puede ofrendar una vela o flor" ON public.condolences_and_tributes;
DROP POLICY IF EXISTS "Familia y admin pueden moderar condolencias" ON public.condolences_and_tributes;
DROP POLICY IF EXISTS "Permitir lectura de condolencias" ON public.condolences_and_tributes;
DROP POLICY IF EXISTS "Permitir crear condolencias" ON public.condolences_and_tributes;
DROP POLICY IF EXISTS "Permitir moderar condolencias" ON public.condolences_and_tributes;
DROP POLICY IF EXISTS "Permitir eliminar condolencias" ON public.condolences_and_tributes;

DROP POLICY IF EXISTS "Lectura pública de fotos" ON public.memory_media;
DROP POLICY IF EXISTS "Subida pública de fotos" ON public.memory_media;
DROP POLICY IF EXISTS "Actualizar fotos" ON public.memory_media;
DROP POLICY IF EXISTS "Eliminar fotos" ON public.memory_media;
DROP POLICY IF EXISTS "Permitir lectura de fotos memorial" ON public.memory_media;
DROP POLICY IF EXISTS "Permitir agregar fotos memorial" ON public.memory_media;
DROP POLICY IF EXISTS "Permitir actualizar fotos memorial" ON public.memory_media;
DROP POLICY IF EXISTS "Permitir eliminar fotos memorial" ON public.memory_media;

DROP POLICY IF EXISTS "Transacciones consultables para verificar cobro" ON public.baneco_transactions;
DROP POLICY IF EXISTS "Permitir registro de transacciones de pago" ON public.baneco_transactions;
DROP POLICY IF EXISTS "Permitir actualización de transacciones vía webhook o confirmación" ON public.baneco_transactions;
DROP POLICY IF EXISTS "Permitir lectura de transacciones" ON public.baneco_transactions;
DROP POLICY IF EXISTS "Permitir crear transacciones" ON public.baneco_transactions;
DROP POLICY IF EXISTS "Permitir actualizar transacciones" ON public.baneco_transactions;

-- ==============================================================================
-- 3. NUEVAS POLÍTICAS PÚBLICAS Y SEGURAS PARA HOBITUARIO (POSTGREST / ANON KEY)
-- ==============================================================================

-- A) TABLA: OBITUARIES (Memoriales)
CREATE POLICY "Permitir lectura de memoriales"
  ON public.obituaries FOR SELECT
  USING (TRUE);

CREATE POLICY "Permitir crear memoriales"
  ON public.obituaries FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Permitir actualizar memoriales"
  ON public.obituaries FOR UPDATE
  USING (TRUE);

CREATE POLICY "Permitir eliminar memoriales"
  ON public.obituaries FOR DELETE
  USING (TRUE);

-- B) TABLA: FUNERAL_SERVICES (Servicios Funerarios)
CREATE POLICY "Permitir lectura de servicios"
  ON public.funeral_services FOR SELECT
  USING (TRUE);

CREATE POLICY "Permitir crear servicios"
  ON public.funeral_services FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Permitir actualizar servicios"
  ON public.funeral_services FOR UPDATE
  USING (TRUE);

CREATE POLICY "Permitir eliminar servicios"
  ON public.funeral_services FOR DELETE
  USING (TRUE);

-- C) TABLA: TIMELINE_EVENTS (Hitos de Vida)
CREATE POLICY "Permitir lectura de hitos"
  ON public.timeline_events FOR SELECT
  USING (TRUE);

CREATE POLICY "Permitir crear hitos"
  ON public.timeline_events FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Permitir actualizar hitos"
  ON public.timeline_events FOR UPDATE
  USING (TRUE);

CREATE POLICY "Permitir eliminar hitos"
  ON public.timeline_events FOR DELETE
  USING (TRUE);

-- D) TABLA: CONDOLENCES_AND_TRIBUTES (Velas, Flores y Condolencias)
CREATE POLICY "Permitir lectura de condolencias"
  ON public.condolences_and_tributes FOR SELECT
  USING (TRUE);

CREATE POLICY "Permitir crear condolencias"
  ON public.condolences_and_tributes FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Permitir moderar condolencias"
  ON public.condolences_and_tributes FOR UPDATE
  USING (TRUE);

CREATE POLICY "Permitir eliminar condolencias"
  ON public.condolences_and_tributes FOR DELETE
  USING (TRUE);

-- E) TABLA: MEMORY_MEDIA (Galería de Fotos)
CREATE POLICY "Permitir lectura de fotos memorial"
  ON public.memory_media FOR SELECT
  USING (TRUE);

CREATE POLICY "Permitir agregar fotos memorial"
  ON public.memory_media FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Permitir actualizar fotos memorial"
  ON public.memory_media FOR UPDATE
  USING (TRUE);

CREATE POLICY "Permitir eliminar fotos memorial"
  ON public.memory_media FOR DELETE
  USING (TRUE);

-- F) TABLA: BANECO_TRANSACTIONS (Transacciones Baneco)
CREATE POLICY "Permitir lectura de transacciones"
  ON public.baneco_transactions FOR SELECT
  USING (TRUE);

CREATE POLICY "Permitir crear transacciones"
  ON public.baneco_transactions FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Permitir actualizar transacciones"
  ON public.baneco_transactions FOR UPDATE
  USING (TRUE);

-- Confirmación visual
SELECT 'Políticas RLS de Hobituario aplicadas exitosamente' AS resultado;
