'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '../../../../components/common/Navbar';
import { ImageUploader } from '../../../../components/common/ImageUploader';
import { InteractiveMap } from '../../../../components/common/InteractiveMap';
import { memorialService } from '../../../../services/memorialService';
import { authService } from '../../../../services/authService';
import { 
  Obituary, 
  Tribute, 
  FuneralService, 
  TimelineMilestone, 
  ServiceType,
  MemorialFont, 
  MemorialThemePreset, 
  MemorialAccent 
} from '../../../../types/memorial';
import { SUBSCRIPTION_PLANS } from '../../../../data/plans';
import { 
  Heart, 
  Flame, 
  Image as ImageIcon, 
  Clock, 
  ShieldCheck, 
  Check, 
  X, 
  Save, 
  Plus, 
  Trash2, 
  ExternalLink,
  ArrowLeft,
  Church,
  Palette,
  Type,
  MapPin,
  Calendar,
  Camera,
  AlertCircle,
  Eye,
  Edit3,
  Compass
} from 'lucide-react';

interface VenuePreset {
  city: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

const VENUE_PRESETS: VenuePreset[] = [
  // Tarija (Prioritario)
  {
    city: 'Tarija',
    name: 'Parroquia San Roque - Tarija',
    address: 'Plaza Campero esq. Corrado, Zona San Roque',
    lat: -21.5330,
    lng: -64.7330,
  },
  {
    city: 'Tarija',
    name: 'Catedral Metropolitana de Tarija',
    address: 'Plaza Luis de Fuentes, Centro Histórico',
    lat: -21.5323,
    lng: -64.7338,
  },
  {
    city: 'Tarija',
    name: 'Funeraria Santa Teresa - Salón Jazmín',
    address: 'Calle Sucre esq. Corrado #540, Tarija',
    lat: -21.5315,
    lng: -64.7310,
  },
  {
    city: 'Tarija',
    name: 'Cementerio General de Tarija',
    address: 'Calle Isaac Attie y Av. Membrillos',
    lat: -21.5390,
    lng: -64.7280,
  },
  {
    city: 'Tarija',
    name: 'Camposanto Jardín del Recuerdo - Tarija',
    address: 'Av. Circunvalación y Pasaje Las Flores',
    lat: -21.5450,
    lng: -64.7200,
  },
  // La Paz
  {
    city: 'La Paz',
    name: 'Funeraria La Paz - Salón Los Olivos',
    address: 'Av. Arce esq. Cordero #2435, Zona San Jorge',
    lat: -16.5120,
    lng: -68.1250,
  },
  {
    city: 'La Paz',
    name: 'Basílica Menor de San Francisco',
    address: 'Plaza Mayor de San Francisco, Casco Viejo',
    lat: -16.4960,
    lng: -68.1370,
  },
  {
    city: 'La Paz',
    name: 'Cementerio Jardín - Pabellón Los Ángeles',
    address: 'Camino a Aranjuez Km 3.5, Zona Sur',
    lat: -16.5350,
    lng: -68.0890,
  },
  // Cochabamba
  {
    city: 'Cochabamba',
    name: 'Funeraria Concordia - Salón Magnolias',
    address: 'Av. Heroínas esq. Hamiraya #450',
    lat: -17.3930,
    lng: -66.1570,
  },
  {
    city: 'Cochabamba',
    name: 'Cementerio General de Cochabamba',
    address: 'Av. Petrolera y Calle Santiváñez',
    lat: -17.4080,
    lng: -66.1600,
  },
  // Santa Cruz
  {
    city: 'Santa Cruz',
    name: 'Salón Velatorio Las Misiones',
    address: '2do Anillo y Av. Busch',
    lat: -17.7833,
    lng: -63.1821,
  },
  {
    city: 'Santa Cruz',
    name: 'Cementerio Parque El Ceibo',
    address: 'Carretera al Norte Km 9',
    lat: -17.7200,
    lng: -63.1600,
  },
  // Sucre
  {
    city: 'Sucre',
    name: 'Catedral Metropolitana de Sucre',
    address: 'Plaza 25 de Mayo',
    lat: -19.0480,
    lng: -65.2600,
  },
  {
    city: 'Sucre',
    name: 'Cementerio General de Sucre',
    address: 'Calle Linares s/n',
    lat: -19.0520,
    lng: -65.2630,
  },
];

export default function FamilyDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [memorial, setMemorial] = useState<Obituary | null>(null);
  const [activeTab, setActiveTab] = useState<'photos' | 'design' | 'bio' | 'services' | 'timeline' | 'moderation'>('photos');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Estados editables
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [epitaph, setEpitaph] = useState('');
  const [biography, setBiography] = useState('');
  const [mainPhotoUrl, setMainPhotoUrl] = useState('');
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('');
  const [moderationRequired, setModerationRequired] = useState(true);

  // Estados de Personalización Visual (Tipografía y Colores)
  const [fontFamily, setFontFamily] = useState<MemorialFont>('serif-cormorant');
  const [themePreset, setThemePreset] = useState<MemorialThemePreset>('ivory-warm');
  const [primaryAccent, setPrimaryAccent] = useState<MemorialAccent>('gold');

  // Hitos de vida
  const [timeline, setTimeline] = useState<TimelineMilestone[]>([]);
  const [newYear, setNewYear] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [editingMilestone, setEditingMilestone] = useState<TimelineMilestone | null>(null);

  // Servicios y Ceremonias
  const [services, setServices] = useState<FuneralService[]>([]);
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<FuneralService | null>(null);
  const [newServiceType, setNewServiceType] = useState<ServiceType>('velatorio');
  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newServiceLocation, setNewServiceLocation] = useState('');
  const [newServiceAddress, setNewServiceAddress] = useState('');
  const [newServiceDate, setNewServiceDate] = useState('');
  const [newServiceTime, setNewServiceTime] = useState('');
  const [newServiceNotes, setNewServiceNotes] = useState('');
  const [newServicePhotoUrl, setNewServicePhotoUrl] = useState('');
  const [newServiceLat, setNewServiceLat] = useState<number>(-16.5120);
  const [newServiceLng, setNewServiceLng] = useState<number>(-68.1250);

  // Previsualización de foto en moderación de velas
  const [previewTributePhoto, setPreviewTributePhoto] = useState<string | null>(null);

  const loadMemorial = async () => {
    if (!slug) return;
    setIsLoading(true);
    const data = await memorialService.getBySlug(slug);
    if (data) {
      setMemorial(data);
      setFullName(data.fullName);
      setNickname(data.nickname || '');
      setBirthDate(data.birthDate);
      setDeathDate(data.deathDate);
      setBirthPlace(data.birthPlace || '');
      setEpitaph(data.epitaph);
      setBiography(data.biography);
      setMainPhotoUrl(data.mainPhotoUrl);
      setCoverPhotoUrl(data.coverPhotoUrl || '');
      setModerationRequired(data.moderationRequired);
      setTimeline(data.timeline || []);
      setServices(data.services || []);
      setFontFamily(data.fontFamily || 'serif-cormorant');
      setThemePreset(data.themePreset || 'ivory-warm');
      setPrimaryAccent(data.primaryAccent || 'gold');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!slug) return;
    const canAccess = authService.canManageMemorial(slug);
    if (!canAccess) {
      router.push(`/login?redirect=/memorial/${slug}/admin`);
      return;
    }
    loadMemorial();
  }, [slug, router]);

  const showNotification = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleSaveGeneral = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!memorial) return;

    setIsSaving(true);
    try {
      const updated: Obituary = {
        ...memorial,
        fullName,
        nickname,
        birthDate,
        deathDate,
        birthPlace,
        epitaph,
        biography,
        mainPhotoUrl,
        coverPhotoUrl,
        moderationRequired,
        timeline,
        services,
        fontFamily,
        themePreset,
        primaryAccent,
      };

      await memorialService.updateObituary(updated);
      setMemorial(updated);
      showNotification('Los cambios de diseño e información han sido guardados con éxito.');
    } catch (err) {
      console.error(err);
      alert('Hubo un error al guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTimelineMilestone = () => {
    if (!newYear.trim() || !newTitle.trim()) {
      alert('Por favor indica al menos el año y el título del hito.');
      return;
    }
    const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === memorial?.planId) || SUBSCRIPTION_PLANS[0];
    if (timeline.length >= currentPlan.limits.maxTimelineMilestones) {
      alert(`Has alcanzado el límite de ${currentPlan.limits.maxTimelineMilestones} hitos permitidos en tu ${currentPlan.name}.`);
      return;
    }
    const newMilestone: TimelineMilestone = {
      id: 'milestone-' + Date.now(),
      obituaryId: memorial?.id || '',
      year: newYear.trim(),
      title: newTitle.trim(),
      description: newDesc.trim(),
      photoUrl: currentPlan.limits.allowsTimelinePhotos && newPhotoUrl.trim() ? newPhotoUrl.trim() : undefined,
    };
    setTimeline([...timeline, newMilestone]);
    setNewYear('');
    setNewTitle('');
    setNewDesc('');
    setNewPhotoUrl('');
    showNotification('Hito agregado a la línea de tiempo. Recuerda guardar los cambios.');
  };

  const handleSaveEditedMilestone = () => {
    if (!editingMilestone) return;
    if (!editingMilestone.year.trim() || !editingMilestone.title.trim()) {
      alert('Por favor indica al menos el año y el título del hito.');
      return;
    }
    setTimeline(timeline.map((m) => (m.id === editingMilestone.id ? editingMilestone : m)));
    setEditingMilestone(null);
    showNotification('Hito actualizado correctamente. Recuerda guardar los cambios.');
  };

  const handleRemoveTimelineMilestone = (id: string) => {
    setTimeline(timeline.filter((t) => t.id !== id));
    if (editingMilestone?.id === id) {
      setEditingMilestone(null);
    }
  };

  const handleAddService = () => {
    if (!newServiceTitle.trim() || !newServiceLocation.trim()) {
      alert('Por favor ingresa al menos el título y el nombre del lugar de la ceremonia.');
      return;
    }
    const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === memorial?.planId) || SUBSCRIPTION_PLANS[0];
    if (services.length >= currentPlan.limits.maxServices) {
      alert(`Has alcanzado el límite de ${currentPlan.limits.maxServices} ceremonias permitidas en tu ${currentPlan.name}.`);
      return;
    }
    const newService: FuneralService = {
      id: 'srv-' + Date.now(),
      obituaryId: memorial?.id || '',
      serviceType: newServiceType,
      title: newServiceTitle.trim(),
      locationName: newServiceLocation.trim(),
      address: newServiceAddress.trim() || 'Dirección a coordinar con la familia',
      date: newServiceDate || new Date().toISOString().split('T')[0],
      time: newServiceTime || '10:00',
      notes: newServiceNotes.trim() || undefined,
      photoUrl: currentPlan.limits.allowsServicePhotos && newServicePhotoUrl.trim() ? newServicePhotoUrl.trim() : undefined,
      coordinatesLat: newServiceLat,
      coordinatesLng: newServiceLng,
    };
    setServices([...services, newService]);
    setNewServiceTitle('');
    setNewServiceLocation('');
    setNewServiceAddress('');
    setNewServiceDate('');
    setNewServiceTime('');
    setNewServiceNotes('');
    setNewServicePhotoUrl('');
    setShowAddServiceForm(false);
    showNotification('Ceremonia agregada a la lista. Recuerda guardar los cambios.');
  };

  const handleSaveEditedService = () => {
    if (!editingService) return;
    if (!editingService.title.trim() || !editingService.locationName.trim()) {
      alert('Por favor indica el título y el nombre del lugar de la ceremonia.');
      return;
    }
    setServices(services.map((s) => (s.id === editingService.id ? editingService : s)));
    setEditingService(null);
    showNotification('Ceremonia actualizada correctamente. Recuerda guardar los cambios.');
  };

  const handleApproveTribute = async (tributeId: string) => {
    if (!memorial) return;
    await memorialService.approveTribute(memorial.id, tributeId);
    showNotification('Condolencia aprobada y publicada.');
    loadMemorial();
  };

  const handleRejectTribute = async (tributeId: string) => {
    if (!memorial) return;
    if (confirm('¿Deseas descartar permanentemente este mensaje?')) {
      await memorialService.rejectTribute(memorial.id, tributeId);
      showNotification('Condolencia descartada.');
      loadMemorial();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Flame className="w-8 h-8 text-[#C29837] animate-flame" />
        </div>
      </div>
    );
  }

  if (!memorial) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="font-memorial text-2xl text-[#2D2926] mb-2">
            Memorial no encontrado
          </h2>
          <Link href="/" className="text-xs text-[#C29837] underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === memorial.planId) || SUBSCRIPTION_PLANS[0];
  const pendingTributes = memorial.tributes.filter((t) => t.moderationStatus === 'pending');

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#2D2926] flex flex-col selection:bg-[#E8DED1]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        {feedback && (
          <div className="fixed top-20 right-6 z-50 bg-[#2D2926] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-[#C29837]" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Encabezado del Panel Familiar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#EAE4D8]">
          <div>
            <Link
              href={`/memorial/${memorial.slug}`}
              className="inline-flex items-center gap-1.5 text-xs text-[#8C847A] hover:text-[#C29837] mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ver Memorial Público</span>
            </Link>
            <h1 className="font-memorial text-2xl sm:text-3xl text-[#2D2926]">
              Panel de {memorial.fullName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[#7A7167]">
                Membresía activa:
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FAF3E3] text-[#C29837] text-[11px] font-semibold border border-[#E8D7B0]">
                {currentPlan.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/memorial/${memorial.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#D8CABE] bg-white text-xs font-semibold hover:bg-[#F2ECE1] transition-colors"
            >
              <span>Ver Memorial Público</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Pestañas del Panel Familiar */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 border-b border-[#EAE4D8]">
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'photos'
                ? 'bg-[#8C6B32] text-white shadow-xs'
                : 'text-[#736B63] hover:bg-[#F3ECE0]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Fotos y Retrato</span>
          </button>

          <button
            onClick={() => setActiveTab('design')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'design'
                ? 'bg-[#8C6B32] text-white shadow-xs'
                : 'text-[#736B63] hover:bg-[#F3ECE0]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Tipografía y Colores</span>
          </button>

          <button
            onClick={() => setActiveTab('bio')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'bio'
                ? 'bg-[#8C6B32] text-white shadow-xs'
                : 'text-[#736B63] hover:bg-[#F3ECE0]'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Biografía y Datos</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'services'
                ? 'bg-[#8C6B32] text-white shadow-xs'
                : 'text-[#736B63] hover:bg-[#F3ECE0]'
            }`}
          >
            <Church className="w-3.5 h-3.5" />
            <span>Ceremonias y Mapa</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'bg-[#8C6B32] text-white shadow-xs'
                : 'text-[#736B63] hover:bg-[#F3ECE0]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Línea de Vida</span>
          </button>

          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 relative ${
              activeTab === 'moderation'
                ? 'bg-[#8C6B32] text-white shadow-xs'
                : 'text-[#736B63] hover:bg-[#F3ECE0]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Moderar Velas</span>
            {pendingTributes.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#E5A93C] text-black font-bold text-[10px]">
                {pendingTributes.length}
              </span>
            )}
          </button>
        </div>

        {/* PESTAÑA 1: GESTIÓN DE FOTOS */}
        {activeTab === 'photos' && (
          <div className="bg-white border border-[#EAE4D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="font-memorial text-xl text-[#2D2926] mb-1">
                Fotografías y Retrato
              </h2>
              <p className="text-xs text-[#7A7167]">
                Carga archivos directamente desde tu dispositivo para actualizar el memorial.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <ImageUploader
                label="Fotografía de Retrato Principal (Circular)"
                initialUrl={mainPhotoUrl}
                onImageSelected={(url) => setMainPhotoUrl(url)}
                helperText="El retrato que presidirá el memorial con halo solemne y recorte circular."
                aspectRatio="round"
                cropShape="round"
              />

              <ImageUploader
                label="Fotografía de Portada (Paisaje / Encabezado)"
                initialUrl={coverPhotoUrl}
                onImageSelected={(url) => setCoverPhotoUrl(url)}
                helperText="Paisaje sereno, naturaleza o lugar significativo con recorte panorámico."
                aspectRatio="wide"
                cropShape="wide"
              />
            </div>

            <div className="pt-6 border-t border-[#F2ECE1] flex justify-end">
              <button
                type="button"
                onClick={() => handleSaveGeneral()}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#8C6B32] hover:bg-[#785924] text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Guardando...' : 'Guardar Fotografías'}</span>
              </button>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: PERSONALIZACIÓN DE TIPOGRAFÍA Y COLORES */}
        {activeTab === 'design' && (
          <div className="bg-white border border-[#EAE4D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="font-memorial text-xl text-[#2D2926] mb-1">
                Personalización Estética y Tipográfica
              </h2>
              <p className="text-xs text-[#7A7167]">
                Elige la tipografía solemne y el tono de color que mejor refleje la personalidad y serenidad de tu ser amado.
              </p>
            </div>

            {/* PREVISUALIZADOR EN VIVO */}
            <div className="p-5 sm:p-6 rounded-2xl border-2 border-[#C29837]/30 bg-[#FAF8F5] shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE4D8] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#FAF3E3] border border-[#E8D7B0] flex items-center justify-center text-[#C29837]">
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2D2926]">
                    Previsualizador en Tiempo Real del Memorial
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#7A7167]">
                  <span className="px-2 py-0.5 rounded-md bg-white border border-[#D8CABE] font-medium">
                    Fuente: {
                      fontFamily === 'serif-cormorant' ? 'Cormorant Garamond' :
                      fontFamily === 'serif-cinzel' ? 'Cinzel' :
                      fontFamily === 'serif-playfair' ? 'Playfair' :
                      fontFamily === 'serif-lora' ? 'Lora' :
                      fontFamily === 'serif-merriweather' ? 'Merriweather' :
                      fontFamily === 'serif-bodoni' ? 'Bodoni Moda' :
                      fontFamily === 'sans-montserrat' ? 'Montserrat' : 'Inter'
                    }
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-[#D8CABE] font-medium">
                    Tono: {themePreset === 'ivory-warm' ? 'Marfil Cálido' : themePreset === 'charcoal-dark' ? 'Noche Solemne' : themePreset === 'olive-peace' ? 'Olivo de Paz' : 'Sepia Recuerdo'}
                  </span>
                </div>
              </div>

              {/* Tarjeta interactiva simulada */}
              <div
                className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 text-center relative overflow-hidden ${
                  themePreset === 'ivory-warm'
                    ? 'bg-[#FBF9F5] border-[#EAE4D8] text-[#2D2926]'
                    : themePreset === 'charcoal-dark'
                    ? 'bg-[#171A20] border-[#2E3544] text-[#F3F0EA]'
                    : themePreset === 'olive-peace'
                    ? 'bg-[#F4F7F4] border-[#D1DDD2] text-[#243326]'
                    : 'bg-[#F7F3EE] border-[#DFD3C5] text-[#3D3228]'
                }`}
              >
                {/* Retrato del difunto */}
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <div
                    className={`w-full h-full rounded-full overflow-hidden border-2 shadow-sm ${
                      primaryAccent === 'gold'
                        ? 'border-[#C29837]'
                        : primaryAccent === 'silver'
                        ? 'border-[#A3A8B0]'
                        : primaryAccent === 'amber'
                        ? 'border-[#D97706]'
                        : 'border-[#78350F]'
                    }`}
                  >
                    <img
                      src={mainPhotoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400'}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#FAF3E3] border border-[#DFCDB8] flex items-center justify-center text-[#C29837]">
                    <Flame className="w-3.5 h-3.5 animate-flame" />
                  </div>
                </div>

                {/* Nombre con la tipografía seleccionada */}
                <h3
                  className={`text-xl sm:text-2xl font-bold mb-1 transition-all ${
                    fontFamily === 'serif-cormorant'
                      ? 'font-serif-cormorant tracking-normal'
                      : fontFamily === 'serif-cinzel'
                      ? 'font-serif-cinzel tracking-widest uppercase'
                      : fontFamily === 'serif-playfair'
                      ? 'font-serif-playfair tracking-normal italic'
                      : fontFamily === 'serif-lora'
                      ? 'font-serif-lora tracking-normal'
                      : fontFamily === 'serif-merriweather'
                      ? 'font-serif-merriweather tracking-normal'
                      : fontFamily === 'serif-bodoni'
                      ? 'font-serif-bodoni tracking-wide'
                      : fontFamily === 'sans-montserrat'
                      ? 'font-sans-montserrat tracking-wide'
                      : 'font-sans-inter tracking-tight'
                  }`}
                >
                  {fullName || 'Nombre de tu Ser Querido'}
                </h3>

                {nickname && (
                  <p className="text-xs text-[#8C847A] font-script mb-1">
                    «{nickname}»
                  </p>
                )}

                {/* Fechas de vida */}
                <p className="text-xs text-[#7A7167] mb-3">
                  {birthDate ? birthDate.split('-')[0] : '1948'} — {deathDate ? deathDate.split('-')[0] : '2026'}{' '}
                  {birthPlace ? `• ${birthPlace}` : ''}
                </p>

                {/* Epitafio */}
                <p
                  className={`text-xs sm:text-sm max-w-lg mx-auto leading-relaxed italic ${
                    primaryAccent === 'gold'
                      ? 'text-[#8A671E]'
                      : primaryAccent === 'amber'
                      ? 'text-[#B45309]'
                      : 'text-[#544D46]'
                  }`}
                >
                  {epitaph || '«Tu vocación curó cuerpos, tu bondad abrigó almas. Tu luz vivirá por siempre.»'}
                </p>

                <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-center gap-3 text-[11px] text-[#7A7167]">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-[#C29837]" />
                    <span>Velas y Oraciones Activas</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-[#C29837]" />
                    <span>Espacio Familiar Protegido</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Selector de 8 Tipografías Solemnes */}
            <div>
              <label className="block text-xs font-semibold mb-2 flex items-center gap-1.5 text-[#544D46]">
                <Type className="w-3.5 h-3.5 text-[#C29837]" />
                <span>Tipografía para Nombres y Epitafios (8 Opciones)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div
                  onClick={() => setFontFamily('serif-cormorant')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    fontFamily === 'serif-cormorant'
                      ? 'border-[#C29837] bg-[#FFFBF2] ring-2 ring-[#C29837]/30 shadow-xs'
                      : 'border-[#EAE4D8] bg-[#FAF8F5] hover:bg-[#F5EFE6]'
                  }`}
                >
                  <p className="text-sm font-serif-cormorant font-bold text-[#2D2926]">Cormorant Garamond</p>
                  <p className="text-[10px] text-[#7A7167] italic mt-0.5">«Elegancia clásica, espiritual y respetuosa»</p>
                </div>

                <div
                  onClick={() => setFontFamily('serif-cinzel')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    fontFamily === 'serif-cinzel'
                      ? 'border-[#C29837] bg-[#FFFBF2] ring-2 ring-[#C29837]/30 shadow-xs'
                      : 'border-[#EAE4D8] bg-[#FAF8F5] hover:bg-[#F5EFE6]'
                  }`}
                >
                  <p className="text-sm tracking-wider font-serif-cinzel font-semibold text-[#2D2926] uppercase">Cinzel Roman</p>
                  <p className="text-[10px] text-[#7A7167] mt-0.5">«Inscripción solemne de piedra y memorial»</p>
                </div>

                <div
                  onClick={() => setFontFamily('serif-playfair')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    fontFamily === 'serif-playfair'
                      ? 'border-[#C29837] bg-[#FFFBF2] ring-2 ring-[#C29837]/30 shadow-xs'
                      : 'border-[#EAE4D8] bg-[#FAF8F5] hover:bg-[#F5EFE6]'
                  }`}
                >
                  <p className="text-sm font-serif-playfair font-bold text-[#2D2926]">Playfair Display</p>
                  <p className="text-[10px] text-[#7A7167] italic mt-0.5">«Cálida, humana y profundamente emotiva»</p>
                </div>

                <div
                  onClick={() => setFontFamily('serif-lora')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    fontFamily === 'serif-lora'
                      ? 'border-[#C29837] bg-[#FFFBF2] ring-2 ring-[#C29837]/30 shadow-xs'
                      : 'border-[#EAE4D8] bg-[#FAF8F5] hover:bg-[#F5EFE6]'
                  }`}
                >
                  <p className="text-sm font-serif-lora font-bold text-[#2D2926]">Lora Literaria</p>
                  <p className="text-[10px] text-[#7A7167] italic mt-0.5">«Serena, intimista y conmovedora»</p>
                </div>

                <div
                  onClick={() => setFontFamily('serif-merriweather')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    fontFamily === 'serif-merriweather'
                      ? 'border-[#C29837] bg-[#FFFBF2] ring-2 ring-[#C29837]/30 shadow-xs'
                      : 'border-[#EAE4D8] bg-[#FAF8F5] hover:bg-[#F5EFE6]'
                  }`}
                >
                  <p className="text-sm font-serif-merriweather font-bold text-[#2D2926]">Merriweather Noble</p>
                  <p className="text-[10px] text-[#7A7167] mt-0.5">«Sobria, académica y de gran presencia»</p>
                </div>

                <div
                  onClick={() => setFontFamily('serif-bodoni')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    fontFamily === 'serif-bodoni'
                      ? 'border-[#C29837] bg-[#FFFBF2] ring-2 ring-[#C29837]/30 shadow-xs'
                      : 'border-[#EAE4D8] bg-[#FAF8F5] hover:bg-[#F5EFE6]'
                  }`}
                >
                  <p className="text-sm font-serif-bodoni font-bold text-[#2D2926]">Bodoni Moda</p>
                  <p className="text-[10px] text-[#7A7167] mt-0.5">«Distinción aristocrática y lujo sereno»</p>
                </div>

                <div
                  onClick={() => setFontFamily('sans-montserrat')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    fontFamily === 'sans-montserrat'
                      ? 'border-[#C29837] bg-[#FFFBF2] ring-2 ring-[#C29837]/30 shadow-xs'
                      : 'border-[#EAE4D8] bg-[#FAF8F5] hover:bg-[#F5EFE6]'
                  }`}
                >
                  <p className="text-sm font-sans-montserrat font-bold text-[#2D2926]">Montserrat</p>
                  <p className="text-[10px] text-[#7A7167] mt-0.5">«Geométrica, contemporánea y noble»</p>
                </div>

                <div
                  onClick={() => setFontFamily('sans-inter')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    fontFamily === 'sans-inter'
                      ? 'border-[#C29837] bg-[#FFFBF2] ring-2 ring-[#C29837]/30 shadow-xs'
                      : 'border-[#EAE4D8] bg-[#FAF8F5] hover:bg-[#F5EFE6]'
                  }`}
                >
                  <p className="text-sm font-sans-inter font-bold text-[#2D2926]">Inter Sereno</p>
                  <p className="text-[10px] text-[#7A7167] mt-0.5">«Limpia, moderna y de máxima legibilidad»</p>
                </div>
              </div>
            </div>

            {/* Selector de Tono de Fondo del Memorial */}
            <div>
              <label className="block text-xs font-semibold mb-2 flex items-center gap-1.5 text-[#544D46]">
                <Palette className="w-3.5 h-3.5 text-[#C29837]" />
                <span>Paleta de Fondo del Memorial</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setThemePreset('ivory-warm')}
                  className={`p-3 rounded-2xl border text-center font-medium transition-all cursor-pointer ${
                    themePreset === 'ivory-warm'
                      ? 'border-[#C29837] bg-[#FFFBF2] ring-2 ring-[#C29837]/30 shadow-xs'
                      : 'border-[#EAE4D8] bg-[#FAF8F5] hover:bg-[#F5EFE6]'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-[#FBF9F5] border border-[#DFCDB8] mx-auto mb-1.5 shadow-xs" />
                  <span className="text-[#2D2926] font-semibold">Marfil Cálido</span>
                </button>

                <button
                  type="button"
                  onClick={() => setThemePreset('charcoal-dark')}
                  className={`p-3 rounded-2xl border text-center font-medium transition-all cursor-pointer ${
                    themePreset === 'charcoal-dark'
                      ? 'border-[#C29837] bg-[#FFFBF2] ring-2 ring-[#C29837]/30 shadow-xs'
                      : 'border-[#EAE4D8] bg-[#FAF8F5] hover:bg-[#F5EFE6]'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-[#171A20] border border-[#38404F] mx-auto mb-1.5 shadow-xs" />
                  <span className="text-[#2D2926] font-semibold">Noche Solemne</span>
                </button>

                <button
                  type="button"
                  onClick={() => setThemePreset('olive-peace')}
                  className={`p-3 rounded-2xl border text-center font-medium transition-all cursor-pointer ${
                    themePreset === 'olive-peace'
                      ? 'border-[#C29837] bg-[#FFFBF2] ring-2 ring-[#C29837]/30 shadow-xs'
                      : 'border-[#EAE4D8] bg-[#FAF8F5] hover:bg-[#F5EFE6]'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-[#EBF0EB] border border-[#CDE0CE] mx-auto mb-1.5 shadow-xs" />
                  <span className="text-[#2D2926] font-semibold">Olivo de Paz</span>
                </button>

                <button
                  type="button"
                  onClick={() => setThemePreset('rose-memory')}
                  className={`p-3 rounded-2xl border text-center font-medium transition-all cursor-pointer ${
                    themePreset === 'rose-memory'
                      ? 'border-[#C29837] bg-[#FFFBF2] ring-2 ring-[#C29837]/30 shadow-xs'
                      : 'border-[#EAE4D8] bg-[#FAF8F5] hover:bg-[#F5EFE6]'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-[#F3EDE6] border border-[#DFCDB8] mx-auto mb-1.5 shadow-xs" />
                  <span className="text-[#2D2926] font-semibold">Sepia Recuerdo</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F2ECE1] flex justify-end">
              <button
                type="button"
                onClick={() => handleSaveGeneral()}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#8C6B32] hover:bg-[#785924] text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Guardando...' : 'Aplicar Estilo al Memorial'}</span>
              </button>
            </div>
          </div>
        )}

        {/* PESTAÑA 3: BIOGRAFÍA Y DATOS */}
        {activeTab === 'bio' && (
          <form onSubmit={handleSaveGeneral} className="bg-white border border-[#EAE4D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="font-memorial text-xl text-[#2D2926] pb-2 border-b border-[#F2ECE1]">
              Datos Biográficos
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#544D46] mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-sm text-[#2D2926] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#544D46] mb-1">
                  Apodo entrañable
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-sm text-[#2D2926] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#544D46] mb-1">
                  Ciudad o Lugar de Descanso
                </label>
                <input
                  type="text"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-sm text-[#2D2926] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#544D46] mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#C29837]" />
                  <span>Fecha de Nacimiento</span>
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  onClick={(e) => (e.target as any).showPicker?.()}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-sm text-[#2D2926] focus:outline-none focus:ring-2 focus:ring-[#C29837]/30 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#544D46] mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#C29837]" />
                  <span>Fecha de Partida</span>
                </label>
                <input
                  type="date"
                  value={deathDate}
                  onChange={(e) => setDeathDate(e.target.value)}
                  onClick={(e) => (e.target as any).showPicker?.()}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-sm text-[#2D2926] focus:outline-none focus:ring-2 focus:ring-[#C29837]/30 cursor-pointer"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#544D46] mb-1">
                  Epitafio o Mensaje Solemne
                </label>
                <input
                  type="text"
                  value={epitaph}
                  onChange={(e) => setEpitaph(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-sm text-[#2D2926] font-script focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#544D46] mb-1">
                  Biografía de Vida
                </label>
                <textarea
                  rows={6}
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-sm text-[#2D2926] leading-relaxed focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#F2ECE1] flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#8C6B32] hover:bg-[#785924] text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Guardando...' : 'Guardar Información'}</span>
              </button>
            </div>
          </form>
        )}

        {/* PESTAÑA 4: SERVICIOS Y MAPA */}
        {activeTab === 'services' && (
          <div className="bg-white border border-[#EAE4D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F2ECE1]">
              <div>
                <h2 className="font-memorial text-xl text-[#2D2926] mb-1">
                  Servicios Funerarios y Ubicación en Mapa
                </h2>
                <p className="text-xs text-[#7A7167]">
                  Registra los lugares de velatorio, misa y camposanto con mapa interactivo para que los familiares asistan con puntualidad.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#FAF3E3] text-[#C29837] text-xs font-semibold border border-[#E8D7B0]">
                  {services.length} / {currentPlan.limits.maxServices} Ceremonias
                </span>
                {services.length < currentPlan.limits.maxServices && !showAddServiceForm && !editingService && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddServiceForm(true);
                      setEditingService(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#8C6B32] hover:bg-[#785924] text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Añadir Ceremonia</span>
                  </button>
                )}
              </div>
            </div>

            {/* Banner explicativo del mapa */}
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#DFCDB8] text-xs text-[#6B635A] flex items-start gap-3">
              <Compass className="w-4 h-4 text-[#C29837] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#2D2926]">Ubicación y Navegación Precisa: </span>
                Cada ceremonia incluye un mapa interactivo con OpenStreetMap. Los familiares podrán ubicar la capilla o el camposanto y abrir la ruta con un toque en Google Maps desde su celular.
              </div>
            </div>

            {/* MODAL PARA EDITAR CEREMONIA EXISTENTE */}
            {editingService && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white border-2 border-[#C29837] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1]">
                    <h4 className="font-semibold text-sm text-[#2D2926] uppercase tracking-wider flex items-center gap-1.5">
                      <Edit3 className="w-4 h-4 text-[#C29837]" />
                      <span>Editar Ceremonia: {editingService.title}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setEditingService(null)}
                      className="p-1 text-[#8C847A] hover:text-[#2D2926] cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Selector rápido de recinto sugerido */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#544D46]">
                      Seleccionar Recinto Sugerido (Autocompleta nombre, dirección y coordenadas)
                    </label>
                    <select
                      onChange={(e) => {
                        const idx = parseInt(e.target.value);
                        if (!isNaN(idx) && VENUE_PRESETS[idx]) {
                          const p = VENUE_PRESETS[idx];
                          setEditingService({
                            ...editingService,
                            locationName: p.name,
                            address: p.address,
                            coordinatesLat: p.lat,
                            coordinatesLng: p.lng,
                          });
                        }
                      }}
                      defaultValue=""
                      className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-white text-xs font-medium text-[#2D2926]"
                    >
                      <option value="" disabled>-- Elegir capilla o camposanto conocido --</option>
                      {VENUE_PRESETS.map((vp, i) => (
                        <option key={i} value={i}>
                          {vp.city}: {vp.name} ({vp.address})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold mb-1 text-[#544D46]">Tipo de Ceremonia</label>
                      <select
                        value={editingService.serviceType}
                        onChange={(e) => setEditingService({ ...editingService, serviceType: e.target.value as ServiceType })}
                        className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-white text-xs font-medium"
                      >
                        <option value="velatorio">Capilla Ardiente / Velatorio</option>
                        <option value="misa_cuerpo_presente">Misa de Cuerpo Presente</option>
                        <option value="sepelio">Descanso Eterno / Sepelio (Camposanto)</option>
                        <option value="cremacion">Ceremonia de Cremación</option>
                        <option value="novenario">Misa de 9 Días / Novenario</option>
                        <option value="cabo_de_ano">Misa de Cabo de Año (1 Año)</option>
                        <option value="homenaje_virtual">Homenaje Virtual / Transmisión</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-[#544D46]">Título de la Ceremonia *</label>
                      <input
                        type="text"
                        value={editingService.title}
                        onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-[#544D46]">Nombre del Recinto / Capilla *</label>
                      <input
                        type="text"
                        value={editingService.locationName}
                        onChange={(e) => setEditingService({ ...editingService, locationName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-[#544D46]">Dirección Completa</label>
                      <input
                        type="text"
                        value={editingService.address}
                        onChange={(e) => setEditingService({ ...editingService, address: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-[#544D46] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#C29837]" />
                        <span>Fecha</span>
                      </label>
                      <input
                        type="date"
                        value={editingService.date}
                        onChange={(e) => setEditingService({ ...editingService, date: e.target.value })}
                        onClick={(e) => (e.target as any).showPicker?.()}
                        className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C29837]/30"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-[#544D46] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#C29837]" />
                        <span>Horario</span>
                      </label>
                      <input
                        type="time"
                        value={editingService.time}
                        onChange={(e) => setEditingService({ ...editingService, time: e.target.value })}
                        onClick={(e) => (e.target as any).showPicker?.()}
                        className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C29837]/30"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-[#544D46]">Coordenada Latitud</label>
                      <input
                        type="number"
                        step="any"
                        value={editingService.coordinatesLat ?? -21.5330}
                        onChange={(e) => setEditingService({ ...editingService, coordinatesLat: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-[#544D46]">Coordenada Longitud</label>
                      <input
                        type="number"
                        step="any"
                        value={editingService.coordinatesLng ?? -64.7330}
                        onChange={(e) => setEditingService({ ...editingService, coordinatesLng: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold mb-1 text-[#544D46]">Notas Familiares</label>
                      <input
                        type="text"
                        value={editingService.notes || ''}
                        onChange={(e) => setEditingService({ ...editingService, notes: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926]"
                      />
                    </div>
                  </div>

                  {/* Mapa previo de la ceremonia en edición con fijador interactivo */}
                  <div className="pt-2">
                    <p className="text-[11px] font-semibold text-[#8C847A] uppercase mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C29837]" />
                      <span>Fijar Ubicación Interactiva (Haz clic en el mapa o arrastra el marcador)</span>
                    </p>
                    <InteractiveMap
                      locationName={editingService.locationName || 'Ubicación de Ceremonia'}
                      address={editingService.address || 'Dirección'}
                      lat={editingService.coordinatesLat || -21.5330}
                      lng={editingService.coordinatesLng || -64.7330}
                      editable={true}
                      onCoordinatesChange={(newLat, newLng) => {
                        setEditingService({
                          ...editingService,
                          coordinatesLat: newLat,
                          coordinatesLng: newLng,
                        });
                      }}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-[#F2ECE1]">
                    <button
                      type="button"
                      onClick={() => setEditingService(null)}
                      className="px-4 py-2 rounded-full text-xs font-semibold text-[#7A7167] hover:bg-[#F2ECE1] cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEditedService}
                      className="flex items-center gap-1.5 px-6 py-2 rounded-full bg-[#2D2926] text-white text-xs font-semibold hover:bg-[#433E3A] cursor-pointer shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Guardar Cambios de Ceremonia</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* FORMULARIO PARA REGISTRAR NUEVA CEREMONIA */}
            {showAddServiceForm && (
              <div className="p-5 sm:p-6 rounded-2xl border-2 border-[#C29837]/40 bg-[#FAF7F2] space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-[#EAE4D8]">
                  <h4 className="font-semibold text-xs text-[#2D2926] uppercase tracking-wider flex items-center gap-1.5">
                    <Church className="w-4 h-4 text-[#C29837]" />
                    <span>Nueva Ceremonia o Homenaje</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddServiceForm(false)}
                    className="text-xs text-[#8C847A] hover:text-[#2D2926] cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>

                {/* Selector rápido de recinto predeterminado */}
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#544D46]">
                    Seleccionar Recinto Sugerido (Autocompleta nombre, dirección y coordenadas)
                  </label>
                  <select
                    onChange={(e) => {
                      const idx = parseInt(e.target.value);
                      if (!isNaN(idx) && VENUE_PRESETS[idx]) {
                        const p = VENUE_PRESETS[idx];
                        setNewServiceLocation(p.name);
                        setNewServiceAddress(p.address);
                        setNewServiceLat(p.lat);
                        setNewServiceLng(p.lng);
                        if (!newServiceTitle) {
                          setNewServiceTitle(`Ceremonia en ${p.name}`);
                        }
                      }
                    }}
                    defaultValue=""
                    className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-white text-xs font-medium text-[#2D2926]"
                  >
                    <option value="" disabled>-- Elegir capilla o camposanto conocido --</option>
                    {VENUE_PRESETS.map((vp, i) => (
                      <option key={i} value={i}>
                        {vp.city}: {vp.name} ({vp.address})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-[#544D46]">Tipo de Ceremonia</label>
                    <select
                      value={newServiceType}
                      onChange={(e) => setNewServiceType(e.target.value as ServiceType)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-white text-xs font-medium"
                    >
                      <option value="velatorio">Capilla Ardiente / Velatorio</option>
                      <option value="misa_cuerpo_presente">Misa de Cuerpo Presente</option>
                      <option value="sepelio">Descanso Eterno / Sepelio (Camposanto)</option>
                      <option value="cremacion">Ceremonia de Cremación</option>
                      <option value="novenario">Misa de 9 Días / Novenario</option>
                      <option value="cabo_de_ano">Misa de Cabo de Año (1 Año)</option>
                      <option value="homenaje_virtual">Homenaje Virtual / Transmisión</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#544D46]">Título de la Ceremonia *</label>
                    <input
                      type="text"
                      placeholder="Ej. Capilla Ardiente y Velatorio Familiar"
                      value={newServiceTitle}
                      onChange={(e) => setNewServiceTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#544D46]">Nombre del Recinto / Capilla *</label>
                    <input
                      type="text"
                      placeholder="Ej. Funeraria Concordia - Salón Magnolias"
                      value={newServiceLocation}
                      onChange={(e) => setNewServiceLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#544D46]">Dirección Completa</label>
                    <input
                      type="text"
                      placeholder="Ej. Av. Arce esq. Cordero #2435"
                      value={newServiceAddress}
                      onChange={(e) => setNewServiceAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#544D46] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#C29837]" />
                      <span>Fecha de la Ceremonia</span>
                    </label>
                    <input
                      type="date"
                      value={newServiceDate}
                      onChange={(e) => setNewServiceDate(e.target.value)}
                      onClick={(e) => (e.target as any).showPicker?.()}
                      className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C29837]/30"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#544D46] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#C29837]" />
                      <span>Horario</span>
                    </label>
                    <input
                      type="time"
                      value={newServiceTime}
                      onChange={(e) => setNewServiceTime(e.target.value)}
                      onClick={(e) => (e.target as any).showPicker?.()}
                      className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C29837]/30"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#544D46]">Coordenada Latitud</label>
                    <input
                      type="number"
                      step="any"
                      value={newServiceLat}
                      onChange={(e) => setNewServiceLat(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#544D46]">Coordenada Longitud</label>
                    <input
                      type="number"
                      step="any"
                      value={newServiceLng}
                      onChange={(e) => setNewServiceLng(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1 text-[#544D46]">Notas Familiares (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej. Se ruega vestimenta formal o tonos claros. Habrá transmisión en vivo."
                      value={newServiceNotes}
                      onChange={(e) => setNewServiceNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926]"
                    />
                  </div>
                </div>

                {/* Subida de Fotografía si el plan lo permite */}
                {currentPlan.limits.allowsServicePhotos ? (
                  <div className="pt-2">
                    <ImageUploader
                      label="Fotografía del Recinto / Capilla o Pabellón de Descanso (Opcional)"
                      initialUrl={newServicePhotoUrl}
                      onImageSelected={(url) => setNewServicePhotoUrl(url)}
                      helperText="Permite a los asistentes reconocer el templo o pabellón del camposanto con facilidad."
                      aspectRatio="wide"
                    />
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-white border border-[#EAE4D8] text-[11px] text-[#7A7167] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#C29837] shrink-0" />
                    <span>
                      En el Plan Esencial se pueden registrar ceremonias con mapa y dirección. Para incluir la foto de la capilla o el pabellón de descanso eterno, actualiza al Plan Homenaje Legado.
                    </span>
                  </div>
                )}

                {/* Mini mapa previo del formulario de alta */}
                <div className="pt-2">
                  <p className="text-[11px] font-semibold text-[#8C847A] uppercase mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C29837]" />
                    <span>Previsualización del Marcador en el Mapa</span>
                  </p>
                  <InteractiveMap
                    locationName={newServiceLocation || 'Ubicación seleccionada'}
                    address={newServiceAddress || 'Dirección'}
                    lat={newServiceLat}
                    lng={newServiceLng}
                    editable={true}
                    onCoordinatesChange={(newLat, newLng) => {
                      setNewServiceLat(newLat);
                      setNewServiceLng(newLng);
                    }}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddServiceForm(false)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-[#7A7167] hover:bg-[#F2ECE1] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="px-5 py-2 rounded-full bg-[#8C6B32] hover:bg-[#785924] text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                  >
                    Añadir Ceremonia
                  </button>
                </div>
              </div>
            )}

            {/* Listado de Ceremonias Registradas */}
            <div className="space-y-4">
              {services.map((srv, idx) => (
                <div key={srv.id || idx} className="p-4 rounded-2xl border border-[#EAE4D8] bg-[#FAF7F2] space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {srv.photoUrl ? (
                        <div className="w-20 h-16 rounded-xl overflow-hidden border border-[#D8CABE] shrink-0 bg-[#F2ECE1]">
                          <img src={srv.photoUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[#F0EAE1] border border-[#DFD3C3] flex items-center justify-center text-[#C29837] shrink-0">
                          <Church className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-sm text-[#2D2926]">{srv.title}</h3>
                        <p className="text-xs text-[#7A7167] mt-0.5">
                          {srv.date} • {srv.time} • <span className="font-medium text-[#2D2926]">{srv.locationName}</span>
                        </p>
                        <p className="text-[11px] text-[#8C847A]">{srv.address}</p>
                        {srv.notes && (
                          <p className="text-[11px] text-[#7A7167] italic mt-1 bg-white/70 p-1.5 rounded-lg border border-[#EDE5DA] inline-block">
                            {srv.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Botones de Editar y Eliminar */}
                    <div className="flex items-center gap-1.5 self-end sm:self-start">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingService(srv);
                          setShowAddServiceForm(false);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF3E3] text-[#C29837] border border-[#E8D7B0] hover:bg-[#F3ECE0] text-xs font-semibold transition-colors cursor-pointer"
                        title="Editar esta ceremonia"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setServices(services.filter((_, i) => i !== idx))}
                        className="p-1.5 text-[#9E4232] hover:bg-[#FBEBE8] rounded-lg transition-colors cursor-pointer"
                        title="Eliminar ceremonia"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mapa Interactivo de la Ceremonia */}
                  <InteractiveMap
                    locationName={srv.locationName}
                    address={srv.address}
                    lat={srv.coordinatesLat || -16.5000}
                    lng={srv.coordinatesLng || -68.1500}
                  />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#F2ECE1] flex justify-end">
              <button
                type="button"
                onClick={() => handleSaveGeneral()}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#8C6B32] hover:bg-[#785924] text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Guardando...' : 'Guardar Ceremonias'}</span>
              </button>
            </div>
          </div>
        )}

        {/* PESTAÑA 5: LÍNEA DE VIDA */}
        {activeTab === 'timeline' && (
          <div className="bg-white border border-[#EAE4D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F2ECE1]">
              <div>
                <h2 className="font-memorial text-xl text-[#2D2926] mb-1">
                  Línea de Tiempo y Momentos Clave
                </h2>
                <p className="text-xs text-[#7A7167]">
                  Añade y edita los hitos memorables de su vida (nacimiento, graduación, matrimonio, obra comunitaria).
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#FAF3E3] text-[#C29837] text-xs font-semibold border border-[#E8D7B0]">
                {timeline.length} / {currentPlan.limits.maxTimelineMilestones} Hitos
              </span>
            </div>

            {/* MODAL PARA EDITAR HITO EXISTENTE */}
            {editingMilestone && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white border-2 border-[#C29837] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1]">
                    <h4 className="font-semibold text-sm text-[#2D2926] uppercase tracking-wider flex items-center gap-1.5">
                      <Edit3 className="w-4 h-4 text-[#C29837]" />
                      <span>Editar Hito de Vida: {editingMilestone.title}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setEditingMilestone(null)}
                      className="p-1 text-[#8C847A] hover:text-[#2D2926] cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Año (Ej. 1974)"
                      value={editingMilestone.year}
                      onChange={(e) => setEditingMilestone({ ...editingMilestone, year: e.target.value })}
                      className="px-3 py-2 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926]"
                    />
                    <input
                      type="text"
                      placeholder="Título (Ej. Matrimonio con Mariana)"
                      value={editingMilestone.title}
                      onChange={(e) => setEditingMilestone({ ...editingMilestone, title: e.target.value })}
                      className="sm:col-span-2 px-3 py-2 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926]"
                    />
                  </div>

                  <textarea
                    rows={4}
                    placeholder="Descripción del momento trascendente..."
                    value={editingMilestone.description}
                    onChange={(e) => setEditingMilestone({ ...editingMilestone, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926] resize-none"
                  />

                  {/* Subida o edición de foto del hito según plan */}
                  {currentPlan.limits.allowsTimelinePhotos && (
                    <div className="pt-1">
                      <ImageUploader
                        label="Fotografía del Hito Histórico (Opcional)"
                        initialUrl={editingMilestone.photoUrl || ''}
                        onImageSelected={(url) => setEditingMilestone({ ...editingMilestone, photoUrl: url })}
                        helperText="Modifica o actualiza la foto de este momento con encuadre."
                        aspectRatio="wide"
                        cropShape="wide"
                      />
                    </div>
                  )}

                  <div className="pt-3 border-t border-[#F2ECE1] flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingMilestone(null)}
                      className="px-4 py-2 rounded-full text-xs font-semibold text-[#7A7167] hover:bg-[#F2ECE1] cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEditedMilestone}
                      className="flex items-center gap-1.5 px-6 py-2 rounded-full bg-[#8C6B32] hover:bg-[#785924] text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Guardar Cambios del Hito</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* FORMULARIO PARA AGREGAR NUEVO HITO */}
            <div className="p-4 sm:p-5 rounded-2xl border border-[#DFCDB8] bg-[#FAF7F2] space-y-3">
              <h4 className="text-xs font-semibold text-[#2D2926] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#C29837]" />
                <span>+ Agregar Nuevo Hito de Vida</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Año (Ej. 1974)"
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926]"
                />
                <input
                  type="text"
                  placeholder="Título (Ej. Nacimiento, Graduación, Matrimonio)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="sm:col-span-2 px-3 py-2 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926]"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Descripción del momento trascendente..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D8CABE] bg-white text-xs text-[#2D2926] resize-none"
              />

              {/* Subida de foto del hito según plan */}
              {currentPlan.limits.allowsTimelinePhotos ? (
                <div className="pt-1">
                  <ImageUploader
                    label="Fotografía del Hito Histórico (Opcional - niñez, graduación, matrimonio, viajes)"
                    initialUrl={newPhotoUrl}
                    onImageSelected={(url) => setNewPhotoUrl(url)}
                    helperText="Ilustra este capítulo memorable con una foto de la época."
                    aspectRatio="wide"
                  />
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-white border border-[#EAE4D8] text-[11px] text-[#7A7167] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#C29837] shrink-0" />
                  <span>
                    El Plan Esencial admite hasta 10 hitos en texto. Para incluir fotos históricas en cada momento (infancia, universidad, matrimonio), actualiza al Plan Homenaje Legado.
                  </span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddTimelineMilestone}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#8C6B32] hover:bg-[#785924] text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Hito</span>
                </button>
              </div>
            </div>

            {/* Listado de hitos existentes con opciones de Editar y Eliminar */}
            <div className="space-y-3">
              {timeline.map((m) => (
                <div key={m.id} className="p-4 rounded-xl border border-[#EAE4D8] bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-start justify-between gap-3 shadow-xs">
                  <div className="flex items-start gap-3">
                    {m.photoUrl ? (
                      <div className="w-16 h-14 rounded-lg overflow-hidden border border-[#D8CABE] shrink-0 bg-[#F2ECE1]">
                        <img src={m.photoUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#FAF3E3] border border-[#E8D7B0] flex items-center justify-center text-[#C29837] shrink-0 text-xs font-bold">
                        {m.year.slice(-2)}
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-xs text-[#C29837]">{m.year}</span>
                      <h5 className="font-semibold text-xs text-[#2D2926] mt-0.5">{m.title}</h5>
                      <p className="text-[11px] text-[#7A7167] mt-1 leading-relaxed">{m.description}</p>
                    </div>
                  </div>

                  {/* Acciones para cada hito: Editar y Eliminar */}
                  <div className="flex items-center gap-1.5 self-end sm:self-start">
                    <button
                      type="button"
                      onClick={() => setEditingMilestone(m)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF3E3] text-[#C29837] border border-[#E8D7B0] hover:bg-[#F3ECE0] text-xs font-semibold transition-colors cursor-pointer"
                      title="Editar este hito (año, título, descripción o foto)"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveTimelineMilestone(m.id)}
                      className="p-1.5 text-[#9E4232] hover:bg-[#FBEBE8] rounded-lg transition-colors cursor-pointer"
                      title="Eliminar hito"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#F2ECE1] flex justify-end">
              <button
                type="button"
                onClick={() => handleSaveGeneral()}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#8C6B32] hover:bg-[#785924] text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Guardando...' : 'Guardar Línea de Vida'}</span>
              </button>
            </div>
          </div>
        )}

        {/* PESTAÑA 6: BANDEJA DE MODERACIÓN FAMILIAR */}
        {activeTab === 'moderation' && (
          <div className="space-y-6">
            <div className="bg-[#FAF7F2] border border-[#DFCDB8] rounded-2xl p-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#758774] shrink-0 mt-0.5" />
                <div className="text-xs text-[#524B44]">
                  <p className="font-semibold text-[#2D2926] mb-0.5">
                    Resguardo Familiar Activo
                  </p>
                  <p>
                    Revisa las condolencias y fotografías de recuerdos compartidos antes de que se publiquen en el memorial.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold shrink-0 cursor-pointer">
                <span>Moderación:</span>
                <input
                  type="checkbox"
                  checked={moderationRequired}
                  onChange={(e) => setModerationRequired(e.target.checked)}
                  className="rounded text-[#C29837] focus:ring-[#C29837]"
                />
              </label>
            </div>

            {pendingTributes.length === 0 ? (
              <div className="text-center py-12 bg-white border border-[#EAE4D8] rounded-3xl p-8 max-w-md mx-auto">
                <Check className="w-8 h-8 text-[#758774] mx-auto mb-2 p-1.5 bg-[#EBF0EB] rounded-full" />
                <p className="font-memorial text-base text-[#2D2926] mb-1">
                  Todo está al día
                </p>
                <p className="text-xs text-[#7A7167]">
                  No hay mensajes ni fotos pendientes de aprobación.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingTributes.map((tribute) => (
                  <div
                    key={tribute.id}
                    className="bg-white border border-[#EAE4D8] rounded-2xl p-5 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-xs text-[#2D2926]">
                          {tribute.authorName}
                        </h4>
                        <span className="text-[10px] text-[#8C847A]">
                          {new Date(tribute.createdAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      {tribute.relationship && (
                        <p className="text-[10px] text-[#C29837] mb-2">{tribute.relationship}</p>
                      )}
                      <p className="text-xs text-[#4A4540] font-script bg-[#FAF7F2] p-3 rounded-xl border border-[#EDE5DA] mb-3">
                        &ldquo;{tribute.message}&rdquo;
                      </p>

                      {/* Fotografía adjunta para moderar */}
                      {tribute.photoUrl && (
                        <div className="mb-4">
                          <p className="text-[10px] font-medium text-[#C29837] mb-1 flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            <span>Fotografía del recuerdo adjunta:</span>
                          </p>
                          <div
                            onClick={() => setPreviewTributePhoto(tribute.photoUrl!)}
                            className="relative rounded-xl overflow-hidden border border-[#D8CABE] max-w-xs cursor-pointer group"
                            title="Clic para ver en tamaño completo"
                          >
                            <img
                              src={tribute.photoUrl}
                              alt="Recuerdo con el ser querido"
                              className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ver foto completa</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F5EFE6]">
                      <button
                        onClick={() => handleRejectTribute(tribute.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-[#9E4232] hover:bg-[#FBEBE8] border border-[#ECD1CC] cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Rechazar</span>
                      </button>
                      <button
                        onClick={() => handleApproveTribute(tribute.id)}
                        className="flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-medium bg-[#8C6B32] hover:bg-[#785924] text-white transition-colors cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Aprobar y Publicar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal de Vista Previa de Fotografía para Moderación */}
        {previewTributePhoto && (
          <div
            onClick={() => setPreviewTributePhoto(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-white border-2 border-[#C29837] rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 px-6 border-b border-[#F2ECE1]">
                <span className="text-xs font-semibold text-[#8C6B32]">
                  Inspección de Fotografía para Aprobación
                </span>
                <button
                  onClick={() => setPreviewTributePhoto(null)}
                  className="p-1.5 rounded-full text-[#8C847A] hover:text-[#2D2926] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 bg-[#FAF8F5] flex items-center justify-center max-h-[75vh]">
                <img
                  src={previewTributePhoto}
                  alt="Vista previa"
                  className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl border border-[#EAE4D8]"
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
