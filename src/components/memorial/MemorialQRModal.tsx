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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121417]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] dark:bg-[#181B22] border border-[#DFCDB8] dark:border-[#2E3542] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-center">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#8A7F73] dark:text-[#A69D92] hover:text-[#2D2926] dark:hover:text-white rounded-full hover:bg-[#EFE8DC] dark:hover:bg-[#252B37] transition-colors cursor-pointer"
          aria-label="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Contenido imprimible de la tarjeta */}
        <div ref={printRef} className="p-4 bg-white dark:bg-[#121418] border border-[#E8DEC9] dark:border-[#2C3340] rounded-2xl shadow-sm mb-5 text-[#2D2926] dark:text-[#E8E5DF]">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#C29837] mb-2 font-medium">
            <Flame className="w-3.5 h-3.5 animate-flame" />
            <span>En Memoria Eterna</span>
          </div>

          <h3 className="font-memorial text-xl font-semibold mb-1">
            {obituary.fullName}
          </h3>

          <p className="text-xs text-[#7A7167] dark:text-[#9E978D] font-script mb-4">
            {obituary.epitaph}
          </p>

          {/* Imagen QR */}
          <div className="w-48 h-48 mx-auto rounded-xl overflow-hidden border border-[#EDE5DA] dark:border-[#2D3340] bg-white p-2 mb-3 shadow-xs">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Código QR del Memorial" className="w-full h-full object-contain" />
            ) : (
              <QrCode className="w-12 h-12 text-[#A69D92] animate-pulse m-auto" />
            )}
          </div>

          <p className="text-[11px] text-[#8C847A] dark:text-[#9A9388] tracking-wide">
            Escanea con la cámara de tu celular para visitar este memorial y encender una vela
          </p>
        </div>

        {/* Acciones */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#2D2926] dark:bg-[#C29837] text-[#FBF9F5] dark:text-[#121418] text-xs font-semibold hover:bg-[#433E3A] transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isGeneratingPdf ? 'Generando...' : 'Bajar PDF'}</span>
          </button>

          <button
            onClick={handleDownloadPng}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-[#202530] text-[#4A4540] dark:text-[#E8E5DF] border border-[#DFCDB8] dark:border-[#2E3542] text-xs font-medium hover:bg-[#F3ECE0] dark:hover:bg-[#2A3140] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Imagen QR</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-[#202530] text-[#4A4540] dark:text-[#E8E5DF] border border-[#DFCDB8] dark:border-[#2E3542] text-xs font-medium hover:bg-[#F3ECE0] dark:hover:bg-[#2A3140] transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
