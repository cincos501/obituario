'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../components/common/Navbar';
import { InstallPwaBanner } from '../components/common/InstallPwaBanner';
import { SUBSCRIPTION_PLANS } from '../data/plans';
import {
  Flame,
  Heart,
  QrCode,
  ShieldCheck,
  Smartphone,
  MapPin,
  FileText,
  Check,
  MessageCircle,
  ArrowRight,
  Lock,
  Sparkles,
  Users,
  Share2,
  Palette,
  Clock,
  Tag
} from 'lucide-react';

export default function HomePage() {
  const [billingCycle, setBillingCycle] = useState<'one-time' | 'annual'>('one-time');
  const [privateSearchQuery, setPrivateSearchQuery] = useState('');
  const whatsappNumber = '59170000000';

  const handlePrivateSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!privateSearchQuery.trim()) return;
    // Si escribe el slug o nombre, redirigir
    const cleanSlug = privateSearchQuery.trim().toLowerCase().replace(/\s+/g, '-');
    window.location.href = `/memorial/${cleanSlug}`;
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#101216] text-[#2D2926] dark:text-[#EAE6DF] flex flex-col selection:bg-[#E8DED1]">
      <Navbar />

      <main className="flex-1">
        {/* HERO SAAS: PROPUESTA DE VALOR Y PRESENTACIÓN */}
        <section className="relative pt-16 pb-20 px-4 sm:px-6 overflow-hidden ambient-glow border-b border-[#EAE4D8] dark:border-[#282E39] text-center">
          <div className="max-w-4xl mx-auto relative z-10">
            {/* Badge de confianza */}


            <h1 className="font-memorial text-4xl sm:text-6xl text-[#2D2926] dark:text-[#EAE6DF] font-normal tracking-tight leading-[1.12] mb-6">
              El Santuario Digital para Preservar la Memoria <br />
              <span className="font-script text-[#A67C24] dark:text-[#E5B84A]">de Quienes Siempre Vivirán en Ti</span>
            </h1>

            <p className="text-sm sm:text-lg text-[#6E665D] dark:text-[#9A9388] max-w-2xl mx-auto leading-relaxed mb-10">
              Crea un espacio eterno, digno y protegido para tu ser querido. Reúne a familiares de todo el mundo para encender velas virtuales, compartir anécdotas y generar un código QR único para su lápida o recordatorio impreso.
            </p>

            {/* CTAs Principales */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
              <a
                href="#planes"
                className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#2D2926] text-white text-xs sm:text-sm font-semibold hover:bg-[#433E3A] transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <Tag className="w-4 h-4 text-[#C29837]" />
                <span>Ver Planes y Membresías</span>
                <ArrowRight className="w-4 h-4 text-[#C29837]" />
              </a>

              <Link
                href="/login"
                className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-[#4A4540] border border-[#DFCDB8] text-xs sm:text-sm font-semibold hover:bg-[#F3ECE0] transition-colors shadow-xs cursor-pointer"
              >
                <Lock className="w-4 h-4 text-[#8C847A]" />
                <span>Acceso Familiar con Código</span>
              </Link>
            </div>

            {/* Buscador Rápido de Memorial Familiar Privado */}
            <div className="max-w-md mx-auto bg-white/80 dark:bg-[#171A20]/80 backdrop-blur-sm border border-[#EAE4D8] dark:border-[#282E39] rounded-2xl p-2.5 shadow-sm">
              <form onSubmit={handlePrivateSearch} className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#8C847A] ml-2 shrink-0" />
                <input
                  type="text"
                  placeholder="¿Tienes el enlace o código de un familiar? Ingresa aquí..."
                  value={privateSearchQuery}
                  onChange={(e) => setPrivateSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#2D2926] dark:text-white placeholder:text-[#9A9388] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2D2926] dark:bg-[#C29837] text-white dark:text-[#101216] text-xs font-semibold shrink-0 cursor-pointer"
                >
                  Abrir
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* MÉTRICAS DE CONFIANZA Y RESPETO */}
        <section className="bg-white dark:bg-[#15181E] border-b border-[#EAE4D8] dark:border-[#282E39] py-8 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <p className="font-memorial text-2xl sm:text-3xl font-semibold text-[#2D2926] dark:text-white">+1.400</p>
              <p className="text-xs text-[#7A7167] dark:text-[#9A9388]">Familias acompañadas</p>
            </div>
            <div>
              <p className="font-memorial text-2xl sm:text-3xl font-semibold text-[#2D2926] dark:text-white">99.9%</p>
              <p className="text-xs text-[#7A7167] dark:text-[#9A9388]">Disponibilidad en la nube</p>
            </div>
            <div>
              <p className="font-memorial text-2xl sm:text-3xl font-semibold text-[#2D2926] dark:text-white">100%</p>
              <p className="text-xs text-[#7A7167] dark:text-[#9A9388]">Moderado y protegido</p>
            </div>
            <div>
              <p className="font-memorial text-2xl sm:text-3xl font-semibold text-[#2D2926] dark:text-white">Vitalicio</p>
              <p className="text-xs text-[#7A7167] dark:text-[#9A9388]">Preservación garantizada</p>
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA EL SERVICIO EN 3 PASOS */}
        <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C29837] block mb-2">
              Sencillo, emotivo y digno
            </span>
            <h2 className="font-memorial text-3xl sm:text-4xl text-[#2D2926] dark:text-[#EAE6DF]">
              ¿Cómo Funciona Hobituario?
            </h2>
            <p className="text-xs sm:text-sm text-[#736B63] dark:text-[#9A9388] max-w-lg mx-auto mt-2">
              En menos de 5 minutos tendrás un memorial en línea listo para compartir con tus seres queridos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Paso 1 */}
            <div className="bg-white dark:bg-[#171A20] border border-[#EAE4D8] dark:border-[#282E39] rounded-3xl p-7 shadow-sm relative">
              <span className="w-8 h-8 rounded-full bg-[#FAF3E3] dark:bg-[#282E38] text-[#C29837] font-bold text-xs flex items-center justify-center mb-4">
                1
              </span>
              <h3 className="font-memorial text-lg font-semibold text-[#2D2926] dark:text-white mb-2">
                Elige tu Membresía
              </h3>
              <p className="text-xs text-[#6B635A] dark:text-[#9A9388] leading-relaxed">
                Selecciona entre el Plan Esencial, Homenaje Legado o Infinito. Adquiérelo al instante por WhatsApp o transferencia sin comisiones ocultas.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="bg-white dark:bg-[#171A20] border border-[#EAE4D8] dark:border-[#282E39] rounded-3xl p-7 shadow-sm relative">
              <span className="w-8 h-8 rounded-full bg-[#FAF3E3] dark:bg-[#282E38] text-[#C29837] font-bold text-xs flex items-center justify-center mb-4">
                2
              </span>
              <h3 className="font-memorial text-lg font-semibold text-[#2D2926] dark:text-white mb-2">
                Personaliza con Cariño
              </h3>
              <p className="text-xs text-[#6B635A] dark:text-[#9A9388] leading-relaxed">
                Desde tu Panel Familiar privado, sube sus fotos, escribe su biografía, agrega los horarios de las misas y elige los colores y tipografías que mejor lo representen.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="bg-white dark:bg-[#171A20] border border-[#EAE4D8] dark:border-[#282E39] rounded-3xl p-7 shadow-sm relative">
              <span className="w-8 h-8 rounded-full bg-[#FAF3E3] dark:bg-[#282E38] text-[#C29837] font-bold text-xs flex items-center justify-center mb-4">
                3
              </span>
              <h3 className="font-memorial text-lg font-semibold text-[#2D2926] dark:text-white mb-2">
                Comparte el Legado
              </h3>
              <p className="text-xs text-[#6B635A] dark:text-[#9A9388] leading-relaxed">
                Envía el enlace a familiares o descarga la tarjeta con código QR en PDF para imprimirla en los recordatorios o colocarla en su lápida en el cementerio.
              </p>
            </div>
          </div>
        </section>

        {/* BENEFICIOS EXCLUSIVOS DEL SAAS */}
        <section className="bg-[#FAF7F2] dark:bg-[#15181E] border-y border-[#EAE4D8] dark:border-[#282E39] py-20 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-memorial text-3xl sm:text-4xl text-[#2D2926] dark:text-[#EAE6DF] mb-2">
                Todo lo que Tu Familia Necesita en un Solo Lugar
              </h2>
              <p className="text-xs sm:text-sm text-[#736B63] dark:text-[#9A9388] max-w-lg mx-auto">
                Tecnología diseñada con serenidad y el más profundo respeto.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-[#1A1D24] p-6 rounded-2xl border border-[#EAE4D8] dark:border-[#282E39] shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#FAF3E3] dark:bg-[#262C38] text-[#C29837] flex items-center justify-center mb-3">
                  <Flame className="w-5 h-5 animate-flame" />
                </div>
                <h4 className="font-memorial text-base font-semibold text-[#2D2926] dark:text-white mb-1.5">
                  Velas Virtuales Vivas
                </h4>
                <p className="text-xs text-[#6E665D] dark:text-[#9A9388] leading-relaxed">
                  Amigos de cualquier parte del mundo pueden encender una vela con una animación de llama y enviar flores con palabras de cariño.
                </p>
              </div>

              <div className="bg-white dark:bg-[#1A1D24] p-6 rounded-2xl border border-[#EAE4D8] dark:border-[#282E39] shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#EBF0EB] dark:bg-[#1E2922] text-[#4A634E] dark:text-[#A7D1AC] flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-memorial text-base font-semibold text-[#2D2926] dark:text-white mb-1.5">
                  Moderación Familiar Estricta
                </h4>
                <p className="text-xs text-[#6E665D] dark:text-[#9A9388] leading-relaxed">
                  Filtro automático de palabras ofensivas y panel para que tú apruebes o rechaces cada condolencia antes de que sea pública.
                </p>
              </div>

              <div className="bg-white dark:bg-[#1A1D24] p-6 rounded-2xl border border-[#EAE4D8] dark:border-[#282E39] shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#F0EBE6] dark:bg-[#2B2724] text-[#7A6126] dark:text-[#E5B585] flex items-center justify-center mb-3">
                  <QrCode className="w-5 h-5" />
                </div>
                <h4 className="font-memorial text-base font-semibold text-[#2D2926] dark:text-white mb-1.5">
                  Código QR para Lápidas y PDF
                </h4>
                <p className="text-xs text-[#6E665D] dark:text-[#9A9388] leading-relaxed">
                  Descarga una tarjeta conmemorativa en PDF con el QR nítido para imprimirlo en las estampitas de misa o grabarlo en una placa fúnebre.
                </p>
              </div>

              <div className="bg-white dark:bg-[#1A1D24] p-6 rounded-2xl border border-[#EAE4D8] dark:border-[#282E39] shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#F0F4FA] dark:bg-[#1E2638] text-[#3D5B94] dark:text-[#8EAEF0] flex items-center justify-center mb-3">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="font-memorial text-base font-semibold text-[#2D2926] dark:text-white mb-1.5">
                  Mapas de Ceremonias Gratuitos
                </h4>
                <p className="text-xs text-[#6E665D] dark:text-[#9A9388] leading-relaxed">
                  Mapas interactivos basados en OpenStreetMap para que los asistentes lleguen fácilmente a la iglesia o camposanto.
                </p>
              </div>

              <div className="bg-white dark:bg-[#1A1D24] p-6 rounded-2xl border border-[#EAE4D8] dark:border-[#282E39] shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#FAF0F5] dark:bg-[#2C1E26] text-[#8C3D6E] dark:text-[#E89EC8] flex items-center justify-center mb-3">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h4 className="font-memorial text-base font-semibold text-[#2D2926] dark:text-white mb-1.5">
                  App PWA Descargable
                </h4>
                <p className="text-xs text-[#6E665D] dark:text-[#9A9388] leading-relaxed">
                  Los familiares directos pueden instalar el memorial como una aplicación en su pantalla de inicio y verlo incluso sin conexión.
                </p>
              </div>

              <div className="bg-white dark:bg-[#1A1D24] p-6 rounded-2xl border border-[#EAE4D8] dark:border-[#282E39] shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#FAF3E3] dark:bg-[#282E38] text-[#C29837] flex items-center justify-center mb-3">
                  <Palette className="w-5 h-5" />
                </div>
                <h4 className="font-memorial text-base font-semibold text-[#2D2926] dark:text-white mb-1.5">
                  Diseño y Fuentes Editables
                </h4>
                <p className="text-xs text-[#6E665D] dark:text-[#9A9388] leading-relaxed">
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
            <h2 className="font-memorial text-3xl sm:text-4xl text-[#2D2926] dark:text-[#EAE6DF]">
              Membresías de Preservación Digital
            </h2>
            <p className="text-xs sm:text-sm text-[#736B63] dark:text-[#9A9388] mt-2">
              Sin cuotas sorpresa. Elige la modalidad que prefieras y activa por WhatsApp.
            </p>

            <div className="inline-flex items-center p-1.5 rounded-2xl bg-[#EAE2D5] dark:bg-[#1C2028] border border-[#D8CABE] dark:border-[#2C3342] mt-6">
              <button
                onClick={() => setBillingCycle('one-time')}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${billingCycle === 'one-time'
                    ? 'bg-white dark:bg-[#C29837] text-[#2D2926] dark:text-[#101216] shadow-xs'
                    : 'text-[#6B635A] dark:text-[#9A9388]'
                  }`}
              >
                Pago Único (5 Años)
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${billingCycle === 'annual'
                    ? 'bg-white dark:bg-[#C29837] text-[#2D2926] dark:text-[#101216] shadow-xs'
                    : 'text-[#6B635A] dark:text-[#9A9388]'
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
                  className={`bg-white dark:bg-[#171A20] rounded-3xl p-7 flex flex-col justify-between border ${plan.isPopular
                      ? 'border-[#C29837] shadow-xl ring-2 ring-[#C29837]/20 scale-102'
                      : 'border-[#EAE4D8] dark:border-[#282E39] shadow-sm'
                    }`}
                >
                  <div>
                    {plan.badge && (
                      <span className="inline-block px-3 py-1 rounded-full bg-[#2D2926] dark:bg-[#C29837] text-white dark:text-[#101216] text-[10px] font-semibold uppercase mb-3">
                        {plan.badge}
                      </span>
                    )}
                    <h3 className="font-memorial text-xl text-[#2D2926] dark:text-[#EAE6DF] font-semibold mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-[#7A7167] dark:text-[#9A9388] font-script mb-6 min-h-[32px]">
                      {plan.tagline}
                    </p>

                    <div className="mb-6 pb-6 border-b border-[#F2ECE1] dark:border-[#282E39]">
                      <span className="font-memorial text-3xl sm:text-4xl font-normal text-[#2D2926] dark:text-white">
                        {priceDisplay}
                      </span>
                    </div>

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

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-semibold transition-all shadow-sm ${plan.isPopular
                        ? 'bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-md'
                        : 'bg-[#2D2926] dark:bg-[#C29837] text-white dark:text-[#101216] hover:bg-[#433E3A]'
                      }`}
                  >
                    <MessageCircle className="w-4 h-4 fill-white dark:fill-[#101216]" />
                    <span>Contratar por WhatsApp</span>
                  </a>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* FOOTER SOLEMNE */}
      <footer className="bg-[#2D2926] text-[#FBF9F5] py-12 px-4 sm:px-6 border-t border-[#433E3A]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#A89F94]">
          <div className="flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-[#E6B84A] animate-flame" />
            <span className="font-memorial text-base text-[#FBF9F5]">Hobituario</span>
            <span>— Plataforma de Preservación y Paz Eterna</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/planes" className="hover:text-white transition-colors">Membresías</Link>
            <span>•</span>
            <Link href="/login" className="hover:text-white transition-colors">Acceso Familiar</Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-white transition-colors">Super Admin</Link>
          </div>
        </div>
      </footer>

      <InstallPwaBanner />
    </div>
  );
}
