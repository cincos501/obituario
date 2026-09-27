'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  CheckCircle, 
  Crop, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Check, 
  Maximize2,
  Loader2
} from 'lucide-react';
import { supabaseStorageService, StorageFolder } from '../../services/supabaseStorageService';

interface Props {
  label: string;
  initialUrl?: string;
  onImageSelected: (dataUrl: string) => void;
  helperText?: string;
  aspectRatio?: 'square' | 'wide' | 'round';
  cropShape?: 'round' | 'rect' | 'wide';
  folder?: StorageFolder;
}

export const ImageUploader = ({
  label,
  initialUrl = '',
  onImageSelected,
  helperText = 'Formatos recomendados: JPG, PNG o WebP. Máx. 10MB.',
  aspectRatio = 'square',
  cropShape,
  folder = 'portraits',
}: Props) => {
  const [previewUrl, setPreviewUrl] = useState<string>(initialUrl);
  const [originalUrl, setOriginalUrl] = useState<string>(initialUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  
  // Estados del recortador interactivo
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperBoxRef = useRef<HTMLDivElement>(null);

  const effectiveShape = cropShape || (aspectRatio === 'round' ? 'round' : aspectRatio === 'wide' ? 'wide' : 'rect');

  // Sincronizar initialUrl si cambia desde el padre
  useEffect(() => {
    if (initialUrl && initialUrl !== previewUrl) {
      setPreviewUrl(initialUrl);
      setOriginalUrl(initialUrl);
    }
  }, [initialUrl]);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setOriginalUrl(result);
      setPreviewUrl(result);
      // Restablecer parámetros de recorte y abrir modal automáticamente
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl('');
    setOriginalUrl('');
    setFileName('');
    onImageSelected('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Manejo de arrastre/paneo dentro del modal
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPanning(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isPanning, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, handleMouseMove, handleMouseUp]);

  // Touch support for mobile dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPanning || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };

  // Función para aplicar el recorte en un Canvas
  const handleApplyCrop = () => {
    const img = imageRef.current;
    const box = cropperBoxRef.current;
    if (!img || !box) {
      onImageSelected(originalUrl);
      setIsCropperOpen(false);
      return;
    }

    // Dimensiones del canvas exportado
    let outputWidth = 1000;
    let outputHeight = 1000;
    if (effectiveShape === 'wide') {
      outputWidth = 1200;
      outputHeight = 675; // 16:9
    } else if (effectiveShape === 'rect') {
      outputWidth = 1000;
      outputHeight = 750; // 4:3
    }

    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      onImageSelected(originalUrl);
      setIsCropperOpen(false);
      return;
    }

    // Fondo blanco suave para transparencias
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, outputWidth, outputHeight);

    // Calcular la relación de escala de la caja de recorte al canvas final
    const boxRect = box.getBoundingClientRect();
    const scaleRatio = outputWidth / boxRect.width;

    // Centro del canvas
    const canvasCenterX = outputWidth / 2;
    const canvasCenterY = outputHeight / 2;

    ctx.save();
    // Trasladar al centro y aplicar el pan y zoom del usuario
    ctx.translate(canvasCenterX + pan.x * scaleRatio, canvasCenterY + pan.y * scaleRatio);
    ctx.scale(zoom, zoom);

    // Calcular el tamaño base de la imagen ajustada a la caja
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const boxAspect = boxRect.width / boxRect.height;
    
    let drawWidth = boxRect.width * scaleRatio;
    let drawHeight = boxRect.height * scaleRatio;

    if (imgAspect > boxAspect) {
      drawWidth = drawHeight * imgAspect;
    } else {
      drawHeight = drawWidth / imgAspect;
    }

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();

    let finalImg = originalUrl;
    try {
      finalImg = canvas.toDataURL('image/jpeg', 0.92);
      setPreviewUrl(finalImg);
      onImageSelected(finalImg);
    } catch {
      // Fallback a original si hay problemas de cross-origin
      setPreviewUrl(originalUrl);
      onImageSelected(originalUrl);
    }

    setIsCropperOpen(false);

    // Subir a Supabase Storage bucket 'memoriales' en segundo plano
    setIsUploading(true);
    supabaseStorageService.uploadImage(finalImg, folder, fileName || 'foto')
      .then((uploadedUrl) => {
        if (uploadedUrl && uploadedUrl.startsWith('http')) {
          setPreviewUrl(uploadedUrl);
          onImageSelected(uploadedUrl);
        }
      })
      .catch((err) => console.warn('Supabase storage upload error:', err))
      .finally(() => setIsUploading(false));
  };

  const handleUseOriginal = () => {
    setPreviewUrl(originalUrl);
    onImageSelected(originalUrl);
    setIsCropperOpen(false);

    setIsUploading(true);
    supabaseStorageService.uploadImage(originalUrl, folder, fileName || 'foto')
      .then((uploadedUrl) => {
        if (uploadedUrl && uploadedUrl.startsWith('http')) {
          setPreviewUrl(uploadedUrl);
          onImageSelected(uploadedUrl);
        }
      })
      .catch((err) => console.warn('Supabase storage upload error:', err))
      .finally(() => setIsUploading(false));
  };

  const handleResetAdjustments = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-2">
      {/* Encabezado con título e indicador de tipo de fotografía (sin emojis) */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#544D46]">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {isUploading && (
            <span className="flex items-center gap-1.5 text-[11px] text-[#8C6B32] font-medium bg-[#FAF4E8] px-2.5 py-0.5 rounded-full border border-[#E8D7B0] animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin text-[#C29837]" />
              <span>Guardando en Storage...</span>
            </span>
          )}
          {effectiveShape === 'round' && (
            <span className="flex items-center gap-1 text-[11px] text-[#8C6B32] font-medium bg-[#FAF4E8] px-2.5 py-0.5 rounded-full border border-[#E8D7B0]">
              <Crop className="w-3 h-3 text-[#C29837]" />
              <span>Retrato Circular</span>
            </span>
          )}
          {effectiveShape === 'wide' && (
            <span className="flex items-center gap-1 text-[11px] text-[#8C6B32] font-medium bg-[#FAF4E8] px-2.5 py-0.5 rounded-full border border-[#E8D7B0]">
              <Crop className="w-3 h-3 text-[#C29837]" />
              <span>Paisaje Panorámico</span>
            </span>
          )}
        </div>
      </div>

      {/* Zona de Carga / Vista Previa Cálida y Limpia */}
      <div
        onClick={() => {
          if (!previewUrl) {
            fileInputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-4 transition-all text-center flex flex-col items-center justify-center overflow-hidden ${
          isDragging
            ? 'border-[#C29837] bg-[#FFFBF2]'
            : previewUrl
            ? 'border-[#D8CABE] bg-[#FAF8F5]'
            : 'border-[#DFCDB8] bg-[#FAF7F2] hover:bg-[#F5EFE6] cursor-pointer'
        } ${effectiveShape === 'round' ? 'min-h-[190px]' : effectiveShape === 'wide' ? 'min-h-[170px]' : 'min-h-[160px]'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {previewUrl ? (
          <div className="relative w-full flex flex-col items-center">
            {/* Visualización de la foto según el formato seleccionado */}
            <div
              className={`relative overflow-hidden border-2 border-[#C29837] shadow-sm mb-3 bg-[#FAF7F2] ${
                effectiveShape === 'round'
                  ? 'w-32 h-32 rounded-full ring-4 ring-[#EAE4D8]'
                  : effectiveShape === 'wide'
                  ? 'w-full h-36 rounded-2xl'
                  : 'w-32 h-32 rounded-2xl'
              }`}
            >
              <img
                src={previewUrl}
                alt="Vista previa de la fotografía"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemove}
                title="Eliminar imagen"
                className="absolute top-2 right-2 p-1 bg-white/90 hover:bg-white text-[#9E4232] rounded-full transition-colors cursor-pointer shadow-md border border-[#EAE4D8]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Acciones de Edición Opcional / Re-encuadre */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCropperOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF3E3] text-[#8C6B32] border border-[#E8D7B0] hover:bg-[#F3ECE0] text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <Crop className="w-3.5 h-3.5 text-[#C29837]" />
                <span>Ajustar Encuadre</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#5E564E] border border-[#DFCDB8] hover:bg-[#F5EFE6] text-xs font-medium transition-colors cursor-pointer shadow-xs"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#7A7167]" />
                <span>Cambiar Foto</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#758774] font-medium mt-3">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{fileName || 'Fotografía seleccionada correctamente'}</span>
            </div>
          </div>
        ) : (
          <div className="py-4 flex flex-col items-center pointer-events-none">
            <div className="w-11 h-11 rounded-full bg-[#FAF3E3] border border-[#E8D7B0] text-[#C29837] flex items-center justify-center mb-2.5 shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#2D2926] mb-1">
              Seleccionar o arrastrar una fotografía
            </p>
            <p className="text-[11px] text-[#7A7167] max-w-xs">
              {helperText}
            </p>
          </div>
        )}
      </div>

      {/* MODAL INTERACTIVO DE RECORTE LIBRE (OPCIONAL) */}
      {isCropperOpen && originalUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white border-2 border-[#C29837] rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FAF3E3] border border-[#E8D7B0] flex items-center justify-center text-[#C29837]">
                  <Crop className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#2D2926]">
                    Ajustar y Encuadrar Fotografía
                  </h3>
                  <p className="text-[11px] text-[#7A7167]">
                    Arrastra la foto para posicionarla o ajusta el zoom libremente.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCropperOpen(false)}
                className="p-1.5 text-[#8C847A] hover:text-[#2D2926] rounded-full hover:bg-[#F2ECE1] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Espacio de Encuadre Interactivo */}
            <div className="relative w-full flex flex-col items-center justify-center py-2 select-none">
              <div
                ref={cropperBoxRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`relative overflow-hidden bg-[#F5EFE6] border-2 border-[#C29837] cursor-grab active:cursor-grabbing shadow-inner ${
                  effectiveShape === 'round'
                    ? 'w-64 h-64 sm:w-72 sm:h-72 rounded-full ring-8 ring-[#EAE4D8]'
                    : effectiveShape === 'wide'
                    ? 'w-full h-52 sm:h-64 rounded-2xl'
                    : 'w-64 h-64 sm:w-72 sm:h-72 rounded-2xl'
                }`}
              >
                {/* Imagen manipulable */}
                <img
                  ref={imageRef}
                  src={originalUrl}
                  alt="Ajuste de fotografía"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: 'center center',
                    transition: isPanning ? 'none' : 'transform 0.08s ease-out',
                  }}
                  className="w-full h-full object-contain pointer-events-none"
                  draggable={false}
                />

                {/* Guía de encuadre translúcida */}
                <div className="absolute inset-0 pointer-events-none border border-white/40 flex items-center justify-center">
                  <span className="text-[10px] font-medium text-white/90 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-xs">
                    Arrastra para mover
                  </span>
                </div>
              </div>
            </div>

            {/* Controles de Zoom y Centrado */}
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#DFCDB8] space-y-2.5">
              <div className="flex items-center justify-between text-xs text-[#544D46]">
                <span className="font-semibold flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-[#C29837]" />
                  <span>Nivel de Zoom: {Math.round(zoom * 100)}%</span>
                </span>
                <button
                  type="button"
                  onClick={handleResetAdjustments}
                  className="flex items-center gap-1 text-[11px] text-[#7A7167] hover:text-[#C29837] font-medium cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Centrar</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.max(0.6, prev - 0.1))}
                  className="p-1.5 rounded-lg bg-white border border-[#D8CABE] hover:bg-[#F2ECE1] text-[#544D46] cursor-pointer"
                  title="Alejar"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min="0.6"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-[#C29837] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.min(3, prev + 0.1))}
                  className="p-1.5 rounded-lg bg-white border border-[#D8CABE] hover:bg-[#F2ECE1] text-[#544D46] cursor-pointer"
                  title="Acercar"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Botones de Acción del Modal */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-[#F2ECE1]">
              <button
                type="button"
                onClick={handleUseOriginal}
                className="px-4 py-2.5 rounded-full border border-[#D8CABE] bg-white text-[#5E564E] hover:bg-[#F5EFE6] text-xs font-medium cursor-pointer transition-colors text-center"
              >
                Usar Original (Sin Recorte)
              </button>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCropperOpen(false)}
                  className="px-4 py-2.5 rounded-full text-xs font-semibold text-[#7A7167] hover:bg-[#F2ECE1] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleApplyCrop}
                  className="flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full bg-[#8C6B32] hover:bg-[#785924] text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Aplicar Encuadre</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
