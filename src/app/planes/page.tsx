'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../components/common/Navbar';
import { SUBSCRIPTION_PLANS } from '../../data/plans';
import { SubscriptionPlan } from '../../types/memorial';
import { BanecoCheckoutModal } from '../../components/payment/BanecoCheckoutModal';
import { 
  Flame, 
  Check, 
  MessageCircle, 
  Heart, 
  HelpCircle, 
  Calendar, 
  Sparkles,
  QrCode,
  Building2,
  Lock,
  ArrowRight
} from 'lucide-react';

export default function PlansPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[1]);
  const [billingCycle, setBillingCycle] = useState<'one-time' | 'annual'>('one-time');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[1]);

  const whatsappNumber = '59170000000';

  const getWhatsAppUrl = (plan: SubscriptionPlan) => {
    const cycleText = billingCycle === 'one-time' ? 'Pago Único (5 Años)' : 'Membresía Anual';
    const text = encodeURIComponent(
      `Hola, me comunico desde Hobituario. Quisiera activar el ${plan.name} en modalidad ${cycleText} (${plan.priceLocal}) para honrar la memoria de un familiar. ¿Cuáles son los pasos a seguir?`
    );
    return `https://wa.me/${whatsappNumber}?text=${text}`;
  };

  const handleOpenCheckout = (plan: SubscriptionPlan, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCheckoutPlan(plan);
    setIsCheckoutOpen(true);
  };

  const handlePaymentSuccess = (tx: any) => {
    router.push(`/crear?plan=${tx.planId}&tx=${tx.transactionNumber}`);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#2D2926] flex flex-col selection:bg-[#E8DED1]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-12">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF3E3] border border-[#E8D7B0] text-[#8C6B32] text-xs font-semibold mb-4">
            <span>Cobros Digitales Banco Económico (Baneco) • QR Simple ASFI</span>
          </div>

          <h1 className="font-memorial text-3xl sm:text-5xl text-[#2D2926] font-normal tracking-tight mb-4">
            Planes Diseñados para Honrar <br />
            <span className="font-script text-[#A67C24]">con Amor y Distinción</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#736B63] max-w-xl mx-auto leading-relaxed mb-6">
            Asegura que las fotos, videos, anécdotas y condolencias de tu ser querido permanezcan protegidas en servidores de alta disponibilidad con respaldo garantizado.
          </p>

          {/* Selector de Modalidad: Pago Único vs Anual */}
          <div className="flex flex-col sm:inline-flex sm:flex-row items-stretch sm:items-center gap-1.5 p-1.5 rounded-2xl bg-[#EAE2D5] border border-[#D8CABE] shadow-xs max-w-sm sm:max-w-none mx-auto">
            <button
              onClick={() => setBillingCycle('one-time')}
              className={`px-4 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                billingCycle === 'one-time'
                  ? 'bg-white text-[#2D2926] shadow-xs'
                  : 'text-[#6B635A] hover:text-[#2D2926]'
              }`}
            >
              Pago Único (Preservación 5 Años)
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                billingCycle === 'annual'
                  ? 'bg-white text-[#2D2926] shadow-xs'
                  : 'text-[#6B635A] hover:text-[#2D2926]'
              }`}
            >
              Membresía Anual con Renovación
            </button>
          </div>
        </div>

        {/* Tarjetas de Planes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const priceDisplay = billingCycle === 'one-time'
              ? plan.priceLocal
              : `${Math.round(plan.priceUSD * 0.6)} USD / año`;

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`bg-white rounded-3xl p-7 transition-all duration-300 relative flex flex-col justify-between border ${
                  plan.isPopular
                    ? 'border-[#C29837] shadow-xl ring-2 ring-[#C29837]/20 scale-102'
                    : 'border-[#EAE4D8] shadow-sm hover:shadow-md'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#8C6B32] text-white px-3.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase shadow-sm">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <h3 className="font-memorial text-xl text-[#2D2926] font-semibold mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-[#7A7167] font-script mb-6 min-h-[32px]">
                    {plan.tagline}
                  </p>

                  {/* Precios */}
                  <div className="mb-6 pb-6 border-b border-[#F2ECE1]">
                    <div className="flex items-baseline gap-2">
                      <span className="font-memorial text-3xl sm:text-4xl font-normal text-[#2D2926]">
                        {priceDisplay}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#A69D92] tracking-wide block mt-1">
                      {billingCycle === 'one-time' ? 'Preservación de 5 años garantizada' : 'Renovación anual flexible'}
                    </span>
                  </div>

                  {/* Lista de características */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-[#524B44]">
                        <div className="w-4 h-4 rounded-full bg-[#FAF3E3] text-[#C29837] flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Botones de Pago y Adquisición */}
                <div className="pt-4 border-t border-[#F2ECE1] space-y-2.5">
                  <button
                    type="button"
                    onClick={(e) => handleOpenCheckout(plan, e)}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-semibold transition-all shadow-sm cursor-pointer ${
                      plan.isPopular
                        ? 'bg-[#8C6B32] hover:bg-[#785924] text-white shadow-md'
                        : 'bg-[#2D2926] hover:bg-[#433E3A] text-white'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-[#F5C354]" />
                    <span>Pagar con Baneco (QR Simple)</span>
                  </button>

                  <a
                    href={getWhatsAppUrl(plan)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-[11px] font-semibold transition-all border border-[#D8CABE] bg-[#FAF7F2] text-[#544D46] hover:bg-[#F2ECE1]"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>Adquirir por WhatsApp</span>
                  </a>

                  <p className="text-[10px] text-center text-[#9E9488]">
                    Activación inmediata con comprobante digital
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Banner de Asistencia Personalizada */}
        <div className="bg-[#FAF7F2] border border-[#E2D5C3] rounded-3xl p-8 sm:p-10 mb-16 text-center max-w-3xl mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#F3ECE0] border border-[#DFCDB8] flex items-center justify-center text-[#C29837] mx-auto mb-4">
            <Heart className="w-6 h-6 text-[#C29837]" />
          </div>
          <h2 className="font-memorial text-2xl text-[#2D2926] mb-2">
            ¿Necesitas ayuda para redactar la biografía o cargar fotos?
          </h2>
          <p className="text-xs sm:text-sm text-[#736B63] max-w-lg mx-auto mb-6">
            Te asistimos paso a paso por WhatsApp para recopilar los recuerdos, armar las ceremonias y enviarte la tarjeta con QR lista para imprimir.
          </p>
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola, necesito asesoría personalizada para crear el memorial de un familiar en Hobituario.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#25D366] text-white text-xs sm:text-sm font-semibold hover:bg-[#20ba5a] shadow-md transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
            <span>Hablar con un Asesor por WhatsApp</span>
          </a>
        </div>
      </main>

      {/* Modal Checkout Baneco */}
      <BanecoCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        plan={checkoutPlan}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
