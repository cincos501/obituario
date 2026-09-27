'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../components/common/Navbar';
import { InstallPwaBanner } from '../components/common/InstallPwaBanner';
import { SUBSCRIPTION_PLANS } from '../data/plans';
import { 
  Flame, 
  Heart, 
  ShieldCheck, 
  QrCode, 
  MapPin, 
  Palette, 
  Smartphone, 
  Check, 
  ArrowRight, 
  MessageCircle,
  Lock,
  Tag,
  LogIn
} from 'lucide-react';

export default function HomePage() {
  const [billingCycle, setBillingCycle] = useState<'one-time' | 'annual'>('one-time');
  const whatsappNumber = '59170000000';

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#2D2926] flex flex-col selection:bg-[#E8DED1]">
      <Navbar />

      <main className="flex-1">
        {/* HERO SAAS: PROPUESTA DE VALOR Y PRESENTACIÓN */}
        <section className="relative pt-16 pb-20 px-4 sm:px-6 overflow-hidden ambient-glow border-b border-[#EAE4D8] text-center">
          <div className="max-w-4xl mx-auto relative z-10">
            <h1 className="font-memorial text-4xl sm:text-6xl text-[#2D2926] font-normal tracking-tight leading-[1.12] mb-6">
              El Santuario Digital para Preservar la Memoria <br />
              <span className="font-script text-[#A67C24]">de Quienes Siempre Vivirán en Ti</span>
            </h1>

            <p className="text-sm sm:text-lg text-[#6E665D] max-w-2xl mx-auto leading-relaxed mb-10">
              Crea un espacio eterno, digno y protegido para tu ser querido. Reúne a familiares de todo el mundo para encender velas virtuales, compartir anécdotas y generar un código QR único para su lápida o recordatorio impreso.
            </p>

            {/* CTAs Principales */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="#planes"
                className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#8C6B32] hover:bg-[#785924] text-white text-xs sm:text-sm font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <Tag className="w-4 h-4 text-[#F5C354]" />
                <span>Ver Planes y Membresías</span>
                <ArrowRight className="w-4 h-4 text-[#F5C354]" />
              </a>

              <Link
                href="/login"
                className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-[#4A4540] border border-[#DFCDB8] text-xs sm:text-sm font-semibold hover:bg-[#F3ECE0] transition-colors shadow-xs cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-[#8C6B32]" />
                <span>¿Ya tienes cuenta? Ingresar</span>
              </Link>
            </div>
          </div>
        </section>

        {/* MÉTRICAS DE CONFIANZA Y RESPETO */}
        <section className="bg-white border-b border-[#EAE4D8] py-8 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <p className="font-memorial text-2xl sm:text-3xl font-semibold text-[#2D2926]">+1.400</p>
              <p className="text-xs text-[#7A7167]">Familias acompañadas</p>
            </div>
            <div>
              <p className="font-memorial text-2xl sm:text-3xl font-semibold text-[#2D2926]">99.9%</p>
              <p className="text-xs text-[#7A7167]">Disponibilidad en la nube</p>
            </div>
            <div>
              <p className="font-memorial text-2xl sm:text-3xl font-semibold text-[#2D2926]">100%</p>
              <p className="text-xs text-[#7A7167]">Moderado y protegido</p>
            </div>
            <div>
              <p className="font-memorial text-2xl sm:text-3xl font-semibold text-[#2D2926]">Vitalicio</p>
              <p className="text-xs text-[#7A7167]">Preservación garantizada</p>
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA EL SERVICIO EN 3 PASOS */}
        <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C29837] block mb-2">
              Sencillo, emotivo y digno
            </span>
            <h2 className="font-memorial text-3xl sm:text-4xl text-[#2D2926]">
              ¿Cómo Funciona Hobituario?
            </h2>
            <p className="text-xs sm:text-sm text-[#736B63] max-w-lg mx-auto mt-2">
              En menos de 5 minutos tendrás un memorial en línea listo para compartir con tus seres queridos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Paso 1 */}
            <div className="bg-white border border-[#EAE4D8] rounded-3xl p-7 shadow-sm relative">
              <span className="w-8 h-8 rounded-full bg-[#FAF3E3] text-[#C29837] font-bold text-xs flex items-center justify-center mb-4">
                1
              </span>
              <h3 className="font-memorial text-lg font-semibold text-[#2D2926] mb-2">
                Elige tu Membresía
              </h3>
              <p className="text-xs text-[#6B635A] leading-relaxed">
                Selecciona entre el Plan Esencial, Homenaje Legado o Infinito. Adquiérelo al instante por WhatsApp o transferencia sin comisiones ocultas.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="bg-white border border-[#EAE4D8] rounded-3xl p-7 shadow-sm relative">
              <span className="w-8 h-8 rounded-full bg-[#FAF3E3] text-[#C29837] font-bold text-xs flex items-center justify-center mb-4">
                2
              </span>
              <h3 className="font-memorial text-lg font-semibold text-[#2D2926] mb-2">
                Personaliza con Cariño
              </h3>
              <p className="text-xs text-[#6B635A] leading-relaxed">
                Desde tu Panel Familiar privado, sube sus fotos, escribe su biografía, agrega los horarios de las misas y elige los colores y tipografías que mejor lo representen.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="bg-white border border-[#EAE4D8] rounded-3xl p-7 shadow-sm relative">
              <span className="w-8 h-8 rounded-full bg-[#FAF3E3] text-[#C29837] font-bold text-xs flex items-center justify-center mb-4">
                3
              </span>
              <h3 className="font-memorial text-lg font-semibold text-[#2D2926] mb-2">
                Comparte el Legado
              </h3>
              <p className="text-xs text-[#6B635A] leading-relaxed">
                Envía el enlace a familiares o descarga la tarjeta con código QR en PDF para imprimirla en los recordatorios o colocarla en su lápida en el cementerio.
              </p>
            </div>
          </div>
        </section>

        {/* BENEFICIOS EXCLUSIVOS DEL SAAS */}
        <section className="bg-[#FAF7F2] border-y border-[#EAE4D8] py-20 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-memorial text-3xl sm:text-4xl text-[#2D2926] mb-2">
                Todo lo que Tu Familia Necesita en un Solo Lugar
              </h2>
              <p className="text-xs sm:text-sm text-[#736B63] max-w-lg mx-auto">
                Tecnología diseñada con serenidad y el más profundo respeto.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-[#EAE4D8] shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#FAF3E3] text-[#C29837] flex items-center justify-center mb-3">
                  <Flame className="w-5 h-5 animate-flame" />
                </div>
                <h4 className="font-memorial text-base font-semibold text-[#2D2926] mb-1.5">
                  Velas Virtuales Vivas
                </h4>
                <p className="text-xs text-[#6E665D] leading-relaxed">
                  Amigos de cualquier parte del mundo pueden encender una vela con una animación de llama y enviar flores con palabras de cariño.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#EAE4D8] shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#EBF0EB] text-[#4A634E] flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-memorial text-base font-semibold text-[#2D2926] mb-1.5">
                  Moderación Familiar Estricta
                </h4>
                <p className="text-xs text-[#6E665D] leading-relaxed">
                  Filtro automático de palabras ofensivas y panel para que tú apruebes o rechaces cada condolencia antes de que sea pública.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#EAE4D8] shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#F0EBE6] text-[#7A6126] flex items-center justify-center mb-3">
                  <QrCode className="w-5 h-5" />
                </div>
                <h4 className="font-memorial text-base font-semibold text-[#2D2926] mb-1.5">
                  Código QR para Lápidas y PDF
                </h4>
                <p className="text-xs text-[#6E665D] leading-relaxed">
                  Descarga una tarjeta conmemorativa en PDF con el QR nítido para imprimirlo en las estampitas de misa o grabarlo en una placa fúnebre.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#EAE4D8] shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#F0F4FA] text-[#3D5B94] flex items-center justify-center mb-3">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="font-memorial text-base font-semibold text-[#2D2926] mb-1.5">
                  Mapas de Ceremonias Gratuitos
                </h4>
                <p className="text-xs text-[#6E665D] leading-relaxed">
                  Mapas interactivos basados en OpenStreetMap para que los asistentes lleguen fácilmente a la iglesia o camposanto.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#EAE4D8] shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#FAF0F5] text-[#8C3D6E] flex items-center justify-center mb-3">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h4 className="font-memorial text-base font-semibold text-[#2D2926] mb-1.5">
                  App PWA Descargable
                </h4>
                <p className="text-xs text-[#6E665D] leading-relaxed">
                  Los familiares directos pueden instalar el memorial como una aplicación en su pantalla de inicio y verlo incluso sin conexión.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#EAE4D8] shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#FAF3E3] text-[#C29837] flex items-center justify-center mb-3">
                  <Palette className="w-5 h-5" />
                </div>
                <h4 className="font-memorial text-base font-semibold text-[#2D2926] mb-1.5">
                  Diseño y Fuentes Editables
                </h4>
                <p className="text-xs text-[#6E665D] leading-relaxed">
                  Personaliza tipografías serenas, paletas de color y fondos para que el memorial refleje con fidelidad su esencia.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TABLA DE PLANES Y MEMBRESÍAS EN LA HOME */}
        <section id="planes" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C29837] block mb-2">
              Planes transparentes
            </span>
            <h2 className="font-memorial text-3xl sm:text-4xl text-[#2D2926]">
              Membresías de Preservación Digital
            </h2>
            <p className="text-xs sm:text-sm text-[#736B63] mt-2">
              Sin cuotas sorpresa. Elige la modalidad que prefieras y activa por WhatsApp.
            </p>

            <div className="flex flex-col sm:inline-flex sm:flex-row items-stretch sm:items-center gap-1.5 p-1.5 rounded-2xl bg-[#EAE2D5] border border-[#D8CABE] mt-6 max-w-sm sm:max-w-none mx-auto">
              <button
                onClick={() => setBillingCycle('one-time')}
                className={`px-4 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${billingCycle === 'one-time'
                    ? 'bg-white text-[#2D2926] shadow-xs'
                    : 'text-[#6B635A]'
                  }`}
              >
                Pago Único (5 Años)
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${billingCycle === 'annual'
                    ? 'bg-white text-[#2D2926] shadow-xs'
                    : 'text-[#6B635A]'
                  }`}
              >
                Membresía Anual
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const priceDisplay = billingCycle === 'one-time'
                ? plan.priceLocal
                : `${Math.round(plan.priceUSD * 0.6)} USD / año`;

              const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                `Hola, deseo activar el ${plan.name} (${priceDisplay}) en Hobituario para crear el memorial de un familiar.`
              )}`;

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-3xl p-7 flex flex-col justify-between border ${plan.isPopular
                      ? 'border-[#C29837] shadow-xl ring-2 ring-[#C29837]/20 scale-102'
                      : 'border-[#EAE4D8] shadow-sm'
                    }`}
                >
                  <div>
                    {plan.badge && (
                      <span className="inline-block px-3 py-1 rounded-full bg-[#8C6B32] text-white text-[10px] font-semibold uppercase mb-3">
                        {plan.badge}
                      </span>
                    )}
                    <h3 className="font-memorial text-xl text-[#2D2926] font-semibold mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-[#7A7167] font-script mb-6 min-h-[32px]">
                      {plan.tagline}
                    </p>

                    <div className="mb-6 pb-6 border-b border-[#F2ECE1]">
                      <span className="font-memorial text-3xl sm:text-4xl font-normal text-[#2D2926]">
                        {priceDisplay}
                      </span>
                    </div>

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

                  <div className="space-y-2 pt-2 border-t border-[#F2ECE1]">
                    <Link
                      href={`/crear?plan=${plan.id}`}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-semibold transition-all shadow-sm ${
                        plan.isPopular
                          ? 'bg-[#8C6B32] hover:bg-[#785924] text-white shadow-md'
                          : 'bg-[#2D2926] hover:bg-[#433E3A] text-white'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-[#F5C354]" />
                      <span>Pagar con Baneco (QR Simple)</span>
                    </Link>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold transition-all border border-[#D8CABE] bg-[#FAF7F2] text-[#544D46] hover:bg-[#F2ECE1]"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>Consultar por WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* FOOTER SOLEMNE */}
      <footer className="bg-[#38322B] text-[#FBF9F5] py-12 px-4 sm:px-6 border-t border-[#4E463E]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#C5BEB5]">
          <div className="flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-[#F5C354] animate-flame" />
            <span className="font-memorial text-base text-[#FBF9F5]">Hobituario</span>
            <span>— Plataforma de Preservación y Paz Eterna</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center sm:justify-end">
            <Link href="/planes" className="hover:text-white transition-colors">Membresías</Link>
            <span>•</span>
            <Link href="/login" className="hover:text-white transition-colors">Ingresar</Link>
            <span>•</span>
            <Link href="/terminos" className="text-[#E8D7B0] hover:text-white transition-colors font-medium">Términos y Condiciones</Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-white transition-colors">Super Admin</Link>
          </div>
        </div>
      </footer>

      <InstallPwaBanner />
    </div>
  );
}
