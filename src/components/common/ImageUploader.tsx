'use client';

import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, CheckCircle, RefreshCw } from 'lucide-react';

interface Props {
  label: string;
  initialUrl?: string;
  onImageSelected: (dataUrl: string) => void;
  helperText?: string;
  aspectRatio?: 'square' | 'wide' | 'round';
  cropShape?: 'round' | 'rect' | 'wide';
}

export const ImageUploader = ({
  label,
  initialUrl = '',
  onImageSelected,
  helperText = 'Formatos recomendados: JPG, PNG o WebP. Máx. 10MB.',
  aspectRatio = 'square',
  cropShape,
}: Props) => {
  const [previewUrl, setPreviewUrl] = useState<string>(initialUrl);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [objectPosition, setObjectPosition] = useState<'object-center' | 'object-top' | 'object-bottom'>('object-center');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveShape = cropShape || (aspectRatio === 'round' ? 'round' : aspectRatio === 'wide' ? 'wide' : 'rect');

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
      onImageSelected(result);
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
    setFileName('');
    onImageSelected('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#544D46] dark:text-[#C5BEB5]">
          {label}
        </label>
        {effectiveShape === 'round' && (
          <span className="text-[10px] text-[#A67C24] font-medium bg-[#FAF3E3] dark:bg-[#2A2E38] px-2 py-0.5 rounded-full border border-[#E8D7B0]">
            ✂️ Recorte Circular (Retrato)
          </span>
        )}
        {effectiveShape === 'wide' && (
          <span className="text-[10px] text-[#A67C24] font-medium bg-[#FAF3E3] dark:bg-[#2A2E38] px-2 py-0.5 rounded-full border border-[#E8D7B0]">
            ✂️ Recorte Panorámico (Portada)
          </span>
        )}
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-4 transition-all text-center cursor-pointer flex flex-col items-center justify-center overflow-hidden ${
          isDragging
            ? 'border-[#C29837] bg-[#FFFBF2] dark:bg-[#232731]'
            : previewUrl
            ? 'border-[#D8CABE] dark:border-[#38404F] bg-[#FAF8F5] dark:bg-[#181B22]'
            : 'border-[#DFCDB8] dark:border-[#303744] bg-[#FAF7F2] dark:bg-[#15181E] hover:bg-[#F2ECE1] dark:hover:bg-[#1D212A]'
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
            {/* Contenedor con máscara de recorte visual según el modo solicitado */}
            <div
              className={`relative overflow-hidden border-2 border-[#C29837] shadow-md mb-2 transition-all ${
                effectiveShape === 'round'
                  ? 'w-32 h-32 rounded-full ring-4 ring-[#EAE4D8] dark:ring-[#282E39]'
                  : effectiveShape === 'wide'
                  ? 'w-full h-36 rounded-2xl'
                  : 'w-32 h-32 rounded-2xl'
              }`}
            >
              <img
                src={previewUrl}
                alt="Vista previa recortada"
                className={`w-full h-full object-cover ${objectPosition}`}
              />
              <button
                type="button"
                onClick={handleRemove}
                title="Eliminar imagen"
                className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-black text-white rounded-full transition-colors cursor-pointer shadow-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Ajuste fino de encuadre */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 mt-1 bg-[#FAF7F2] dark:bg-[#202530] px-3 py-1 rounded-full border border-[#EAE4D8] dark:border-[#38404F]"
            >
              <span className="text-[10px] text-[#7A7167] dark:text-[#9A9388] font-medium mr-1">Enfoque:</span>
              <button
                type="button"
                onClick={() => setObjectPosition('object-top')}
                className={`px-2 py-0.5 text-[10px] rounded font-medium transition-colors cursor-pointer ${
                  objectPosition === 'object-top'
                    ? 'bg-[#2D2926] dark:bg-[#C29837] text-white dark:text-[#101216]'
                    : 'text-[#6E665D] hover:bg-[#EAE4D8]'
                }`}
              >
                Rostro/Arriba
              </button>
              <button
                type="button"
                onClick={() => setObjectPosition('object-center')}
                className={`px-2 py-0.5 text-[10px] rounded font-medium transition-colors cursor-pointer ${
                  objectPosition === 'object-center'
                    ? 'bg-[#2D2926] dark:bg-[#C29837] text-white dark:text-[#101216]'
                    : 'text-[#6E665D] hover:bg-[#EAE4D8]'
                }`}
              >
                Centro
              </button>
              <button
                type="button"
                onClick={() => setObjectPosition('object-bottom')}
                className={`px-2 py-0.5 text-[10px] rounded font-medium transition-colors cursor-pointer ${
                  objectPosition === 'object-bottom'
                    ? 'bg-[#2D2926] dark:bg-[#C29837] text-white dark:text-[#101216]'
                    : 'text-[#6E665D] hover:bg-[#EAE4D8]'
                }`}
              >
                Abajo
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#758774] font-medium mt-2">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{fileName || 'Imagen encuadrada'}</span>
            </div>
            <span className="text-[10px] text-[#A69D92]">
              Haz clic para cambiar de fotografía
            </span>
          </div>
        ) : (
          <div className="py-3 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#F3ECE0] dark:bg-[#262C38] text-[#C29837] flex items-center justify-center mb-2 shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#2D2926] dark:text-[#E8E5DF] mb-0.5">
              Arrastra una foto aquí o haz clic para examinar
            </p>
            <p className="text-[11px] text-[#8C847A] dark:text-[#9A9388]">
              {helperText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
