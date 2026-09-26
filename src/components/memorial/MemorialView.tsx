'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Obituary, Tribute } from '../../types/memorial';
import { SUBSCRIPTION_PLANS } from '../../data/plans';
import { MemorialHeader } from './MemorialHeader';
import { MemorialBio } from './MemorialBio';
import { FuneralServicesSection } from './FuneralServicesSection';
import { LifeTimeline } from './LifeTimeline';
import { CandleTributeSection } from './CandleTributeSection';
import { MemorialQRModal } from './MemorialQRModal';
import { Lock } from 'lucide-react';

interface Props {
  initialObituary: Obituary;
}

export const MemorialView = ({ initialObituary }: Props) => {
  const [obituary, setObituary] = useState<Obituary>(initialObituary);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [directTributeModal, setDirectTributeModal] = useState<'candle' | 'flower' | null>(null);

  const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === obituary.planId) || SUBSCRIPTION_PLANS[0];

  const handleTributeAdded = (newTribute: Tribute) => {
    setObituary((prev) => ({
      ...prev,
      tributes: [newTribute, ...prev.tributes],
      candlesCount: newTribute.tributeType === 'candle' ? prev.candlesCount + 1 : prev.candlesCount,
      flowersCount: newTribute.tributeType === 'flower' ? prev.flowersCount + 1 : prev.flowersCount,
    }));
  };

  // Determinar clases de tema visual elegido por la familia
  const getThemeClasses = () => {
    switch (obituary.themePreset) {
      case 'charcoal-dark':
        return 'bg-[#2A2622] text-[#F5EFE6]';
      case 'olive-peace':
        return 'bg-[#F4F6F4] text-[#2D2926]';
      case 'rose-memory':
        return 'bg-[#F9F5F3] text-[#2D2926]';
      case 'ivory-warm':
      default:
        return 'bg-[#FBF9F5] text-[#2D2926]';
    }
  };

  // Determinar clases de tipografía elegida por la familia
  const getFontClasses = () => {
    switch (obituary.fontFamily) {
      case 'serif-cinzel':
        return 'font-serif-cinzel tracking-wider';
      case 'serif-playfair':
        return 'font-serif-playfair';
      case 'sans-inter':
        return 'font-sans-inter';
      case 'serif-lora':
        return 'font-serif-lora';
      case 'serif-merriweather':
        return 'font-serif-merriweather';
      case 'serif-bodoni':
        return 'font-serif-bodoni';
      case 'sans-montserrat':
        return 'font-sans-montserrat';
      case 'serif-cormorant':
      default:
        return 'font-serif-cormorant';
    }
  };

  return (
    <article className={`min-h-screen pb-16 bg-[#FBF9F5] text-[#2D2926] ambient-glow ${getFontClasses()}`}>
      {/* Cabecera del Memorial */}
      <MemorialHeader
        obituary={obituary}
        onLightCandleClick={() => setDirectTributeModal('candle')}
        onSendFlowersClick={() => setDirectTributeModal('flower')}
        onOpenQRClick={() => setIsQRModalOpen(true)}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Servicios Funerarios y Logística */}
        <FuneralServicesSection services={obituary.services} />

        {/* Biografía / Historia de Vida */}
        <MemorialBio biography={obituary.biography} fullName={obituary.fullName} />

        {/* Cronología */}
        <LifeTimeline milestones={obituary.timeline} />

        {/* Velas Virtuales y Libro de Recuerdos con fotos según plan */}
        <CandleTributeSection
          obituaryId={obituary.id}
          tributes={obituary.tributes}
          onTributeAdded={handleTributeAdded}
          isOpenModalDirectly={directTributeModal}
          onCloseDirectModal={() => setDirectTributeModal(null)}
          allowsPhotos={currentPlan.limits.allowsTributePhotos}
          maxCandlesAndFlowers={currentPlan.limits.maxCandlesAndFlowers}
        />

        {/* Pie de página público solemne (sin enlaces administrativos) */}
        <footer className="mt-20 pt-8 pb-10 border-t border-[#EAE4D8] text-center">
          <p className="font-memorial text-sm sm:text-base text-[#2D2926] mb-1">
            En Memoria Perpetua de {obituary.fullName}
          </p>
          <p className="text-[11px] text-[#8C847A]">
            Preservado con honor en Hobituario • Espacio solemne y libre de publicidad
          </p>
        </footer>
      </div>

      {/* Modal para Generar y Descargar QR de Lápida */}
      <MemorialQRModal
        obituary={obituary}
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />
    </article>
  );
};
