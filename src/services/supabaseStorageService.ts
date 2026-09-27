import { supabase, isSupabaseConfigured } from './supabase';

export const BUCKET_NAME = 'memoriales';

export type StorageFolder = 'portraits' | 'covers' | 'ceremonies' | 'timeline' | 'tributes';

export const supabaseStorageService = {
  /**
   * Sube una imagen (archivo File o DataURL base64) al bucket 'memoriales' en Supabase Storage.
   * Retorna la URL pública accesible por cualquier visitante.
   */
  async uploadImage(
    fileOrDataUrl: File | string,
    folder: StorageFolder = 'portraits',
    slug: string = 'memorial'
  ): Promise<string> {
    // Si Supabase no está configurado, devolver el dataUrl localmente como fallback
    if (!isSupabaseConfigured || !supabase) {
      if (typeof fileOrDataUrl === 'string') {
        return fileOrDataUrl;
      }
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(fileOrDataUrl);
      });
    }

    try {
      let fileBlob: Blob;
      let contentType = 'image/jpeg';
      let extension = 'jpg';

      if (typeof fileOrDataUrl === 'string') {
        // Convertir dataURL base64 a Blob
        if (fileOrDataUrl.startsWith('data:')) {
          const parts = fileOrDataUrl.split(',');
          const mimeMatch = parts[0].match(/:(.*?);/);
          contentType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          extension = contentType.split('/')[1] || 'jpg';
          const byteString = atob(parts[1]);
          const arrayBuffer = new ArrayBuffer(byteString.length);
          const uint8Array = new Uint8Array(arrayBuffer);
          for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
          }
          fileBlob = new Blob([arrayBuffer], { type: contentType });
        } else if (fileOrDataUrl.startsWith('http')) {
          // Ya es una URL pública
          return fileOrDataUrl;
        } else {
          return fileOrDataUrl;
        }
      } else {
        fileBlob = fileOrDataUrl;
        contentType = fileOrDataUrl.type || 'image/jpeg';
        extension = fileOrDataUrl.name.split('.').pop() || 'jpg';
      }

      const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 40);
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 1000);
      const filePath = `${folder}/${cleanSlug}-${timestamp}-${randomSuffix}.${extension}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, fileBlob, {
          contentType,
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.warn('Error al subir a Supabase Storage (se usará copia local):', error.message);
        if (typeof fileOrDataUrl === 'string') return fileOrDataUrl;
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(fileOrDataUrl);
        });
      }

      // Obtener URL pública directa
      const { data: publicData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

      return publicData.publicUrl;
    } catch (err) {
      console.error('Error inesperado en uploadImage:', err);
      if (typeof fileOrDataUrl === 'string') return fileOrDataUrl;
      return '';
    }
  },

  /**
   * Elimina un archivo del bucket 'memoriales' a partir de su URL pública.
   */
  async deleteImage(publicUrl: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase || !publicUrl.includes(BUCKET_NAME)) {
      return false;
    }

    try {
      // Extraer la ruta relativa dentro del bucket
      const parts = publicUrl.split(`/${BUCKET_NAME}/`);
      if (parts.length < 2) return false;
      const filePath = parts[1];

      const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      return !error;
    } catch {
      return false;
    }
  },
};
