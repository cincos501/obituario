'use client';

import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Obituary } from '../../types/memorial';
import { pdfService } from '../../services/pdfService';
import { QrCode, Download, Printer, X, Flame, FileText } from 'lucide-react';

interface Props {
  obituary: Obituary;
  isOpen: boolean;
  onClose: () => void;
}

export const MemorialQRModal = ({ obituary, isOpen, onClose }: Props) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const url = window.location.href;
      QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: {
          dark: '#2D2926',
          light: '#FAF7F2',
        },
      })
        .then((dataUri) => setQrDataUrl(dataUri))
        .catch((err) => console.error('Error generando QR:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR-Memorial-${obituary.slug}.png`;
    a.click();
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      await pdfService.generateMemorialCardPdf(obituary, window.location.href);
    } catch (err) {
      console.error('Error al generar PDF:', err);
      alert('Hubo un inconveniente al generar el PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] border border-[#DFCDB8] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-center">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#8A7F73] hover:text-[#2D2926] rounded-full hover:bg-[#EFE8DC] transition-colors cursor-pointer"
          aria-label="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Contenido imprimible de la tarjeta */}
        <div ref={printRef} className="p-4 bg-white border border-[#E8DEC9] rounded-2xl shadow-sm mb-5 text-[#2D2926]">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#C29837] mb-2 font-medium">
            <Flame className="w-3.5 h-3.5 animate-flame" />
            <span>En Memoria Eterna</span>
          </div>

          <h3 className="font-memorial text-xl font-semibold mb-1">
            {obituary.fullName}
          </h3>

          <p className="text-xs text-[#7A7167] font-script mb-4">
            {obituary.epitaph}
          </p>

          {/* Imagen QR */}
          <div className="w-48 h-48 mx-auto rounded-xl overflow-hidden border border-[#EDE5DA] bg-white p-2 mb-3 shadow-xs">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Código QR del Memorial" className="w-full h-full object-contain" />
            ) : (
              <QrCode className="w-12 h-12 text-[#A69D92] animate-pulse m-auto" />
            )}
          </div>

          <p className="text-[11px] text-[#8C847A] tracking-wide">
            Escanea con la cámara de tu celular para visitar este memorial y encender una vela
          </p>
        </div>

        {/* Acciones */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#8C6B32] hover:bg-[#785924] text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isGeneratingPdf ? 'Generando...' : 'Bajar PDF'}</span>
          </button>

          <button
            onClick={handleDownloadPng}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white text-[#4A4540] border border-[#DFCDB8] text-xs font-medium hover:bg-[#F3ECE0] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Imagen QR</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white text-[#4A4540] border border-[#DFCDB8] text-xs font-medium hover:bg-[#F3ECE0] transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
