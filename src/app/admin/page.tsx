'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../components/common/Navbar';
import { memorialService } from '../../services/memorialService';
import { authService } from '../../services/authService';
import { Obituary, SubscriptionPlanId } from '../../types/memorial';
import { SUBSCRIPTION_PLANS } from '../../data/plans';
import { 
  Users, 
  Check, 
  X, 
  ExternalLink, 
  DollarSign,
  Sliders,
  PlusCircle,
  Copy,
  CheckCheck,
  MessageCircle,
  Sparkles,
  Layers,
  KeyRound,
  Send
} from 'lucide-react';

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const [memorials, setMemorials] = useState<Obituary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Modal para personalizar límites por cliente
  const [editingMemorial, setEditingMemorial] = useState<Obituary | null>(null);
  const [customPhotoLimit, setCustomPhotoLimit] = useState<number>(35);
  const [customMilestoneLimit, setCustomMilestoneLimit] = useState<number>(15);
  const [customMaxServices, setCustomMaxServices] = useState<number>(5);
  const [customAllowTimelinePhotos, setCustomAllowTimelinePhotos] = useState<boolean>(true);
  const [customAllowServicePhotos, setCustomAllowServicePhotos] = useState<boolean>(true);
  const [customAllowTributePhotos, setCustomAllowTributePhotos] = useState<boolean>(true);
  const [customAllowVideo, setCustomAllowVideo] = useState<boolean>(false);
  const [customStorageMB, setCustomStorageMB] = useState<number>(500);

  // Modal para Registrar Cliente Manual y Generar Accesos
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regClientName, setRegClientName] = useState('');
  const [regClientEmail, setRegClientEmail] = useState('');
  const [regClientPhone, setRegClientPhone] = useState('');
  const [regPlanId, setRegPlanId] = useState<SubscriptionPlanId>('legado');
  const [regSlug, setRegSlug] = useState('');
  const [regPin, setRegPin] = useState('1234');
  const [createdCredentials, setCreatedCredentials] = useState<{
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    planName: string;
    slug: string;
    pin: string;
    familyUrl: string;
    loginUrl: string;
  } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const data = await memorialService.getAll();
    setMemorials(data);
    setIsLoading(false);
  };

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== 'super_admin') {
      router.push('/login?redirect=/admin');
      return;
    }
    loadData();
  }, [router]);

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const getOrigin = () => {
    return typeof window !== 'undefined' ? window.location.origin : 'https://hobituario.com';
  };

  const handleCopyFamilyLink = (slug: string) => {
    const familyUrl = `${getOrigin()}/memorial/${slug}/admin`;
    navigator.clipboard.writeText(familyUrl);
    setCopiedSlug(slug);
    showNotice('Enlace de gestión familiar copiado al portapapeles.');
    setTimeout(() => setCopiedSlug(null), 3000);
  };

  const handleCopyWhatsAppMessage = (memorial: Obituary) => {
    const origin = getOrigin();
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === memorial.planId);
    const message = `🕊️ *Hobituario - Sus credenciales de acceso*
Estimado/a ${memorial.ownerName || 'Familiar'},

Su memorial digital con el *${plan?.name || 'Plan de Preservación'}* ha sido activado con éxito.

Puede acceder para ingresar la información de su ser querido (biografía, fechas, fotografías y ceremonias) desde su panel familiar:
🔗 ${origin}/memorial/${memorial.slug}/admin

*Sus credenciales privadas:*
📧 Correo: ${memorial.ownerEmail || 'Su correo registrado'}
🔑 PIN de acceso: ${memorial.accessPin || '1234'}

Cualquier consulta o asistencia que necesite, estamos a su entera disposición.`;

    navigator.clipboard.writeText(message);
    setCopiedSlug(memorial.slug);
    showNotice('¡Mensaje para WhatsApp copiado! Listo para pegar en el chat del cliente.');
    setTimeout(() => setCopiedSlug(null), 3500);
  };

  const handleChangePlan = async (obituaryId: string, newPlanId: SubscriptionPlanId) => {
    await memorialService.updatePlan(obituaryId, newPlanId);
    showNotice(`Plan de cliente actualizado a ${newPlanId.toUpperCase()}.`);
    loadData();
  };

  const openCustomLimitsModal = (m: Obituary) => {
    setEditingMemorial(m);
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === m.planId) || SUBSCRIPTION_PLANS[0];
    setCustomPhotoLimit(plan.limits.maxPhotos);
    setCustomMilestoneLimit(plan.limits.maxTimelineMilestones);
    setCustomMaxServices(plan.limits.maxServices);
    setCustomAllowTimelinePhotos(plan.limits.allowsTimelinePhotos);
    setCustomAllowServicePhotos(plan.limits.allowsServicePhotos);
    setCustomAllowTributePhotos(plan.limits.allowsTributePhotos);
    setCustomAllowVideo(plan.limits.allowsVideo);
    setCustomStorageMB(plan.limits.storageLimitMB);
  };

  const handleSaveCustomLimits = () => {
    if (!editingMemorial) return;
    showNotice(`Límites personalizados aplicados para ${editingMemorial.fullName}.`);
    setEditingMemorial(null);
  };

  // Autogenerar slug cuando cambia el nombre del cliente
  const handleClientNameChange = (name: string) => {
    setRegClientName(name);
    if (!regSlug || regSlug.startsWith('familia-') || regSlug.includes('-')) {
      const clean = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setRegSlug(clean ? `familia-${clean}` : '');
    }
  };

  const handleRegisterClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regClientName.trim() || !regClientEmail.trim()) {
      alert('Por favor ingrese el nombre y correo del cliente.');
      return;
    }

    const finalSlug = regSlug.trim() || `cliente-${Date.now().toString().slice(-5)}`;
    const finalPin = regPin.trim() || '1234';
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === regPlanId) || SUBSCRIPTION_PLANS[1];

    try {
      await memorialService.createObituary({
        slug: finalSlug,
        fullName: `Espacio de la Familia ${regClientName}`,
        epitaph: 'En memoria perenne de nuestro ser amado.',
        biography: 'La familia redactará aquí la historia y recuerdos entrañables de vida.',
        mainPhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
        coverPhotoUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1600&q=80',
        birthDate: '1950-01-01',
        deathDate: '2025-01-01',
        isPublic: true,
        accessPin: finalPin,
        services: [],
        planId: regPlanId,
        moderationRequired: true,
        ownerEmail: regClientEmail.trim(),
        ownerName: regClientName.trim(),
      });

      const origin = getOrigin();
      setCreatedCredentials({
        clientName: regClientName.trim(),
        clientEmail: regClientEmail.trim(),
        clientPhone: regClientPhone.trim(),
        planName: plan.name,
        slug: finalSlug,
        pin: finalPin,
        familyUrl: `${origin}/memorial/${finalSlug}/admin`,
        loginUrl: `${origin}/login?code=${finalSlug}`,
      });

      showNotice(`Cliente ${regClientName} registrado con éxito.`);
      loadData();
      setShowRegisterModal(false);
    } catch (err) {
      console.error(err);
      alert('Error al registrar cliente.');
    }
  };

  const totalMemorials = memorials.length;
  const revenueUSD = memorials.reduce((acc, m) => {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === m.planId);
    return acc + (plan?.priceUSD || 19);
  }, 0);
  const premiumCount = memorials.filter((m) => m.planId !== 'esencial').length;

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#2D2926] flex flex-col selection:bg-[#E8DED1]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10">
        {notification && (
          <div className="fixed top-20 right-6 z-50 bg-[#8C6B32] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>{notification}</span>
          </div>
        )}

        {/* Encabezado del Administrador de Plataforma */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#EAE4D8]">
          <div>
            <h1 className="font-memorial text-2xl sm:text-3xl text-[#2D2926] font-normal">
              Gestión Maestra de Clientes y Planes
            </h1>
            <p className="text-xs text-[#7A7167] mt-1">
              Registra nuevos compradores, entrega accesos de administración por WhatsApp y gestiona membresías activas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setRegClientName('');
                setRegClientEmail('');
                setRegClientPhone('');
                setRegSlug('');
                setRegPin(Math.floor(1000 + Math.random() * 9000).toString());
                setShowRegisterModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#8C6B32] hover:bg-[#785924] text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Registrar Cliente y Accesos</span>
            </button>
          </div>
        </div>

        {/* Métricas Comerciales de Plataforma */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-[#EAE4D8] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-[#8C847A] mb-2">
              <span className="text-xs font-medium">Memoriales Totales</span>
              <Users className="w-4 h-4 text-[#C29837]" />
            </div>
            <p className="font-memorial text-2xl font-semibold">{totalMemorials}</p>
            <span className="text-[11px] text-[#758774] font-medium">Espacios habilitados</span>
          </div>

          <div className="bg-white border border-[#EAE4D8] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-[#8C847A] mb-2">
              <span className="text-xs font-medium">Facturación Acumulada</span>
              <DollarSign className="w-4 h-4 text-[#758774]" />
            </div>
            <p className="font-memorial text-2xl font-semibold">${revenueUSD} USD</p>
            <span className="text-[11px] text-[#7A7167]">~{(revenueUSD * 6.96).toFixed(0)} Bs. cobrados</span>
          </div>

          <div className="bg-white border border-[#EAE4D8] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-[#8C847A] mb-2">
              <span className="text-xs font-medium">Planes Premium Activos</span>
              <Layers className="w-4 h-4 text-[#C29837]" />
            </div>
            <p className="font-memorial text-2xl font-semibold">{premiumCount}</p>
            <span className="text-[11px] text-[#7A7167]">Legado e Infinito</span>
          </div>

          <div className="bg-white border border-[#EAE4D8] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-[#8C847A] mb-2">
              <span className="text-xs font-medium">Clientes Registrados</span>
              <Sparkles className="w-4 h-4 text-[#758774]" />
            </div>
            <p className="font-memorial text-2xl font-semibold">{memorials.length}</p>
            <span className="text-[11px] text-[#758774] font-medium">100% al día</span>
          </div>
        </div>

        {/* Modal / Notificación con credenciales generadas para WhatsApp */}
        {createdCredentials && (
          <div className="mb-8 p-5 bg-[#FAF3E3] border-2 border-[#C29837] rounded-3xl shadow-sm animate-in fade-in space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#8C6415]">
                <KeyRound className="w-4 h-4 text-[#C29837]" />
                <span>Credenciales de Acceso Generadas para {createdCredentials.clientName}</span>
              </div>
              <button
                onClick={() => setCreatedCredentials(null)}
                className="text-[#8C847A] hover:text-[#2D2926] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#EAE4D8] text-xs space-y-2.5 overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <p><span className="text-[#8C847A]">Plan:</span> <b className="text-[#2D2926]">{createdCredentials.planName}</b></p>
                <p><span className="text-[#8C847A]">Correo:</span> <b className="text-[#2D2926]">{createdCredentials.clientEmail}</b></p>
                <p><span className="text-[#8C847A]">PIN de Acceso:</span> <b className="font-mono text-sm text-[#C29837]">{createdCredentials.pin}</b></p>
              </div>

              <div className="pt-2 border-t border-[#F2ECE1]">
                <span className="text-[11px] text-[#8C847A] block mb-1">Enlace del Panel Familiar:</span>
                <div className="flex items-center gap-1.5 p-2 bg-[#FAF7F2] rounded-xl border border-[#EDE5DA] overflow-hidden">
                  <span className="font-mono text-[11px] text-[#544D46] break-all flex-1 select-all">{createdCredentials.familyUrl}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentials.familyUrl);
                      showNotice('Enlace del panel copiado.');
                    }}
                    className="p-1.5 rounded-lg hover:bg-[#EAE4D8] text-[#8C847A] hover:text-[#2D2926] shrink-0 cursor-pointer"
                    title="Copiar enlace"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => {
                  const msg = `🕊️ *Hobituario - Sus credenciales de acceso*
Estimado/a ${createdCredentials.clientName},

Su memorial digital con el *${createdCredentials.planName}* ha sido activado con éxito.

Puede ingresar para completar los datos de su ser querido en su panel privado:
🔗 ${createdCredentials.familyUrl}

*Sus credenciales:*
📧 Correo: ${createdCredentials.clientEmail}
🔑 PIN de acceso: ${createdCredentials.pin}

Quedamos a su disposición.`;
                  navigator.clipboard.writeText(msg);
                  showNotice('¡Texto para WhatsApp copiado! Pégalo en el chat con el cliente.');
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20ba59] cursor-pointer shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Copiar Mensaje para WhatsApp</span>
              </button>

              <Link
                href={createdCredentials.familyUrl}
                target="_blank"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#8C6B32] hover:bg-[#785924] text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Panel del Cliente</span>
              </Link>
            </div>
          </div>
        )}

        {/* TABLA PRINCIPAL DE CLIENTES Y GESTIÓN DE CUOTAS */}
        <div className="bg-white border border-[#EAE4D8] rounded-3xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-[#F2ECE1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-memorial text-lg text-[#2D2926]">
                Clientes y Memoriales Activos ({memorials.length})
              </h3>
              <p className="text-xs text-[#7A7167]">
                Envía credenciales de acceso por WhatsApp o ajusta planes y cuotas para cada familia.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#524B44]">
              <thead className="bg-[#FAF7F2] text-[#80766B] uppercase font-semibold text-[10px] tracking-wider border-b border-[#F2ECE1]">
                <tr>
                  <th className="py-3.5 px-4">Memorial</th>
                  <th className="py-3.5 px-4">Cliente / Titular</th>
                  <th className="py-3.5 px-4">Plan de Preservación</th>
                  <th className="py-3.5 px-4">Cuotas Personalizadas</th>
                  <th className="py-3.5 px-4 text-right">Accesos y WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE1]">
                {memorials.map((memorial) => (
                  <tr key={memorial.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-[#D8CABE] bg-[#F2ECE1] shrink-0">
                          <img src={memorial.mainPhotoUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#2D2926] text-xs sm:text-sm">
                            {memorial.fullName}
                          </p>
                          <Link
                            href={`/memorial/${memorial.slug}`}
                            target="_blank"
                            className="text-[11px] text-[#C29837] hover:underline inline-flex items-center gap-1"
                          >
                            <span>Ver público</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-[#2D2926]">{memorial.ownerName || 'Familiar Registrado'}</p>
                      <p className="text-[11px] text-[#8C847A]">{memorial.ownerEmail || 'Sin correo registrado'}</p>
                      <p className="text-[10px] text-[#A67C24] font-mono mt-0.5">PIN: {memorial.accessPin || '1234'}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={memorial.planId}
                        onChange={(e) => handleChangePlan(memorial.id, e.target.value as SubscriptionPlanId)}
                        className="px-2.5 py-1.5 rounded-lg border border-[#D8CABE] bg-white text-xs font-semibold text-[#2D2926] focus:outline-none"
                      >
                        <option value="esencial">Plan Esencial ($19 USD / 135 Bs)</option>
                        <option value="legado">Plan Homenaje Legado ($49 USD / 340 Bs)</option>
                        <option value="infinito">Plan Legado Infinito ($99 USD / 690 Bs)</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => openCustomLimitsModal(memorial)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#D8CABE] bg-white text-xs font-medium hover:bg-[#F2ECE1] cursor-pointer"
                      >
                        <Sliders className="w-3 h-3 text-[#C29837]" />
                        <span>Ajustar Cuotas</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCopyWhatsAppMessage(memorial)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF3E3] text-[#8C6415] border border-[#E8D7B0] hover:bg-[#F5E8C8] cursor-pointer transition-colors"
                          title="Copia el mensaje completo con credenciales para enviarlo por WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                          <span>Copiar WhatsApp</span>
                        </button>

                        <button
                          onClick={() => handleCopyFamilyLink(memorial.slug)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            copiedSlug === memorial.slug
                              ? 'bg-[#EBF0EB] text-[#4A634E] border border-[#CDE0CE]'
                              : 'bg-[#8C6B32] hover:bg-[#785924] text-white'
                          }`}
                          title="Copia el enlace directo de administración familiar"
                        >
                          {copiedSlug === memorial.slug ? (
                            <>
                              <CheckCheck className="w-3.5 h-3.5" />
                              <span>Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Enlace</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL: REGISTRAR NUEVO CLIENTE MANUALMENTE */}
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white border-2 border-[#C29837] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1]">
                <div>
                  <h3 className="font-memorial text-xl text-[#2D2926]">
                    Registrar Nuevo Cliente
                  </h3>
                  <p className="text-[11px] text-[#7A7167]">
                    Genera el usuario para la familia. Ellos llenarán la biografía, fechas y recuerdos desde su panel.
                  </p>
                </div>
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="p-1 text-[#8C847A] hover:text-[#2D2926] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRegisterClient} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-[#4A4540]">
                    Plan de Preservación Contratado
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {SUBSCRIPTION_PLANS.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setRegPlanId(plan.id)}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          regPlanId === plan.id
                            ? 'border-[#C29837] bg-[#FAF3E3] text-[#2D2926] font-semibold'
                            : 'border-[#EAE4D8] bg-white text-[#6E665D]'
                        }`}
                      >
                        <p className="text-xs truncate">{plan.name.replace('Plan ', '')}</p>
                        <p className="text-[11px] text-[#C29837] font-bold">{plan.priceLocal}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[#4A4540]">
                      Nombre Completo del Cliente / Titular *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. María Elena Mendoza"
                      value={regClientName}
                      onChange={(e) => handleClientNameChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#4A4540]">
                      Correo Electrónico del Cliente *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="cliente@ejemplo.com"
                      value={regClientEmail}
                      onChange={(e) => setRegClientEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[#4A4540]">
                      Teléfono / WhatsApp (Opcional)
                    </label>
                    <input
                      type="tel"
                      placeholder="Ej. +591 70000000"
                      value={regClientPhone}
                      onChange={(e) => setRegClientPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#4A4540]">
                      PIN o Contraseña Temporal
                    </label>
                    <input
                      type="text"
                      required
                      value={regPin}
                      onChange={(e) => setRegPin(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-xs font-mono font-bold text-[#C29837]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#4A4540]">
                    Identificador de Memorial (Slug web)
                  </label>
                  <div className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-xs">
                    <span className="text-[#8C847A]">/memorial/</span>
                    <input
                      type="text"
                      required
                      value={regSlug}
                      onChange={(e) => setRegSlug(e.target.value)}
                      className="w-full bg-transparent font-mono font-semibold focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-[#8C847A] mt-1">
                    La familia accederá a su panel privado en <code>/memorial/{regSlug || '...'}/admin</code>
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F2ECE1]">
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="px-4 py-2 rounded-full text-xs text-[#7A7167] hover:bg-[#F2ECE1] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-6 py-2 rounded-full bg-[#8C6B32] hover:bg-[#785924] text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Crear Cliente y Generar Accesos</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: PERSONALIZACIÓN DE CUOTAS DE CLIENTE */}
        {editingMemorial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white border-2 border-[#C29837] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1]">
                <div>
                  <h3 className="font-memorial text-lg text-[#2D2926]">
                    Personalizar Cuota de Cliente
                  </h3>
                  <p className="text-[11px] text-[#7A7167]">
                    {editingMemorial.fullName}
                  </p>
                </div>
                <button
                  onClick={() => setEditingMemorial(null)}
                  className="p-1 text-[#8C847A] hover:text-[#2D2926] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">
                    Límite Máximo de Fotografías
                  </label>
                  <input
                    type="number"
                    value={customPhotoLimit}
                    onChange={(e) => setCustomPhotoLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-xs font-semibold"
                  />
                  <p className="text-[10px] text-[#8C847A] mt-0.5">
                    Ej: 5 (Esencial), 35 (Legado), 999 (Ilimitado).
                  </p>
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    Límite de Hitos en Línea de Tiempo
                  </label>
                  <input
                    type="number"
                    value={customMilestoneLimit}
                    onChange={(e) => setCustomMilestoneLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-xs font-semibold"
                  />
                  <p className="text-[10px] text-[#8C847A] mt-0.5">
                    Ej: 10 (Esencial), 15 (Legado), 25 (Infinito).
                  </p>
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    Límite Máximo de Ceremonias
                  </label>
                  <input
                    type="number"
                    value={customMaxServices}
                    onChange={(e) => setCustomMaxServices(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-xs font-semibold"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4D8]">
                    <span className="font-semibold text-[11px]">Fotos en Hitos Históricos</span>
                    <input
                      type="checkbox"
                      checked={customAllowTimelinePhotos}
                      onChange={(e) => setCustomAllowTimelinePhotos(e.target.checked)}
                      className="rounded text-[#C29837]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4D8]">
                    <span className="font-semibold text-[11px]">Fotos en Capillas y Cementerios</span>
                    <input
                      type="checkbox"
                      checked={customAllowServicePhotos}
                      onChange={(e) => setCustomAllowServicePhotos(e.target.checked)}
                      className="rounded text-[#C29837]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4D8]">
                    <span className="font-semibold text-[11px]">Fotos en Velas Virtuales</span>
                    <input
                      type="checkbox"
                      checked={customAllowTributePhotos}
                      onChange={(e) => setCustomAllowTributePhotos(e.target.checked)}
                      className="rounded text-[#C29837]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4D8]">
                    <span className="font-semibold text-[11px]">Habilitar Subida de Videos</span>
                    <input
                      type="checkbox"
                      checked={customAllowVideo}
                      onChange={(e) => setCustomAllowVideo(e.target.checked)}
                      className="rounded text-[#C29837]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    Límite de Almacenamiento (MB)
                  </label>
                  <input
                    type="number"
                    value={customStorageMB}
                    onChange={(e) => setCustomStorageMB(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F2ECE1]">
                <button
                  type="button"
                  onClick={() => setEditingMemorial(null)}
                  className="px-4 py-2 rounded-full text-xs text-[#7A7167] hover:bg-[#F2ECE1] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomLimits}
                  className="px-5 py-2 rounded-full bg-[#8C6B32] hover:bg-[#785924] text-white text-xs font-semibold cursor-pointer shadow-sm transition-colors"
                >
                  Guardar Cuotas
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
