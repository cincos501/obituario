'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SubscriptionPlan } from '../../types/memorial';
import { 
  banecoPaymentService, 
  BanecoTransaction, 
  PLAN_PRICES_BOB,
  BANECO_CONFIG
} from '../../services/banecoPaymentService';
import { 
  QrCode, 
  Clock, 
  CheckCircle2, 
  Download, 
  Copy, 
  Check, 
  X, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  MessageCircle,
  Building2
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan;
  onPaymentSuccess?: (transaction: BanecoTransaction) => void;
  initialPayerName?: string;
  initialPayerEmail?: string;
  initialPayerPhone?: string;
  obituaryId?: string;
}

export const BanecoCheckoutModal = ({
  isOpen,
  onClose,
  plan,
  onPaymentSuccess,
  initialPayerName = '',
  initialPayerEmail = '',
  initialPayerPhone = '',
  obituaryId,
}: Props) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'whatsapp'>('qr');
  const [transaction, setTransaction] = useState<BanecoTransaction | null>(null);
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Countdown timer para el QR (15 minutos = 900s)
  const [timeLeft, setTimeLeft] = useState<number>(900);

  const amountBob = PLAN_PRICES_BOB[plan.id] || 341.00;
  const accountNumber = BANECO_CONFIG.account; // 6111329426

  // 1. Inicializar Orden QR con Banco Económico al abrir el modal
  const initQrOrder = useCallback(async () => {
    setIsLoadingQr(true);
    setErrorMessage(null);
    try {
      const tx = await banecoPaymentService.createQrOrder({
        planId: plan.id,
        planName: plan.name,
        payerName: initialPayerName || 'Familiar Titular',
        payerEmail: initialPayerEmail || undefined,
        payerPhone: initialPayerPhone || undefined,
        obituaryId,
      });
      setTransaction(tx);
      setTimeLeft(900);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('No se pudo generar el código QR con Banco Económico. Intenta nuevamente.');
    } finally {
      setIsLoadingQr(false);
    }
  }, [plan.id, plan.name, initialPayerName, initialPayerEmail, initialPayerPhone, obituaryId]);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setTransaction(null);
      initQrOrder();
    }
  }, [isOpen, initQrOrder]);

  // 2. Countdown Timer
  useEffect(() => {
    if (!isOpen || isSuccess || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isSuccess, timeLeft]);

  // 3. Polling automático cada 3.5 segundos para detectar el pago del QR
  useEffect(() => {
    if (!isOpen || !transaction || isSuccess || activeTab !== 'qr') return;

    const checkInterval = setInterval(async () => {
      try {
        const current = await banecoPaymentService.getTransactionStatus(transaction.transactionNumber);
        if (current && current.status === 'completed') {
          setTransaction(current);
          setIsSuccess(true);
          if (onPaymentSuccess) onPaymentSuccess(current);
        }
      } catch (e) {
        console.warn('Error en polling de pago:', e);
      }
    }, 3500);

    return () => clearInterval(checkInterval);
  }, [isOpen, transaction, isSuccess, activeTab, onPaymentSuccess]);

  // 4. Simular Pago Exitoso en Modo Sandbox
  const handleSimulatePayment = async () => {
    if (!transaction) return;
    setIsSimulating(true);
    try {
      const approved = await banecoPaymentService.simulatePaymentApproval(transaction.transactionNumber);
      if (approved) {
        setTransaction(approved);
        setIsSuccess(true);
        if (onPaymentSuccess) onPaymentSuccess(approved);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Formateador de tiempo mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(amountBob.toFixed(2));
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!transaction?.qrImageUrl) return;
    const a = document.createElement('a');
    a.href = transaction.qrImageUrl;
    a.download = `pago-baneco-${transaction.transactionNumber}.png`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#FAF7F2] border border-[#DFCDB8] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Cabecera del Checkout */}
        <div className="bg-[#2D2926] text-white p-4 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-[#A69D92] hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10 cursor-pointer"
            aria-label="Cerrar ventana de pago"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2 pr-8">
            <div className="w-7 h-7 rounded-lg bg-[#C29837] flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#E8D7B0] truncate">
              Cobro Digital Banco Económico
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 sm:gap-4 mt-1">
            <div>
              <h2 className="font-memorial text-xl sm:text-2xl font-normal text-white">
                {plan.name}
              </h2>
              <p className="text-xs text-[#C5BEB5] mt-0.5">
                Preservación Digital de Recuerdos Eternos
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="font-memorial text-2xl sm:text-3xl text-[#F5C354] font-normal">
                {amountBob.toFixed(2)} Bs
              </span>
              <span className="block text-[11px] text-[#A69D92]">
                (~${plan.priceUSD} USD)
              </span>
            </div>
          </div>
        </div>

        {/* Pestañas: Solo QR Simple y Asistencia WhatsApp */}
        {!isSuccess && (
          <div className="flex border-b border-[#EAE4D8] bg-[#F2ECE1]/60 px-4 pt-2 gap-2">
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                activeTab === 'qr'
                  ? 'bg-white text-[#2D2926] border-[#C29837] shadow-xs'
                  : 'text-[#6B635A] hover:text-[#2D2926] border-transparent'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-[#C29837]" />
              <span>QR Simple Baneco</span>
              <span className="text-[9px] bg-[#EBF0EB] text-[#4A634E] font-bold px-1.5 py-0.5 rounded-full uppercase">
                ASFI
              </span>
            </button>

            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                activeTab === 'whatsapp'
                  ? 'bg-white text-[#2D2926] border-[#25D366] shadow-xs'
                  : 'text-[#6B635A] hover:text-[#2D2926] border-transparent'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              <span>Atención por WhatsApp</span>
            </button>
          </div>
        )}

        {/* Contenido Principal con Scroll Interno */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-[#FBEBE8] border border-[#ECD1CC] text-[#9E4232] text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ESTADO: PAGO EXITOSO */}
          {isSuccess && transaction ? (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-[#EBF0EB] text-[#4A634E] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#4A634E] bg-[#EBF0EB] px-3 py-1 rounded-full mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>¡Bienvenido! Pago Confirmado con Éxito</span>
                </div>
                <h3 className="font-memorial text-2xl text-[#2D2926] font-normal">
                  ¡Bien hecho! Membresía {plan.name} Activada
                </h3>
                <p className="text-xs text-[#7A7167] mt-1 max-w-sm mx-auto">
                  Hemos verificado tu transacción de <strong>{amountBob.toFixed(2)} Bs</strong> con Banco Económico. Tu memorial cuenta con todos los privilegios habilitados.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-[#D8CABE] p-4 text-left text-xs space-y-2 max-w-sm mx-auto shadow-xs">
                <div className="flex justify-between pb-1.5 border-b border-[#F2ECE1]">
                  <span className="text-[#7A7167]">Plan Activo:</span>
                  <span className="font-semibold text-[#2D2926]">{plan.name}</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-[#F2ECE1]">
                  <span className="text-[#7A7167]">Transacción Baneco:</span>
                  <span className="font-mono font-semibold text-[#2D2926]">{transaction.transactionNumber}</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-[#F2ECE1]">
                  <span className="text-[#7A7167]">Cuenta Destino:</span>
                  <span className="font-mono font-semibold text-[#544D46]">{accountNumber} (Banco Económico)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A7167]">Monto Acreditado:</span>
                  <span className="font-bold text-[#4A634E]">{transaction.amountBob.toFixed(2)} Bs</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full max-w-sm py-3.5 rounded-full bg-[#8C6B32] hover:bg-[#785924] text-white text-xs font-semibold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mx-auto"
              >
                <span>Continuar con la Creación del Memorial →</span>
              </button>
            </div>
          ) : (
            <>
              {/* PESTAÑA 1: QR SIMPLE BANECO */}
              {activeTab === 'qr' && (
                <div className="space-y-4 text-center">
                  <div className="bg-white border border-[#EAE4D8] rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs max-w-xs w-full mx-auto">
                    {isLoadingQr ? (
                      <div className="h-52 sm:h-64 flex flex-col items-center justify-center gap-2 text-xs text-[#7A7167]">
                        <Loader2 className="w-8 h-8 animate-spin text-[#C29837]" />
                        <span>Generando código QR Banco Económico...</span>
                      </div>
                    ) : transaction?.qrImageUrl ? (
                      <div className="space-y-3">
                        <div className="relative p-2 bg-[#FFFDF9] border border-[#E8D7B0] rounded-2xl inline-block shadow-inner max-w-full">
                          <img
                            src={transaction.qrImageUrl}
                            alt="Código QR Simple Banco Económico"
                            className="w-48 h-48 sm:w-60 sm:h-60 max-w-full mx-auto rounded-lg object-contain"
                          />
                        </div>

                        {/* Cuenta Regresiva */}
                        <div className="flex items-center justify-center gap-1.5 text-xs text-[#8C6B32] font-semibold bg-[#FAF3E3] py-1.5 px-3 rounded-full border border-[#E8D7B0]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Vigencia del QR: {formatTime(timeLeft)}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[#9E4232]">No se pudo cargar el QR.</p>
                    )}
                  </div>

                  {/* Datos de la cuenta Banco Económico */}
                  <div className="bg-white rounded-2xl p-4 border border-[#EAE4D8] text-left text-xs space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F2ECE1]">
                      <div>
                        <span className="text-[10px] text-[#8C847A] uppercase font-semibold block">Entidad Bancaria</span>
                        <span className="font-semibold text-[#2D2926]">Banco Económico S.A.</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#8C847A] uppercase font-semibold block">Cuenta Destino</span>
                        <span className="font-mono font-bold text-[#C29837]">{accountNumber}</span>
                      </div>
                    </div>

                    <p className="font-semibold text-[#2D2926] flex items-center gap-1.5 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-[#C29837] shrink-0" />
                      <span>Instrucciones de pago desde cualquier banco en Bolivia:</span>
                    </p>
                    <ol className="list-decimal list-inside text-[#6E665D] space-y-1 text-[11px] leading-relaxed">
                      <li>Abre <strong>Baneco Móvil</strong> o la app de tu banco (BNB, BCP, Bisa, Mercantil, Unión, Ganadero, etc.).</li>
                      <li>Selecciona <strong>&ldquo;Pago Simple / Cobro QR&rdquo;</strong>.</li>
                      <li>Escanea este código QR o sube la imagen descargada.</li>
                      <li>Confirma la transferencia de <strong>{amountBob.toFixed(2)} Bs</strong>. El pago se vinculará directamente a la cuenta <strong>{accountNumber}</strong>.</li>
                    </ol>

                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-[#F2ECE1]">
                      <button
                        type="button"
                        onClick={handleCopyAmount}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-[11px] font-semibold text-[#544D46] hover:bg-[#F2ECE1] transition-colors cursor-pointer w-full"
                      >
                        {copiedAmount ? <Check className="w-3.5 h-3.5 text-[#4A634E]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedAmount ? 'Monto Copiado' : `Copiar ${amountBob.toFixed(2)} Bs`}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyAccount}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-[11px] font-semibold text-[#544D46] hover:bg-[#F2ECE1] transition-colors cursor-pointer w-full"
                      >
                        {copiedAccount ? <Check className="w-3.5 h-3.5 text-[#4A634E]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedAccount ? 'Cuenta Copiada' : 'Copiar Cuenta'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadQr}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-[11px] font-semibold text-[#544D46] hover:bg-[#F2ECE1] transition-colors cursor-pointer w-full"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar QR</span>
                      </button>
                    </div>
                  </div>

                  {/* Indicador de Polling / Esperando Pago */}
                  <div className="flex items-center justify-center gap-2 text-[11px] text-[#7A7167]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C29837]" />
                    <span>Esperando confirmación de Banco Económico en tiempo real...</span>
                  </div>

                  {/* Comprobación / Verificación Inmediata */}
                  <div className="pt-2 border-t border-[#F2ECE1] text-center">
                    <button
                      type="button"
                      onClick={handleSimulatePayment}
                      disabled={isSimulating}
                      className="text-xs text-[#8C6B32] hover:text-[#785924] underline cursor-pointer disabled:opacity-50 py-1 inline-flex items-center gap-1.5"
                    >
                      {isSimulating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Consultando confirmación bancaria...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>¿Ya realizaste la transferencia? Verificar acreditación ahora</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* PESTAÑA 2: ATENCIÓN Y TRANSFERENCIA POR WHATSAPP */}
              {activeTab === 'whatsapp' && (
                <div className="bg-white rounded-3xl p-5 border border-[#EAE4D8] text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#EBF8EE] text-[#25D366] flex items-center justify-center mx-auto">
                    <MessageCircle className="w-6 h-6 fill-[#25D366] text-white" />
                  </div>
                  <div>
                    <h4 className="font-memorial text-lg text-[#2D2926]">
                      Atención Personalizada por WhatsApp
                    </h4>
                    <p className="text-xs text-[#6E665D] mt-1 max-w-sm mx-auto leading-relaxed">
                      Si prefieres realizar una transferencia directa a nuestra cuenta de <strong>Banco Económico N° {accountNumber}</strong> o deseas que un asesor te asista en la carga de fotos o redacción de la biografía, escríbenos directamente.
                    </p>
                  </div>

                  <a
                    href={`https://wa.me/59170000000?text=${encodeURIComponent(
                      `Hola, deseo activar el ${plan.name} (${amountBob} Bs) en Hobituario mediante transferencia a la cuenta de Banco Económico ${accountNumber}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
                    <span>Conversar con Asesor por WhatsApp</span>
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
