'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/common/Navbar';
import { SUBSCRIPTION_PLANS } from '../../data/plans';
import { SubscriptionPlan } from '../../types/memorial';
import { Flame, Check, MessageCircle, Heart, HelpCircle, Calendar, Sparkles } from 'lucide-react';

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[1]);
  const [billingCycle, setBillingCycle] = useState<'one-time' | 'annual'>('one-time');
  const whatsappNumber = '59170000000'; // Puedes reemplazarlo por tu número

  const getWhatsAppUrl = (plan: SubscriptionPlan) => {
    const cycleText = billingCycle === 'one-time' ? 'Pago Único (5 Años)' : 'Membresía Anual';
    const text = encodeURIComponent(
      `Hola, me comunico desde Hobituario. Quisiera activar el ${plan.name} en modalidad ${cycleText} (${plan.priceLocal}) para honrar la memoria de un familiar. ¿Cuáles son los pasos a seguir?`
    );
    return `https://wa.me/${whatsappNumber}?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#101216] text-[#2D2926] dark:text-[#EAE6DF] flex flex-col selection:bg-[#E8DED1]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-12">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="font-memorial text-3xl sm:text-5xl text-[#2D2926] font-normal tracking-tight mb-4">
            Planes Diseñados para Honrar <br />
            <span className="font-script text-[#A67C24]">con Amor y Distinción</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#736B63] max-w-xl mx-auto leading-relaxed mb-6">
            Asegura que las fotos, videos, anécdotas y condolencias de tu ser querido permanezcan protegidas en servidores de alta disponibilidad.
          </p>

          {/* Selector de Modalidad: Pago Único vs Anual */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-[#EAE2D5] border border-[#D8CABE] shadow-xs">
            <button
              onClick={() => setBillingCycle('one-time')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                billingCycle === 'one-time'
                  ? 'bg-white text-[#2D2926] shadow-xs'
                  : 'text-[#6B635A] hover:text-[#2D2926]'
              }`}
            >
              Pago Único (Preservación 5 Años)
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const priceDisplay = billingCycle === 'one-time'
              ? plan.priceLocal
              : `${Math.round(plan.priceUSD * 0.6)} USD / año`;

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`bg-white dark:bg-[#171A20] rounded-3xl p-7 transition-all duration-300 relative flex flex-col justify-between cursor-pointer border ${
                  plan.isPopular
                    ? 'border-[#C29837] shadow-xl ring-2 ring-[#C29837]/20 scale-102'
                    : 'border-[#EAE4D8] dark:border-[#282E39] shadow-sm hover:shadow-md'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#2D2926] dark:bg-[#C29837] text-[#F3ECE0] dark:text-[#101216] px-3.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase shadow-sm">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <h3 className="font-memorial text-xl text-[#2D2926] dark:text-[#EAE6DF] font-semibold mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-[#7A7167] dark:text-[#9A9388] font-script mb-6 min-h-[32px]">
                    {plan.tagline}
                  </p>

                  {/* Precios */}
                  <div className="mb-6 pb-6 border-b border-[#F2ECE1] dark:border-[#282E39]">
                    <div className="flex items-baseline gap-2">
                      <span className="font-memorial text-3xl sm:text-4xl font-normal text-[#2D2926] dark:text-white">
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
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-[#524B44] dark:text-[#C5BEB5]">
                        <div className="w-4 h-4 rounded-full bg-[#FAF3E3] dark:bg-[#262C38] text-[#C29837] flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Botón WhatsApp de adquisición */}
                <div className="pt-4 border-t border-[#F2ECE1] dark:border-[#282E39]">
                  <a
                    href={getWhatsAppUrl(plan)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-semibold transition-all shadow-sm ${
                      plan.isPopular
                        ? 'bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-md'
                        : 'bg-[#2D2926] dark:bg-[#C29837] hover:bg-[#433E3A] text-white dark:text-[#101216]'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4 fill-white dark:fill-[#101216]" />
                    <span>Adquirir Plan por WhatsApp</span>
                  </a>
                  <p className="text-[10px] text-center text-[#9E9488] mt-2">
                    Atención y soporte inmediato para familias
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Banner de Asistencia Personalizada */}
        <div className="bg-[#FAF7F2] dark:bg-[#171A20] border border-[#E2D5C3] dark:border-[#282E39] rounded-3xl p-8 sm:p-10 mb-16 text-center max-w-3xl mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#F3ECE0] dark:bg-[#242A35] border border-[#DFCDB8] dark:border-[#38404F] flex items-center justify-center text-[#C29837] mx-auto mb-4">
            <Heart className="w-6 h-6 text-[#C29837]" />
          </div>
          <h2 className="font-memorial text-2xl text-[#2D2926] dark:text-[#EAE6DF] mb-2">
            ¿Necesitas ayuda para redactar la biografía o cargar fotos?
          </h2>
          <p className="text-xs sm:text-sm text-[#736B63] dark:text-[#9A9388] max-w-lg mx-auto mb-6">
            Te asistimos paso a paso por WhatsApp para recopilar los recuerdos, armar las ceremonias y enviarte la tarjeta con QR lista para imprimir.
          </p>
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola, necesito asesoría personalizada para crear el memorial de un familiar en Hobituario.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#25D366] text-white text-xs sm:text-sm font-semibold hover:bg-[#20ba5a] shadow-md transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Hablar con un Asesor por WhatsApp</span>
          </a>
        </div>
      </main>
    </div>
  );
}
