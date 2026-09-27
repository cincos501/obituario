'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  QrCode, 
  Building2, 
  Clock, 
  CheckCircle2, 
  Download, 
  Copy, 
  Check, 
  AlertCircle, 
  Loader2, 
  MessageCircle, 
  ShieldCheck, 
  Sparkles, 
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  Flame,
  User,
  CreditCard
} from 'lucide-react';
import { Navbar } from '@/components/common/Navbar';

interface OrderData {
  orderId: string;
  transactionNumber: string;
  qrId: string;
  amount: number;
  currency: string;
  planName: string;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
  description?: string;
  createdAt: string;
  paidAt?: string;
}

export default function PaymentQRPage() {
  const params = useParams();
  const router = useRouter();
  const qrId = params?.qrId as string;

  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [qrImage, setQrImage] = useState<string>('');
  const [status, setStatus] = useState<'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED' | 'UNKNOWN'>('PENDING');
  const [error, setError] = useState<string | null>(null);

  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);

  // Contador de expiración visual (15 minutos = 900s)
  const [timeLeft, setTimeLeft] = useState<number>(900);

  const banecoAccount = '6111329426';

  // Función para consultar el estado actual del pago
  const fetchPaymentStatus = useCallback(async (isManualCheck = false) => {
    if (!qrId) return;
    if (isManualCheck) setIsVerifying(true);

    try {
      const res = await fetch(`/api/payments/qr/${encodeURIComponent(qrId)}`);
      if (!res.ok) {
        throw new Error('No se pudo obtener información del pago.');
      }
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        if (data.qrImage) setQrImage(data.qrImage);
        setStatus(data.status || 'PENDING');
      } else {
        setError(data.message || 'Error al consultar estado.');
      }
    } catch (err: any) {
      console.warn('Error fetching status:', err);
      if (isManualCheck) setError('No se pudo verificar el pago en este momento.');
    } finally {
      setLoading(false);
      if (isManualCheck) setIsVerifying(false);
    }
  }, [qrId]);

  // Carga inicial
  useEffect(() => {
    fetchPaymentStatus();
  }, [fetchPaymentStatus]);

  // Polling automático cada 5 segundos mientras el estado sea PENDING
  useEffect(() => {
    if (status !== 'PENDING') return;

    const interval = setInterval(() => {
      fetchPaymentStatus(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [status, fetchPaymentStatus]);

  // Countdown timer
  useEffect(() => {
    if (status !== 'PENDING' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [status, timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string, type: 'amount' | 'account' | 'order') => {
    navigator.clipboard.writeText(text);
    if (type === 'amount') {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    } else if (type === 'account') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else {
      setCopiedOrder(true);
      setTimeout(() => setCopiedOrder(false), 2000);
    }
  };

  const handleDownloadQr = () => {
    if (!qrImage) return;
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `pago-baneco-${qrId}.png`;
    link.click();
  };

  const buildWhatsAppMessage = () => {
    if (!order) return '';
    const text = `🕊️ *Comprobante de Pago Hobituario*
N° Pedido: ${order.orderId}
Membresía: ${order.planName}
Monto: ${order.amount.toFixed(2)} ${order.currency}
Titular: ${order.payerName || 'Familiar'}
Cuenta Destino: ${banecoAccount} (Banco Económico)
Estado: ¡PAGADO Y CONFIRMADO! ✅
Fecha: ${order.paidAt ? new Date(order.paidAt).toLocaleString('es-BO') : new Date().toLocaleString('es-BO')}`;
    return `https://wa.me/59170000000?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col text-[#2D2926]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-3 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A7167] hover:text-[#2D2926] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C29837] animate-pulse"></span>
            <span className="text-[11px] font-semibold text-[#8C6B32] uppercase tracking-wider">
              Pasarela Banco Económico
            </span>
          </div>
        </div>

        {loading ? (
          <div className="bg-white border border-[#EAE4D8] rounded-3xl p-12 text-center shadow-sm space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#C29837] mx-auto" />
            <p className="text-xs text-[#7A7167]">Cargando orden de pago y generando código QR...</p>
          </div>
        ) : error ? (
          <div className="bg-white border border-[#ECD1CC] rounded-3xl p-8 text-center shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FBEBE8] text-[#9E4232] flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="font-memorial text-xl text-[#2D2926]">Inconveniente al cargar la orden</h2>
            <p className="text-xs text-[#7A7167] max-w-md mx-auto">{error}</p>
            <button
              onClick={() => fetchPaymentStatus(true)}
              className="px-6 py-2.5 rounded-full bg-[#8C6B32] text-white text-xs font-semibold hover:bg-[#785924] transition-colors cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* COLUMNA IZQUIERDA: TARJETA QR O CONFIRMACIÓN */}
            <div className="lg:col-span-7 bg-white border border-[#EAE4D8] rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
              
              {/* ESTADO 1: PAGADO / CONFIRMADO */}
              {status === 'CONFIRMED' ? (
                <div className="text-center py-6 sm:py-8 space-y-5 animate-in zoom-in-95">
                  <div className="w-20 h-20 rounded-full bg-[#EBF0EB] text-[#4A634E] flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A634E] bg-[#EBF0EB] px-3.5 py-1 rounded-full">
                      ¡Pago Confirmado por Banco Económico!
                    </span>
                    <h2 className="font-memorial text-2xl sm:text-3xl text-[#2D2926] font-normal mt-3">
                      Membresía Activada con Éxito
                    </h2>
                    <p className="text-xs text-[#7A7167] mt-1 max-w-sm mx-auto">
                      Tu transacción ha sido acreditada correctamente. Tu memorial cuenta con todos los beneficios de preservación digital.
                    </p>
                  </div>

                  <div className="bg-[#FAF7F2] rounded-2xl border border-[#D8CABE] p-4 text-left text-xs space-y-2.5 max-w-sm mx-auto shadow-xs">
                    <div className="flex justify-between pb-1.5 border-b border-[#EAE4D8]">
                      <span className="text-[#7A7167]">Plan Activado:</span>
                      <span className="font-semibold text-[#2D2926]">{order?.planName}</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-[#EAE4D8]">
                      <span className="text-[#7A7167]">N° Transacción:</span>
                      <span className="font-mono font-semibold text-[#2D2926]">{order?.transactionNumber}</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-[#EAE4D8]">
                      <span className="text-[#7A7167]">Cuenta Destino:</span>
                      <span className="font-mono text-[#544D46]">{banecoAccount} (Banco Económico)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7A7167]">Monto Acreditado:</span>
                      <span className="font-bold text-[#4A634E]">{order?.amount.toFixed(2)} {order?.currency}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-sm mx-auto">
                    <a
                      href={buildWhatsAppMessage()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 px-4 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
                      <span>Notificar por WhatsApp</span>
                    </a>

                    <Link
                      href="/crear"
                      className="flex-1 py-3 px-4 rounded-full bg-[#2D2926] hover:bg-[#433E3A] text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer"
                    >
                      <span>Ir al Creador</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : status === 'EXPIRED' ? (
                /* ESTADO 2: EXPIRADO */
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#FBEBE8] text-[#9E4232] flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8" />
                  </div>
                  <h3 className="font-memorial text-xl text-[#2D2926]">El código QR ha expirado</h3>
                  <p className="text-xs text-[#7A7167] max-w-sm mx-auto">
                    Por seguridad bancaria de Banco Económico, este código tenía un tiempo límite de vigencia. Puedes generar una nueva orden en cualquier momento.
                  </p>
                  <Link
                    href="/crear"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#8C6B32] text-white text-xs font-semibold hover:bg-[#785924] transition-colors"
                  >
                    Generar Nuevo QR
                  </Link>
                </div>
              ) : (
                /* ESTADO 3: PENDIENTE DE PAGO */
                <div className="space-y-5 text-center">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1]">
                    <div className="text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6B32] block">
                        Cobro Digital ASFI
                      </span>
                      <h2 className="font-memorial text-lg sm:text-xl text-[#2D2926]">
                        QR Simple Banco Económico
                      </h2>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#8C6B32] font-semibold bg-[#FAF3E3] py-1 px-3 rounded-full border border-[#E8D7B0]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTimer(timeLeft)}</span>
                    </div>
                  </div>

                  {/* Imagen del Código QR */}
                  <div className="p-3 bg-[#FFFDF9] border border-[#E8D7B0] rounded-2xl inline-block shadow-inner max-w-full">
                    {qrImage ? (
                      <img
                        src={qrImage}
                        alt="Código QR Simple Baneco"
                        className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto rounded-lg"
                      />
                    ) : (
                      <div className="w-56 h-56 flex flex-col items-center justify-center text-xs text-[#7A7167]">
                        <Loader2 className="w-6 h-6 animate-spin text-[#C29837] mb-2" />
                        <span>Generando código QR...</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-[#7A7167]">
                    Escanea este código desde <strong>Baneco Móvil</strong> o la aplicación de cualquier banco de Bolivia (BNB, BCP, Bisa, Mercantil, Ganadero, Unión, etc.).
                  </p>

                  {/* Acciones Rápidas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={handleDownloadQr}
                      disabled={!qrImage}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-xs font-semibold text-[#544D46] hover:bg-[#F2ECE1] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-4 h-4 text-[#C29837]" />
                      <span>Descargar Código QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fetchPaymentStatus(true)}
                      disabled={isVerifying}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#8C6B32] hover:bg-[#785924] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isVerifying ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      <span>{isVerifying ? 'Verificando con banco...' : 'Verificar Pago Manual'}</span>
                    </button>
                  </div>

                  {/* Indicador de Polling en Tiempo Real */}
                  <div className="flex items-center justify-center gap-2 text-[11px] text-[#7A7167] pt-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C29837]" />
                    <span>Esperando acreditación bancaria en tiempo real (revisa cada 5s)...</span>
                  </div>
                </div>
              )}
            </div>

            {/* COLUMNA DERECHA: RESUMEN DE ORDEN Y DATOS BANCARIOS */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Resumen del Pedido */}
              <div className="bg-white border border-[#EAE4D8] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1]">
                  <span className="font-memorial text-base text-[#2D2926]">Resumen del Pedido</span>
                  <span className="font-mono text-xs font-semibold text-[#C29837]">
                    {order?.orderId}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#7A7167]">Concepto:</span>
                    <span className="font-semibold text-[#2D2926] text-right">{order?.planName}</span>
                  </div>
                  {order?.payerName && (
                    <div className="flex justify-between">
                      <span className="text-[#7A7167]">Titular:</span>
                      <span className="text-[#2D2926]">{order.payerName}</span>
                    </div>
                  )}
                  {order?.payerEmail && (
                    <div className="flex justify-between">
                      <span className="text-[#7A7167]">Correo de Contacto:</span>
                      <span className="text-[#2D2926]">{order.payerEmail}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-[#F2ECE1] text-sm">
                    <span className="font-semibold text-[#2D2926]">Total a Pagar:</span>
                    <span className="font-memorial text-xl font-bold text-[#8C6B32]">
                      {order?.amount.toFixed(2)} {order?.currency || 'BOB'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(order?.amount.toFixed(2) || '0', 'amount')}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-xs font-semibold text-[#544D46] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
                >
                  {copiedAmount ? <Check className="w-3.5 h-3.5 text-[#4A634E]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAmount ? 'Monto Copiado al Portapapeles' : `Copiar Monto (${order?.amount.toFixed(2)} Bs)`}</span>
                </button>
              </div>

              {/* Cuenta Receptora Banco Económico */}
              <div className="bg-white border border-[#EAE4D8] rounded-3xl p-5 sm:p-6 shadow-sm space-y-3 text-xs">
                <div className="flex items-center gap-2 text-[#2D2926] font-semibold pb-2 border-b border-[#F2ECE1]">
                  <Building2 className="w-4 h-4 text-[#C29837]" />
                  <span>Datos Oficiales para Transferencia Directa</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#7A7167]">Entidad Bancaria:</span>
                    <span className="font-semibold text-[#2D2926]">Banco Económico S.A.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7A7167]">N° de Cuenta:</span>
                    <span className="font-mono font-bold text-[#C29837]">{banecoAccount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7A7167]">Moneda:</span>
                    <span className="text-[#2D2926]">Bolivianos (BOB)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7A7167]">Titular:</span>
                    <span className="text-[#2D2926]">Hobituario Bolivia</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(banecoAccount, 'account')}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-xs font-semibold text-[#544D46] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
                >
                  {copiedAccount ? <Check className="w-3.5 h-3.5 text-[#4A634E]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAccount ? 'Número de Cuenta Copiado' : 'Copiar Número de Cuenta'}</span>
                </button>
              </div>

              {/* Soporte y Asistencia Inmediata */}
              <div className="p-4 rounded-2xl bg-[#EBF8EE] border border-[#D0EBD6] text-xs text-[#206933] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-[#25D366] shrink-0" />
                  <span>¿Dudas con la acreditación de tu pago?</span>
                </div>
                <a
                  href={`https://wa.me/59170000000?text=${encodeURIComponent(`Hola, tengo una consulta sobre mi orden de pago Baneco #${qrId}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold text-[11px] shrink-0 transition-colors"
                >
                  Asistencia
                </a>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
