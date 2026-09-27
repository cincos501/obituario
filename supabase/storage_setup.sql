-- ==============================================================================
-- HOBITUARIO - CONFIGURACIÓN DE SUPABASE STORAGE (BUCKET 'memoriales')
-- Ejecutar en el SQL Editor de tu proyecto en Supabase (https://supabase.com)
-- ==============================================================================

-- 1. CREAR EL BUCKET PÚBLICO 'memoriales' (Si no existe)
-- Public = true permite que las imágenes del memorial y del QR se visualicen
-- sin requerir URLs firmadas con vencimiento.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'memoriales',
  'memoriales',
  TRUE,
  10485760, -- 10 MB máximo por imagen
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- NOTA: storage.objects ya tiene RLS habilitado por defecto en Supabase.
-- No se debe ejecutar ALTER TABLE (provoca el error 42501 por permisos de sistema).

-- 3. ELIMINAR POLÍTICAS PREVIAS PARA EVITAR CONFLICTOS
DROP POLICY IF EXISTS "Lectura pública de memoriales" ON storage.objects;
DROP POLICY IF EXISTS "Subida de imágenes de memoriales" ON storage.objects;
DROP POLICY IF EXISTS "Actualización de imágenes de memoriales" ON storage.objects;
DROP POLICY IF EXISTS "Eliminación de imágenes de memoriales" ON storage.objects;

-- 4. POLÍTICA DE LECTURA PÚBLICA (SELECT)
-- Permite que los visitantes web y quienes escanean el código QR en la lápida
-- puedan ver las fotos del ser querido, portadas, ceremonias e hitos.
CREATE POLICY "Lectura pública de memoriales"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'memoriales');

-- 5. POLÍTICA DE SUBIDA E INSERCIÓN (INSERT)
-- Permite al creador familiar y usuarios web subir retratos, portadas y fotos.
CREATE POLICY "Subida de imágenes de memoriales"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'memoriales'
    AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
  );

-- 6. POLÍTICA DE ACTUALIZACIÓN (UPDATE)
-- Permite a los familiares y administradores recortar, reemplazar o actualizar fotos.
CREATE POLICY "Actualización de imágenes de memoriales"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'memoriales'
    AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
  );

-- 7. POLÍTICA DE ELIMINACIÓN (DELETE)
-- Permite remover imágenes no deseadas del memorial.
CREATE POLICY "Eliminación de imágenes de memoriales"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'memoriales'
    AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
  );

-- ==============================================================================
-- ESTRUCTURA DE SUBCARPETAS RECOMENDADA DENTRO DEL BUCKET 'memoriales':
-- ==============================================================================
-- memoriales/
-- ├── portraits/   -> Retratos principales del ser querido (ej. don-carlos-123.jpg)
-- ├── covers/      -> Fotografías de portada panorámica (ej. portada-paisaje-123.jpg)
-- ├── ceremonies/  -> Capillas ardientes, templos, camposantos (ej. san-roque-123.jpg)
-- ├── timeline/    -> Fotos históricas de hitos de vida (ej. matrimonio-1979.jpg)
-- └── tributes/    -> Fotos adjuntas por amigos en condolencias
-- ==============================================================================
