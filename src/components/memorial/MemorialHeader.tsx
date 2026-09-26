'use client';

import React from 'react';
import Link from 'next/link';
import { Obituary } from '../../types/memorial';
import { Flame, Flower2, QrCode, Share2, MapPin, Calendar, Settings } from 'lucide-react';

interface Props {
  obituary: Obituary;
  onLightCandleClick: () => void;
  onSendFlowersClick: () => void;
  onOpenQRClick: () => void;
}

export const MemorialHeader = ({
  obituary,
  onLightCandleClick,
  onSendFlowersClick,
  onOpenQRClick,
}: Props) => {
  const formatDates = (birth: string, death: string) => {
    try {
      const birthYear = new Date(birth).getFullYear();
      const deathYear = new Date(death).getFullYear();
      return `${birthYear} — ${deathYear}`;
    } catch {
      return `${birth} — ${death}`;
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `En memoria de ${obituary.fullName}`,
          text: obituary.epitaph,
          url: window.location.href,
        });
      } catch {
        // Ignorar si canceló el share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace del memorial copiado al portapapeles.');
    }
  };

  return (
    <div className="relative w-full">
      {/* Portada suave o textura solemne */}
      <div className="h-64 sm:h-80 w-full relative overflow-hidden bg-[#EAE4D8] dark:bg-[#1a1d24]">
        {obituary.coverPhotoUrl ? (
          <img
            src={obituary.coverPhotoUrl}
            alt="Portada conmemorativa"
            className="w-full h-full object-cover opacity-60 dark:opacity-40 filter brightness-95"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-[#E6DFD3] dark:from-[#1E232D] to-[#FBF9F5] dark:to-[#101216]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FBF9F5] dark:from-[#101216] via-[#FBF9F5]/40 dark:via-[#101216]/40 to-transparent" />
      </div>

      {/* Tarjeta y Retrato Principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative -mt-32 sm:-mt-40 text-center">
        {/* Retrato con marco solemne */}
        <div className="relative inline-block mx-auto mb-6">
          <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-full p-1.5 bg-[#FAF7F2] dark:bg-[#181B22] border-2 border-[#D8CABE] dark:border-[#38404F] shadow-xl relative z-10 overflow-hidden">
            <img
              src={obituary.mainPhotoUrl}
              alt={obituary.fullName}
              className="w-full h-full object-cover rounded-full filter contrast-105"
            />
          </div>
          {/* Lazo de respeto o halo suave */}
          <div className="absolute -bottom-2 -right-2 bg-[#2D2926] dark:bg-[#C29837] text-[#F3ECE0] dark:text-[#101216] rounded-full p-2 border border-[#DFCDB8] dark:border-[#38404F] shadow-md z-20 flex items-center justify-center">
            <Flame className="w-4 h-4 text-[#E6B84A] dark:text-[#101216] animate-flame" />
          </div>
        </div>

        {/* Nombres y Apodos */}
        <h1 className="font-memorial text-3xl sm:text-5xl font-normal text-[#2D2926] dark:text-[#EAE6DF] tracking-tight mb-2">
          {obituary.fullName}
        </h1>
        {obituary.nickname && (
          <p className="text-sm sm:text-base text-[#80766B] dark:text-[#9A9388] font-script mb-3">
            Conocido con cariño como &ldquo;{obituary.nickname}&rdquo;
          </p>
        )}

        {/* Fechas de Vida */}
        <div className="inline-flex items-center justify-center gap-3 px-4 py-1.5 rounded-full bg-[#F3ECE0]/80 dark:bg-[#1C2028] border border-[#E3D6C5] dark:border-[#2D3442] text-xs sm:text-sm font-medium text-[#5E564E] dark:text-[#C5BEB5] mb-6">
          <Calendar className="w-3.5 h-3.5 text-[#C29837]" />
          <span>{formatDates(obituary.birthDate, obituary.deathDate)}</span>
          {obituary.birthPlace && (
            <>
              <span className="text-[#C29837]">•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#A89F94]" />
                {obituary.birthPlace}
              </span>
            </>
          )}
        </div>

        {/* Epitafio Solemne */}
        <blockquote className="max-w-2xl mx-auto text-base sm:text-lg text-[#4A4540] dark:text-[#D4CFCA] font-script leading-relaxed px-4 py-3 border-y border-[#EAE4D8]/80 dark:border-[#282E39] mb-8 bg-[#FAF8F5]/60 dark:bg-[#16181F]/60 rounded-xl">
          {obituary.epitaph}
        </blockquote>

        {/* Contadores y Botones de Acción Rápida */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-10">
          {/* Botón Encender Vela */}
          <button
            onClick={onLightCandleClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2D2926] dark:bg-[#C29837] text-[#FBF9F5] dark:text-[#101216] hover:bg-[#433E3A] transition-all shadow-md hover:shadow-lg text-xs sm:text-sm font-semibold group cursor-pointer"
          >
            <Flame className="w-4 h-4 text-[#F5C354] dark:text-[#101216] group-hover:scale-110 transition-transform animate-flame" />
            <span>Encender Vela ({obituary.candlesCount})</span>
          </button>

          {/* Botón Ofrendar Flores */}
          <button
            onClick={onSendFlowersClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FAF7F2] dark:bg-[#1A1D24] text-[#4A4540] dark:text-[#E8E5DF] border border-[#DFCDB8] dark:border-[#2F3643] hover:bg-[#F3ECE0] dark:hover:bg-[#252B36] transition-colors text-xs sm:text-sm font-medium shadow-xs cursor-pointer"
          >
            <Flower2 className="w-4 h-4 text-[#8A9D87]" />
            <span>Ofrendar Flor ({obituary.flowersCount})</span>
          </button>

          {/* Botón QR Lápida / PDF */}
          <button
            onClick={onOpenQRClick}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#FAF7F2] dark:bg-[#1A1D24] text-[#5E564E] dark:text-[#E8E5DF] border border-[#DFCDB8] dark:border-[#2F3643] hover:bg-[#F3ECE0] dark:hover:bg-[#252B36] transition-colors text-xs sm:text-sm font-medium shadow-xs cursor-pointer"
            title="Generar tarjeta en PDF o código QR para lápida"
          >
            <QrCode className="w-4 h-4 text-[#8C847A]" />
            <span>QR & PDF</span>
          </button>

          {/* Botón Compartir */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#FAF7F2] dark:bg-[#1A1D24] text-[#5E564E] dark:text-[#E8E5DF] border border-[#DFCDB8] dark:border-[#2F3643] hover:bg-[#F3ECE0] dark:hover:bg-[#252B36] transition-colors text-xs sm:text-sm font-medium shadow-xs cursor-pointer"
            aria-label="Compartir este memorial"
            title="Compartir este memorial por WhatsApp o enlace"
          >
            <Share2 className="w-4 h-4 text-[#8C847A]" />
            <span>Compartir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
