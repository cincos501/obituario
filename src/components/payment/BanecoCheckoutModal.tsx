'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SubscriptionPlan } from '../../types/memorial';
import { 
  banecoPaymentService, 
  BanecoTransaction, 
  PLAN_PRICES_BOB 
} from '../../services/banecoPaymentService';
import { 
  QrCode, 
  CreditCard, 
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
  Building2,
  Lock
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
  const [activeTab, setActiveTab] = useState<'qr' | 'card' | 'whatsapp'>('qr');
  const [transaction, setTransaction] = useState<BanecoTransaction | null>(null);
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Formulario de Tarjeta
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState(initialPayerName);
  const [documentNumber, setDocumentNumber] = useState('');
  const [payerEmail, setPayerEmail] = useState(initialPayerEmail);
  const [payerPhone, setPayerPhone] = useState(initialPayerPhone);

  // Countdown timer para el QR (15 minutos = 900s)
  const [timeLeft, setTimeLeft] = useState<number>(900);

  const amountBob = PLAN_PRICES_BOB[plan.id] || 341.00;

  // 1. Inicializar Orden QR con Baneco al abrir el modal
  const initQrOrder = useCallback(async () => {
    setIsLoadingQr(true);
    setErrorMessage(null);
    try {
      const tx = await banecoPaymentService.createQrOrder({
        planId: plan.id,
        planName: plan.name,
        payerName: cardHolder || 'Familiar Titular',
        payerEmail: payerEmail || undefined,
        payerPhone: payerPhone || undefined,
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
  }, [plan.id, plan.name, cardHolder, payerEmail, payerPhone, obituaryId]);

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

  // 4. Procesar Pago con Tarjeta
  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvv || !cardHolder || !documentNumber) {
      setErrorMessage('Por favor completa todos los datos de la tarjeta y tu cédula/NIT.');
      return;
    }

    setIsProcessingCard(true);
    setErrorMessage(null);

    try {
      const result = await banecoPaymentService.processCardPayment({
        planId: plan.id,
        cardNumber,
        cardExpiry,
        cardCvv,
        cardHolder,
        documentNumber,
        payerEmail: payerEmail || undefined,
        payerPhone: payerPhone || undefined,
        obituaryId,
      });

      if (result.success && result.transaction) {
        setTransaction(result.transaction);
        setIsSuccess(true);
        if (onPaymentSuccess) onPaymentSuccess(result.transaction);
      } else {
        setErrorMessage(result.message || 'Transacción denegada por el banco emisor.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Error procesando el pago con tarjeta.');
    } finally {
      setIsProcessingCard(false);
    }
  };

  // 5. Simular Pago Exitoso en Modo Sandbox
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

  // Copiar al portapapeles
  const handleCopyAmount = () => {
    navigator.clipboard.writeText(amountBob.toFixed(2));
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleCopyTx = () => {
    if (transaction) {
      navigator.clipboard.writeText(transaction.transactionNumber);
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    }
  };

  // Descargar imagen QR
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
        <div className="bg-[#2D2926] text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#A69D92] hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
            aria-label="Cerrar ventana de pago"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-[#C29837] flex items-center justify-center text-white font-bold text-xs shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E8D7B0]">
              Pasarela Banco Económico (Baneco)
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-4 mt-1">
            <div>
              <h2 className="font-memorial text-xl sm:text-2xl font-normal text-white">
                {plan.name}
              </h2>
              <p className="text-xs text-[#C5BEB5] mt-0.5">
                Preservación Digital de Recuerdos Eternos
              </p>
            </div>
            <div className="text-right">
              <span className="font-memorial text-2xl sm:text-3xl text-[#F5C354] font-normal">
                {amountBob.toFixed(2)} Bs
              </span>
              <span className="block text-[11px] text-[#A69D92]">
                (~${plan.priceUSD} USD)
              </span>
            </div>
          </div>
        </div>

        {/* Pestañas de Selección de Medio de Pago */}
        {!isSuccess && (
          <div className="flex border-b border-[#EAE4D8] bg-[#F2ECE1]/60 px-4 pt-2 gap-2">
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-b-2 cursor-pointer ${
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
              onClick={() => setActiveTab('card')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                activeTab === 'card'
                  ? 'bg-white text-[#2D2926] border-[#C29837] shadow-xs'
                  : 'text-[#6B635A] hover:text-[#2D2926] border-transparent'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-[#C29837]" />
              <span>Tarjeta Débito/Crédito</span>
            </button>

            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                activeTab === 'whatsapp'
                  ? 'bg-white text-[#2D2926] border-[#25D366] shadow-xs'
                  : 'text-[#6B635A] hover:text-[#2D2926] border-transparent'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              <span>Asistencia</span>
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
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A634E] bg-[#EBF0EB] px-3 py-1 rounded-full">
                  ¡Pago Confirmado por Banco Económico!
                </span>
                <h3 className="font-memorial text-2xl text-[#2D2926] font-normal mt-2">
                  Membresía Activada con Éxito
                </h3>
                <p className="text-xs text-[#7A7167] mt-1 max-w-sm mx-auto">
                  Tu comprobante ha sido registrado y el memorial cuenta ahora con todos los beneficios del <strong>{plan.name}</strong>.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-[#D8CABE] p-4 text-left text-xs space-y-2 max-w-sm mx-auto shadow-xs">
                <div className="flex justify-between pb-1.5 border-b border-[#F2ECE1]">
                  <span className="text-[#7A7167]">Número de Transacción:</span>
                  <span className="font-mono font-semibold text-[#2D2926]">{transaction.transactionNumber}</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-[#F2ECE1]">
                  <span className="text-[#7A7167]">Código de Autorización:</span>
                  <span className="font-mono font-semibold text-[#C29837]">{transaction.bankAuthorizationCode || 'AUTH-BANECO-OK'}</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-[#F2ECE1]">
                  <span className="text-[#7A7167]">Monto Pagado:</span>
                  <span className="font-semibold text-[#2D2926]">{transaction.amountBob.toFixed(2)} Bs (~${transaction.amountUsd} USD)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A7167]">Método:</span>
                  <span className="font-semibold text-[#2D2926]">
                    {transaction.paymentMethod === 'qr_simple' ? 'QR Simple Interoperable' : 'Tarjeta Baneco / Red Enlace'}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full max-w-sm py-3 rounded-full bg-[#2D2926] text-white text-xs font-semibold hover:bg-[#433E3A] transition-all shadow-md cursor-pointer"
              >
                Continuar
              </button>
            </div>
          ) : (
            <>
              {/* PESTAÑA 1: QR SIMPLE BANECO */}
              {activeTab === 'qr' && (
                <div className="space-y-4 text-center">
                  <div className="bg-white border border-[#EAE4D8] rounded-3xl p-5 shadow-xs max-w-xs mx-auto">
                    {isLoadingQr ? (
                      <div className="h-64 flex flex-col items-center justify-center gap-2 text-xs text-[#7A7167]">
                        <Loader2 className="w-8 h-8 animate-spin text-[#C29837]" />
                        <span>Generando código ASFI Baneco...</span>
                      </div>
                    ) : transaction?.qrImageUrl ? (
                      <div className="space-y-3">
                        <div className="relative p-2 bg-[#FFFDF9] border border-[#E8D7B0] rounded-2xl inline-block shadow-inner">
                          <img
                            src={transaction.qrImageUrl}
                            alt="Código QR Simple Baneco"
                            className="w-56 h-56 mx-auto rounded-lg object-contain"
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

                  {/* Instrucciones de Pago */}
                  <div className="bg-white rounded-2xl p-4 border border-[#EAE4D8] text-left text-xs space-y-2">
                    <p className="font-semibold text-[#2D2926] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C29837]" />
                      <span>¿Cómo pagar desde cualquier banco en Bolivia?</span>
                    </p>
                    <ol className="list-decimal list-inside text-[#6E665D] space-y-1 text-[11px] leading-relaxed">
                      <li>Abre la app de tu banco móvil favorito (<strong>Baneco, BNB, BCP, Bisa, Mercantil, Unión, Ganadero, etc.</strong>).</li>
                      <li>Selecciona la opción <strong>&ldquo;Pago Simple / Cobro QR&rdquo;</strong>.</li>
                      <li>Escanea este código o sube la imagen descargada.</li>
                      <li>Confirma el monto de <strong>{amountBob.toFixed(2)} Bs</strong>. El sistema se activará en segundos automáticamente.</li>
                    </ol>

                    <div className="pt-2 flex flex-wrap gap-2 border-t border-[#F2ECE1]">
                      <button
                        type="button"
                        onClick={handleCopyAmount}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-[11px] font-semibold text-[#544D46] hover:bg-[#F2ECE1] transition-colors"
                      >
                        {copiedAmount ? <Check className="w-3.5 h-3.5 text-[#4A634E]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedAmount ? 'Monto Copiado' : `Copiar ${amountBob.toFixed(2)} Bs`}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadQr}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-[11px] font-semibold text-[#544D46] hover:bg-[#F2ECE1] transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar QR</span>
                      </button>
                    </div>
                  </div>

                  {/* Indicador de Polling / Esperando Pago */}
                  <div className="flex items-center justify-center gap-2 text-[11px] text-[#7A7167]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C29837]" />
                    <span>Esperando confirmación bancaria en tiempo real...</span>
                  </div>

                  {/* BOTÓN MODO SANDBOX / PRUEBAS INMEDIATAS */}
                  <div className="p-3 rounded-2xl bg-[#FFF8E6] border border-[#E8D7B0] text-center space-y-2">
                    <span className="text-[10px] font-bold text-[#8C6B32] uppercase tracking-wider block">
                      Entorno de Pruebas / Sandbox Baneco
                    </span>
                    <button
                      type="button"
                      onClick={handleSimulatePayment}
                      disabled={isSimulating}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#8C6B32] hover:bg-[#785924] text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSimulating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>Simular Pago Exitoso (1 Clic)</span>
                    </button>
                    <p className="text-[10px] text-[#7A7167]">
                      Permite probar la confirmación automática e inmediata sin transferir fondos reales.
                    </p>
                  </div>
                </div>
              )}

              {/* PESTAÑA 2: TARJETA DÉBITO / CRÉDITO BANECO */}
              {activeTab === 'card' && (
                <form onSubmit={handleCardSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#544D46] mb-1">
                      Número de Tarjeta (Visa / Mastercard Baneco)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={19}
                        placeholder="4500 0000 0000 0000"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-white text-xs sm:text-sm text-[#2D2926] focus:outline-none focus:ring-2 focus:ring-[#C29837]/40"
                      />
                      <CreditCard className="w-4 h-4 text-[#8C847A] absolute right-3 top-3" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#544D46] mb-1">
                        Vencimiento (MM/AA)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        placeholder="MM/AA"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926] focus:outline-none focus:ring-2 focus:ring-[#C29837]/40 text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#544D46] mb-1 flex items-center justify-between">
                        <span>CVV</span>
                        <span className="text-[10px] text-[#8C847A]">3 dígitos</span>
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926] focus:outline-none focus:ring-2 focus:ring-[#C29837]/40 text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#544D46] mb-1">
                      Nombre del Titular (Como figura en la tarjeta)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ej. MARIANA DE MENDOZA"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926] focus:outline-none focus:ring-2 focus:ring-[#C29837]/40"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#544D46] mb-1">
                        Cédula de Identidad o NIT
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ej. 5892341 LP"
                        value={documentNumber}
                        onChange={(e) => setDocumentNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926] focus:outline-none focus:ring-2 focus:ring-[#C29837]/40"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#544D46] mb-1">
                        Correo para Factura
                      </label>
                      <input
                        type="email"
                        placeholder="familiar@email.com"
                        value={payerEmail}
                        onChange={(e) => setPayerEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926] focus:outline-none focus:ring-2 focus:ring-[#C29837]/40"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingCard}
                    className="w-full py-3 rounded-full bg-[#2D2926] hover:bg-[#433E3A] text-white text-xs sm:text-sm font-semibold transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                  >
                    {isProcessingCard ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#C29837]" />
                        <span>Procesando con Baneco...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-[#C29837]" />
                        <span>Pagar {amountBob.toFixed(2)} Bs</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-[#8C847A] flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#4A634E]" />
                    <span>Conexión cifrada TLS 1.3 procesada bajo normativa ASFI Bolivia</span>
                  </p>
                </form>
              )}

              {/* PESTAÑA 3: ASISTENCIA Y TRANSFERENCIA DIRECTA */}
              {activeTab === 'whatsapp' && (
                <div className="bg-white rounded-3xl p-5 border border-[#EAE4D8] text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#EBF8EE] text-[#25D366] flex items-center justify-center mx-auto">
                    <MessageCircle className="w-6 h-6 fill-[#25D366] text-white" />
                  </div>
                  <div>
                    <h4 className="font-memorial text-lg text-[#2D2926]">
                      Atención Concierge para Familias
                    </h4>
                    <p className="text-xs text-[#6E665D] mt-1 max-w-sm mx-auto leading-relaxed">
                      Si prefieres pagar mediante transferencia directa a nuestra cuenta bancaria en Banco Económico o necesitas asistencia para redactar la biografía, te atendemos con calidez por WhatsApp.
                    </p>
                  </div>

                  <a
                    href={`https://wa.me/59170000000?text=${encodeURIComponent(
                      `Hola, deseo activar el ${plan.name} (${amountBob} Bs) en Hobituario mediante Banco Económico o transferencia.`
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
