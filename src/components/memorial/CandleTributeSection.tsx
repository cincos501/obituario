'use client';

import React, { useState } from 'react';
import { Tribute, TributeType } from '../../types/memorial';
import { ImageUploader } from '../common/ImageUploader';
import { Flame, Flower2, Heart, Sparkles, ShieldCheck, Camera, X } from 'lucide-react';

interface Props {
  obituaryId: string;
  tributes: Tribute[];
  onTributeAdded: (newTribute: Tribute) => void;
  isOpenModalDirectly?: 'candle' | 'flower' | null;
  onCloseDirectModal?: () => void;
  allowsPhotos?: boolean;
  maxCandlesAndFlowers?: number;
}

export const CandleTributeSection = ({
  obituaryId,
  tributes,
  onTributeAdded,
  isOpenModalDirectly,
  onCloseDirectModal,
  allowsPhotos = true,
  maxCandlesAndFlowers = 40,
}: Props) => {
  const [activeTab, setActiveTab] = useState<'all' | 'candles' | 'flowers'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TributeType>('candle');
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<{ url: string; author: string } | null>(null);

  // Form State
  const [authorName, setAuthorName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [message, setMessage] = useState('');
  const [candleColor, setCandleColor] = useState('warm-gold');
  const [flowerType, setFlowerType] = useState('rosa-blanca');
  const [tributePhotoUrl, setTributePhotoUrl] = useState<string>('');
  const [showPhotoInput, setShowPhotoInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [quotaNotice, setQuotaNotice] = useState<string | null>(null);

  // Filtrar solo tributos aprobados para la vista pública
  const publicTributes = tributes.filter((t) => t.isApproved || t.moderationStatus === 'approved');
  const isQuotaReached = publicTributes.length >= maxCandlesAndFlowers;

  // Abrir modal si viene solicitado desde el header
  React.useEffect(() => {
    if (isOpenModalDirectly) {
      if (isQuotaReached) {
        setQuotaNotice(`Este memorial ha alcanzado la capacidad de ${maxCandlesAndFlowers} ofrendas de este plan.`);
      } else {
        setModalType(isOpenModalDirectly);
        setIsModalOpen(true);
      }
    }
  }, [isOpenModalDirectly, isQuotaReached, maxCandlesAndFlowers]);

  const handleOpenModal = (type: TributeType) => {
    if (isQuotaReached) {
      setQuotaNotice(`Se ha alcanzado el límite máximo de ${maxCandlesAndFlowers} ofrendas de velas y flores para este memorial.`);
      return;
    }
    setModalType(type);
    setIsModalOpen(true);
    setFeedbackNotice(null);
    setQuotaNotice(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFeedbackNotice(null);
    setTributePhotoUrl('');
    setShowPhotoInput(false);
    if (onCloseDirectModal) onCloseDirectModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      const { memorialService } = await import('../../services/memorialService');
      const { tribute, messageStatusNotice } = await memorialService.addTribute({
        obituaryId,
        authorName: authorName.trim(),
        relationship: relationship.trim() || 'Familiar o Amigo',
        message: message.trim(),
        tributeType: modalType,
        candleColor: modalType === 'candle' ? candleColor : undefined,
        flowerType: modalType === 'flower' ? flowerType : undefined,
        photoUrl: tributePhotoUrl.trim() || undefined,
      });

      if (tribute.isApproved) {
        onTributeAdded(tribute);
      }

      setFeedbackNotice(messageStatusNotice);
      setAuthorName('');
      setRelationship('');
      setMessage('');
      setTributePhotoUrl('');
      setShowPhotoInput(false);
    } catch (err) {
      console.error('Error al enviar tributo:', err);
      alert('Hubo un inconveniente al registrar tu condolencia. Inténtalo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTributes = publicTributes.filter((t) => {
    if (activeTab === 'candles') return t.tributeType === 'candle';
    if (activeTab === 'flowers') return t.tributeType === 'flower';
    return true;
  });

  return (
    <section className="my-16">
      {/* Encabezado de la sección */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#9E9488] mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#C29837]" />
          <span>Libro de Recuerdos y Luz</span>
        </div>
        <h2 className="font-memorial text-2xl sm:text-4xl text-[#2D2926]">
          Velas y Mensajes de Afecto
        </h2>
        <p className="text-xs sm:text-sm text-[#736B63] max-w-lg mx-auto mt-2">
          Enciende una vela virtual, envía una flor o comparte una fotografía entrañable de su vida juntos.
        </p>

        {/* Garantía de respeto y moderación y contador de ofrendas */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3ECE0] text-[#7A6126] text-[11px] font-medium border border-[#E0D3C1]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#758774]" />
            <span>Espacio protegido y moderado con respeto familiar</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] text-[#6E665D] text-[11px] font-medium border border-[#EAE4D8]">
            <Flame className="w-3 h-3 text-[#C29837]" />
            <span>{publicTributes.length} de {maxCandlesAndFlowers} ofrendas realizadas</span>
          </div>
        </div>

        {quotaNotice && (
          <div className="mt-4 max-w-md mx-auto p-3 rounded-xl bg-[#FFF9ED] border border-[#F3DFC0] text-[#8C6415] text-xs leading-relaxed animate-in fade-in">
            {quotaNotice}
          </div>
        )}

        {/* Botones de acción central */}
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            onClick={() => handleOpenModal('candle')}
            disabled={isQuotaReached}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-md transition-all ${
              isQuotaReached
                ? 'bg-[#EAE4D8] text-[#A69D92] cursor-not-allowed'
                : 'bg-[#8C6B32] hover:bg-[#785924] text-white cursor-pointer'
            }`}
          >
            <Flame className={`w-4 h-4 ${isQuotaReached ? 'text-[#A69D92]' : 'text-[#F5C354] animate-flame'}`} />
            <span>{isQuotaReached ? 'Límite de Velas Alcanzado' : 'Encender Vela'}</span>
          </button>
          <button
            onClick={() => handleOpenModal('flower')}
            disabled={isQuotaReached}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-xs transition-colors ${
              isQuotaReached
                ? 'bg-[#F2ECE1] text-[#A69D92] border border-[#E0D8CB] cursor-not-allowed'
                : 'bg-white text-[#4A4540] border border-[#DFCDB8] hover:bg-[#F3ECE0] cursor-pointer'
            }`}
          >
            <Flower2 className={`w-4 h-4 ${isQuotaReached ? 'text-[#A69D92]' : 'text-[#758774]'}`} />
            <span>{isQuotaReached ? 'Límite de Flores Alcanzado' : 'Ofrendar Flor'}</span>
          </button>
        </div>
      </div>

      {/* Pestañas de filtrado */}
      <div className="flex justify-center gap-2 mb-8">
        {(['all', 'candles', 'flowers'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-[#EAE2D5] text-[#2D2926] shadow-inner'
                : 'text-[#857B72] hover:bg-[#F3ECE0]'
            }`}
          >
            {tab === 'all' && `Todos (${publicTributes.length})`}
            {tab === 'candles' && `Velas (${publicTributes.filter((t) => t.tributeType === 'candle').length})`}
            {tab === 'flowers' && `Flores (${publicTributes.filter((t) => t.tributeType === 'flower').length})`}
          </button>
        ))}
      </div>

      {/* Muro de tributos */}
      {filteredTributes.length === 0 ? (
        <div className="text-center py-12 px-4 bg-[#FAF7F2] border border-[#ECE5DC] rounded-2xl max-w-xl mx-auto">
          <Flame className="w-8 h-8 text-[#C29837] mx-auto mb-2 opacity-60" />
          <p className="font-memorial text-base text-[#4F4943]">
            Sé la primera persona en encender una luz o dejar un mensaje de cariño.
          </p>
          <button
            onClick={() => handleOpenModal('candle')}
            className="mt-4 text-xs font-medium text-[#C29837] underline cursor-pointer"
          >
            Encender la primera vela
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTributes.map((tribute) => (
            <div
              key={tribute.id}
              className="bg-[#FFFFFF] border border-[#EAE4D8] rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {tribute.tributeType === 'candle' ? (
                      <div className="w-8 h-8 rounded-full bg-[#FAF3E3] border border-[#E8D7B0] flex items-center justify-center text-[#E5A93C]">
                        <Flame className="w-4 h-4 animate-flame" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#F0F5F0] border border-[#D1E0D1] flex items-center justify-center text-[#758774]">
                        <Flower2 className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-[#2D2926]">
                        {tribute.authorName}
                      </h4>
                      {tribute.relationship && (
                        <p className="text-[10px] text-[#8C847A]">{tribute.relationship}</p>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#544D46] font-script leading-relaxed mb-3">
                  &ldquo;{tribute.message}&rdquo;
                </p>

                {/* Fotografía del recuerdo adjunta con clic para ampliar */}
                {tribute.photoUrl && (
                  <div
                    onClick={() => setSelectedPhotoPreview({ url: tribute.photoUrl!, author: tribute.authorName })}
                    className="rounded-xl overflow-hidden border border-[#EAE4D8] mb-3 shadow-xs cursor-pointer group relative"
                    title="Clic para ver en tamaño completo"
                  >
                    <img
                      src={tribute.photoUrl}
                      alt="Recuerdo con el ser amado"
                      className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-medium backdrop-blur-[1px]">
                      <span>Ver foto completa</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#F5EFE6] flex items-center justify-between text-[10px] text-[#A69D92]">
                <span>
                  {new Date(tribute.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1 text-[#C29837]">
                  <Heart className="w-3 h-3 fill-[#C29837]" />
                  <span>En su memoria</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para Encender Vela o Dejar Flor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border-2 border-[#C29837] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center bg-[#FAF3E3] border border-[#E8D7B0]">
                {modalType === 'candle' ? (
                  <Flame className="w-6 h-6 text-[#E5A93C] animate-flame" />
                ) : (
                  <Flower2 className="w-6 h-6 text-[#758774]" />
                )}
              </div>
              <h3 className="font-memorial text-2xl text-[#2D2926]">
                {modalType === 'candle' ? 'Encender una Vela Virtual' : 'Ofrendar Flores de Paz'}
              </h3>
              <p className="text-xs text-[#736B63] mt-1">
                Tu homenaje quedará encendido en el memorial como recuerdo imborrable.
              </p>
            </div>

            {feedbackNotice ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#EBF0EB] text-[#4A634E] flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <p className="text-sm text-[#4A4540] font-sans leading-relaxed px-4">
                  {feedbackNotice}
                </p>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 rounded-full bg-[#8C6B32] hover:bg-[#785924] text-white text-xs font-semibold cursor-pointer shadow-sm"
                >
                  Entendido
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#544D46] mb-1">
                    Tu Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-xs sm:text-sm text-[#2D2926] focus:outline-none focus:ring-2 focus:ring-[#C29837]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#544D46] mb-1">
                    Parentesco o Relación
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Hijo, Amigo de juventud, Compañero de trabajo"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-xs sm:text-sm text-[#2D2926] focus:outline-none focus:ring-2 focus:ring-[#C29837]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#544D46] mb-1">
                    Tu Mensaje de Condolencia o Recuerdo *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Escribe una breve memoria, oración o mensaje reconfortante para la familia..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-xs sm:text-sm text-[#2D2926] focus:outline-none focus:ring-2 focus:ring-[#C29837]/40 resize-none font-script"
                  />
                </div>

                {/* Adjuntar foto según permiso del plan */}
                {allowsPhotos ? (
                  <div>
                    {!showPhotoInput ? (
                      <button
                        type="button"
                        onClick={() => setShowPhotoInput(true)}
                        className="inline-flex items-center gap-1.5 text-xs text-[#8C6B32] font-semibold hover:underline cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#C29837]" />
                        <span>+ Adjuntar una fotografía del recuerdo juntos (Opcional)</span>
                      </button>
                    ) : (
                      <div className="space-y-2 pt-1">
                        <ImageUploader
                          label="Fotografía del Recuerdo con el Difunto (Opcional)"
                          initialUrl={tributePhotoUrl}
                          onImageSelected={(url) => setTributePhotoUrl(url)}
                          helperText="Sube una foto de momentos felices compartidos."
                          aspectRatio="wide"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE4D8] text-[11px] text-[#7A7167] flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#C29837] shrink-0" />
                    <span>Velas solemnes y mensajes de texto activados.</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F2ECE1]">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-[#736B63] hover:bg-[#EFE8DC] transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-full bg-[#8C6B32] hover:bg-[#785924] text-white text-xs font-semibold transition-all shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? 'Enviando con respeto...' : 'Publicar Homenaje'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Lightbox / Modal de Fotografía de Recuerdo Ampliada */}
      {selectedPhotoPreview && (
        <div
          onClick={() => setSelectedPhotoPreview(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-white border-2 border-[#C29837] rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 px-6 border-b border-[#F2ECE1]">
              <span className="text-xs font-semibold text-[#8C6B32]">
                Recuerdo compartido por {selectedPhotoPreview.author}
              </span>
              <button
                onClick={() => setSelectedPhotoPreview(null)}
                className="p-1.5 rounded-full text-[#8C847A] hover:text-[#2D2926] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-[#FAF8F5] flex items-center justify-center max-h-[75vh]">
              <img
                src={selectedPhotoPreview.url}
                alt="Recuerdo ampliado"
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl border border-[#EAE4D8]"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
