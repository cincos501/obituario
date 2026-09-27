'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '../../components/common/Navbar';
import { ImageUploader } from '../../components/common/ImageUploader';
import { BanecoCheckoutModal } from '../../components/payment/BanecoCheckoutModal';
import { memorialService } from '../../services/memorialService';
import { authService } from '../../services/authService';
import { FuneralService, SubscriptionPlanId } from '../../types/memorial';
import { SUBSCRIPTION_PLANS } from '../../data/plans';
import { 
  Flame, 
  Heart, 
  Calendar, 
  MapPin, 
  Church, 
  CheckCircle, 
  ArrowRight, 
  ShieldCheck, 
  Tag, 
  Lock, 
  Copy,
  Building2,
  QrCode,
  CreditCard
} from 'lucide-react';

function CreateMemorialForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan') as SubscriptionPlanId | null;
  const txParam = searchParams.get('tx');

  // Estados del formulario
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [deathPlace, setDeathPlace] = useState('');
  const [epitaph, setEpitaph] = useState('');
  const [biography, setBiography] = useState('');
  const [mainPhotoUrl, setMainPhotoUrl] = useState('');
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('');

  // Datos SaaS & Familia
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>(planParam || 'legado');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [moderationRequired, setModerationRequired] = useState(true);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; pass: string; slug: string; name: string } | null>(null);

  // Pago Baneco
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [banecoTransactionNumber, setBanecoTransactionNumber] = useState<string | null>(txParam || null);

  // Servicios
  const [serviceTitle, setServiceTitle] = useState('Misa y Despedida');
  const [serviceLocation, setServiceLocation] = useState('');
  const [serviceAddress, setServiceAddress] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [serviceTime, setServiceTime] = useState('10:00');
  const [serviceNotes, setServiceNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (planParam && (planParam === 'esencial' || planParam === 'legado' || planParam === 'infinito')) {
      setSelectedPlanId(planParam);
    }
    if (txParam) {
      setBanecoTransactionNumber(txParam);
    }
  }, [planParam, txParam]);

  const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[1];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !birthDate || !deathDate || !epitaph || !biography) {
      alert('Por favor completa todos los campos requeridos para honrar su memoria.');
      return;
    }

    setIsSubmitting(true);

    try {
      const baseSlug = fullName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      const year = new Date(deathDate).getFullYear() || new Date().getFullYear();
      const slug = `${baseSlug}-${year}-${Math.floor(100 + Math.random() * 900)}`;

      // Generar PIN de 4 dígitos unificado tanto para Supabase (access_pin) como para credenciales familiares
      const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();

      const photoToUse =
        mainPhotoUrl ||
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800';

      const initialServices: FuneralService[] = serviceLocation
        ? [
            {
              id: 'srv-' + Date.now(),
              obituaryId: '',
              serviceType: 'misa_cuerpo_presente',
              title: serviceTitle,
              locationName: serviceLocation,
              address: serviceAddress,
              date: serviceDate || deathDate,
              time: serviceTime,
              notes: serviceNotes,
            },
          ]
        : [];

      const created = await memorialService.createObituary({
        slug,
        fullName,
        nickname: nickname || undefined,
        birthDate,
        deathDate,
        birthPlace: birthPlace || undefined,
        deathPlace: deathPlace || undefined,
        epitaph,
        biography,
        mainPhotoUrl: photoToUse,
        coverPhotoUrl: coverPhotoUrl || undefined,
        isPublic: true,
        planId: selectedPlanId,
        moderationRequired,
        ownerName: ownerName || 'Familiar Responsable',
        ownerEmail: ownerEmail || `familia.${slug}@hobituario.com`,
        accessPin: generatedPin,
        services: initialServices,
      });

      // Crear credenciales inmediatas para la familia con el mismo PIN
      const { user } = authService.registerFamilyUser({
        email: ownerEmail || `familia.${created.slug}@hobituario.com`,
        name: ownerName || 'Familiar Responsable',
        memorialSlug: created.slug,
        password: generatedPin,
      });

      // Auto-iniciar sesión como el familiar titular
      await authService.login(user.email, generatedPin);

      setCreatedCredentials({
        email: user.email,
        pass: generatedPin,
        slug: created.slug,
        name: created.fullName,
      });
    } catch (err) {
      console.error(err);
      alert('Hubo un inconveniente al crear el memorial.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-3 sm:px-6 py-6 sm:py-10">
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center bg-[#F3ECE0] border border-[#E2D5C3]">
          <Flame className="w-6 h-6 text-[#C29837] animate-flame" />
        </div>
        <h1 className="font-memorial text-2xl sm:text-4xl text-[#2D2926]">
          Crear un Memorial Eterno
        </h1>
        <p className="text-xs sm:text-sm text-[#7A7167] max-w-md mx-auto mt-2 px-2">
          Un espacio digno y solemne para preservar su historia, recibir condolencias y coordinar las ceremonias de despedida.
        </p>

        {banecoTransactionNumber && (
          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF0EB] border border-[#D0E0D0] text-[#4A634E] text-xs font-semibold max-w-full truncate">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Pago Confirmado Baneco: {banecoTransactionNumber}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 bg-white border border-[#EAE4D8] rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 shadow-sm">
        {/* Bloque 0: Selección de Membresía SaaS y Pasarela Baneco */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F2ECE1] mb-4">
            <h2 className="font-memorial text-lg sm:text-xl text-[#2D2926] flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#C29837] shrink-0" />
              <span>Selecciona la Membresía</span>
            </h2>

            <button
              type="button"
              onClick={() => setIsCheckoutOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FAF3E3] border border-[#E8D7B0] text-[#8C6B32] text-xs font-semibold hover:bg-[#F2ECE1] transition-colors cursor-pointer w-full sm:w-auto"
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>Pagar con Baneco (QR Simple)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                  selectedPlanId === plan.id
                    ? 'border-[#C29837] bg-[#FFFBF2] ring-2 ring-[#C29837]/30'
                    : 'border-[#EAE4D8] bg-[#FAF8F5] hover:bg-white'
                }`}
              >
                <p className="font-memorial text-sm font-semibold text-[#2D2926]">{plan.name}</p>
                <p className="text-xs text-[#C29837] font-semibold mt-1">{plan.priceLocal}</p>
                <p className="text-[11px] text-[#7A7167] mt-1 leading-snug">{plan.tagline}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bloque 1: Datos Personales */}
        <div>
          <h2 className="font-memorial text-xl text-[#2D2926] mb-4 pb-2 border-b border-[#F2ECE1] flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#C29837]" />
            <span>Datos del Ser Amado</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#544D46] mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Dr. Carlos Alberto Mendoza Vega"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-sm text-[#2D2926] focus:outline-none focus:ring-2 focus:ring-[#C29837]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#544D46] mb-1">
                Nombre de Cariño / Apodo
              </label>
              <input
                type="text"
                placeholder="Ej. Abuelito Carlitos"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-sm text-[#2D2926] focus:outline-none focus:ring-2 focus:ring-[#C29837]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#544D46] mb-1">
                Lugar de Nacimiento
              </label>
              <input
                type="text"
                placeholder="Ej. Cochabamba, Bolivia"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-sm text-[#2D2926] focus:outline-none focus:ring-2 focus:ring-[#C29837]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#544D46] mb-1">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-sm text-[#2D2926] focus:outline-none focus:ring-2 focus:ring-[#C29837]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#544D46] mb-1">
                Fecha de Partida *
              </label>
              <input
                type="date"
                required
                value={deathDate}
                onChange={(e) => setDeathDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-sm text-[#2D2926] focus:outline-none focus:ring-2 focus:ring-[#C29837]/30"
              />
            </div>
          </div>
        </div>

        {/* Bloque 2: Titular Familiar y Resguardo */}
        <div>
          <h2 className="font-memorial text-xl text-[#2D2926] mb-4 pb-2 border-b border-[#F2ECE1] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#758774]" />
            <span>Titular Familiar y Moderación de Respeto</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-[#544D46] mb-1">
                Nombre del Familiar Responsable
              </label>
              <input
                type="text"
                placeholder="Ej. Mariana de Mendoza"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-sm text-[#2D2926]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#544D46] mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="Ej. mariana@hobituario.com"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-sm text-[#2D2926]"
              />
            </div>
          </div>

          <label className="flex items-start gap-3 p-3.5 bg-[#FAF7F2] border border-[#DFCDB8] rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={moderationRequired}
              onChange={(e) => setModerationRequired(e.target.checked)}
              className="mt-0.5 rounded text-[#C29837] focus:ring-[#C29837]"
            />
            <div className="text-xs text-[#524B44]">
              <p className="font-semibold text-[#2D2926]">
                Activar Moderación Familiar de Condolencias (Recomendado)
              </p>
              <p className="text-[11px] text-[#7A7167] mt-0.5">
                Los mensajes y velas enviados por visitantes no serán públicos hasta que tú o la familia los aprueben, protegiendo la serenidad del espacio.
              </p>
            </div>
          </label>
        </div>

        {/* Bloque 3: Retrato y Portada con Supabase Storage Uploader */}
        <div>
          <h2 className="font-memorial text-xl text-[#2D2926] mb-4 pb-2 border-b border-[#F2ECE1] flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#C29837]" />
            <span>Fotografía de Retrato y Portada</span>
          </h2>

          <div className="space-y-6">
            <ImageUploader
              label="Retrato Principal del Ser Querido *"
              initialUrl={mainPhotoUrl}
              onImageSelected={(url) => setMainPhotoUrl(url)}
              aspectRatio="round"
              cropShape="round"
              folder="portraits"
              helperText="Sube su foto más serena. Podrás recortar el rostro perfectamente antes de guardar."
            />

            <ImageUploader
              label="Fotografía de Portada o Paisaje de Paz (Opcional)"
              initialUrl={coverPhotoUrl}
              onImageSelected={(url) => setCoverPhotoUrl(url)}
              aspectRatio="wide"
              cropShape="wide"
              folder="covers"
              helperText="Imagen panorámica de un lugar especial, atardecer o motivo floral que honre su memoria."
            />
          </div>
        </div>

        {/* Bloque 4: Epitafio y Biografía */}
        <div>
          <h2 className="font-memorial text-xl text-[#2D2926] mb-4 pb-2 border-b border-[#F2ECE1]">
            Palabras y Memoria
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#544D46] mb-1">
                Epitafio o Frase Conmovedora *
              </label>
              <input
                type="text"
                required
                placeholder="«Tu luz y tu ternura guiarán siempre nuestros pasos...»"
                value={epitaph}
                onChange={(e) => setEpitaph(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-sm text-[#2D2926] font-script focus:outline-none focus:ring-2 focus:ring-[#C29837]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#544D46] mb-1">
                Historia de Vida / Biografía *
              </label>
              <textarea
                required
                rows={5}
                placeholder="Escribe aquí los momentos más significativos de su vida, su vocación, sus valores y el amor que brindó a su familia..."
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-sm text-[#2D2926] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#C29837]/30"
              />
            </div>
          </div>
        </div>

        {/* Bloque 5: Ceremonias Iniciales */}
        <div>
          <h2 className="font-memorial text-xl text-[#2D2926] mb-4 pb-2 border-b border-[#F2ECE1] flex items-center gap-2">
            <Church className="w-4 h-4 text-[#C29837]" />
            <span>Ceremonia Inicial o Velatorio (Opcional)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#544D46] mb-1">
                Título del Evento
              </label>
              <input
                type="text"
                placeholder="Ej. Capilla Ardiente y Misa"
                value={serviceTitle}
                onChange={(e) => setServiceTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-sm text-[#2D2926]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#544D46] mb-1">
                Lugar / Templo / Capilla
              </label>
              <input
                type="text"
                placeholder="Ej. Parroquia San Roque"
                value={serviceLocation}
                onChange={(e) => setServiceLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-sm text-[#2D2926]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#544D46] mb-1">
                Dirección Completa
              </label>
              <input
                type="text"
                placeholder="Ej. Plaza Campero esq. Corrado, Zona San Roque, Tarija"
                value={serviceAddress}
                onChange={(e) => setServiceAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-sm text-[#2D2926]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#544D46] mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-sm text-[#2D2926]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#544D46] mb-1">
                Hora
              </label>
              <input
                type="text"
                placeholder="10:00 AM - 18:00 PM"
                value={serviceTime}
                onChange={(e) => setServiceTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-sm text-[#2D2926]"
              />
            </div>
          </div>
        </div>

        {/* Botón de Publicación Responsivo */}
        <div className="pt-6 border-t border-[#F2ECE1] flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-xs text-[#7A7167] hover:text-[#2D2926] py-2 px-4 cursor-pointer"
          >
            ← Volver
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#2D2926] text-[#FBF9F5] hover:bg-[#433E3A] text-xs sm:text-sm font-medium transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4 text-[#E6B84A] shrink-0" />
            <span>{isSubmitting ? 'Creando Memorial...' : 'Publicar Memorial'}</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </form>

      {/* Modal de Credenciales Inmediatas */}
      {createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#FAF7F2] border border-[#DFCDB8] rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-8 shadow-2xl space-y-4 sm:space-y-5 text-center max-h-[92vh] overflow-y-auto">
            <div className="w-14 h-14 rounded-full bg-[#EBF0EB] text-[#4A634E] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-memorial text-2xl text-[#2D2926]">
                ¡Memorial Creado con Éxito!
              </h3>
              <p className="text-xs text-[#7A7167] mt-1">
                Tu espacio en memoria de <strong>{createdCredentials.name}</strong> está listo.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#D8CABE] text-left space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#F2ECE1]">
                <span className="text-xs font-semibold text-[#2D2926] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#C29837]" />
                  <span>Tus Credenciales de Gestión Privada</span>
                </span>
                <span className="text-[10px] font-semibold text-[#758774] bg-[#EBF0EB] px-2 py-0.5 rounded-full">
                  Activas Ahora
                </span>
              </div>
              <div className="text-xs text-[#524B44] space-y-1">
                <p><strong>Usuario / Correo:</strong> <code className="bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#EDE5DA]">{createdCredentials.email}</code></p>
                <p><strong>Contraseña / PIN:</strong> <code className="bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#EDE5DA] font-bold text-[#C29837]">{createdCredentials.pass}</code></p>
              </div>
              <p className="text-[10px] text-[#8C847A] pt-1">
                * No necesitas verificar correo. Guarda estas credenciales para acceder desde cualquier dispositivo usando el botón <strong>&ldquo;Ingresar&rdquo;</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => router.push(`/memorial/${createdCredentials.slug}/admin`)}
                className="flex-1 py-3 rounded-full bg-[#2D2926] text-white text-xs font-semibold hover:bg-[#433E3A] transition-colors shadow-sm cursor-pointer"
              >
                Ir a mi Panel Familiar
              </button>
              <button
                type="button"
                onClick={() => router.push(`/memorial/${createdCredentials.slug}`)}
                className="flex-1 py-3 rounded-full border border-[#D8CABE] bg-white text-[#2D2926] text-xs font-semibold hover:bg-[#F2ECE1] transition-colors cursor-pointer"
              >
                Ver Memorial Público
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pago Baneco */}
      <BanecoCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        plan={currentPlan}
        initialPayerName={ownerName}
        initialPayerEmail={ownerEmail}
        onPaymentSuccess={(tx) => {
          setBanecoTransactionNumber(tx.transactionNumber);
        }}
      />
    </main>
  );
}

export default function CreateMemorialPage() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center text-xs">Cargando creador...</div>}>
        <CreateMemorialForm />
      </Suspense>
    </div>
  );
}
