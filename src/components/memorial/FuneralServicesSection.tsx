'use client';

import React from 'react';
import { FuneralService, ServiceType } from '../../types/memorial';
import { Calendar, Clock, MapPin, Church, ExternalLink, Video } from 'lucide-react';

interface Props {
  services: FuneralService[];
}

export const FuneralServicesSection = ({ services }: Props) => {
  if (!services || services.length === 0) return null;

  const getServiceBadge = (type: ServiceType) => {
    switch (type) {
      case 'velatorio':
        return { label: 'Velatorio y Capilla Ardiente', color: 'bg-[#F2ECE1] text-[#63574A] border-[#DFD3C3]' };
      case 'misa_cuerpo_presente':
        return { label: 'Misa de Cuerpo Presente', color: 'bg-[#EBF0EB] text-[#4A634E] border-[#CDE0CE]' };
      case 'sepelio':
        return { label: 'Sepelio y Descanso Eterno', color: 'bg-[#F0EBEE] text-[#634A59] border-[#DFCFD9]' };
      case 'cremacion':
        return { label: 'Ceremonia de Cremación', color: 'bg-[#F5EFE6] text-[#7A5B36] border-[#E8DAC6]' };
      default:
        return { label: 'Ceremonia de Homenaje', color: 'bg-[#F2ECE1] text-[#63574A] border-[#DFD3C3]' };
    }
  };

  const downloadCalendarEvent = (service: FuneralService) => {
    const title = encodeURIComponent(service.title);
    const details = encodeURIComponent(service.notes || 'Ceremonia conmemorativa');
    const location = encodeURIComponent(`${service.locationName}, ${service.address}`);
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <section className="my-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#9E9488] mb-2">
          <Church className="w-3.5 h-3.5 text-[#C29837]" />
          <span>Servicios y Ceremonias</span>
        </div>
        <h2 className="font-memorial text-2xl sm:text-3xl text-[#2D2926]">
          Acompañamiento y Despedida
        </h2>
        <p className="text-xs sm:text-sm text-[#736B63] max-w-md mx-auto mt-1">
          Información para acompañar a la familia en las ceremonias religiosas y homenajes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const badge = getServiceBadge(service.serviceType);
          return (
            <div
              key={service.id}
              className="bg-[#FFFFFF] border border-[#EAE4D8] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Foto opcional del lugar (Capilla, Templo o Pabellón) */}
                {service.photoUrl && (
                  <div className="h-36 w-full relative overflow-hidden bg-[#F2ECE1] border-b border-[#EAE4D8]">
                    <img
                      src={service.photoUrl}
                      alt={service.locationName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
                )}

                <div className="p-6 pb-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-[11px] font-medium border mb-3 ${badge.color}`}
                  >
                    {badge.label}
                  </span>

                  <h3 className="font-memorial text-lg font-semibold text-[#2D2926] mb-3 leading-snug">
                    {service.title}
                  </h3>

                  <div className="space-y-2.5 text-xs text-[#5C554D] mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#C29837] shrink-0" />
                      <span className="font-medium text-[#2D2926]">{service.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#C29837] shrink-0" />
                      <span>{service.time}</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#C29837] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-[#2D2926]">{service.locationName}</p>
                        <p className="text-[#80776D] text-[11px]">{service.address}</p>
                      </div>
                    </div>
                  </div>

                  {service.notes && (
                    <p className="text-[11px] text-[#7A7167] italic bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EDE5DA] mb-4">
                      {service.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 px-6 border-t border-[#F2ECE1] flex items-center justify-between gap-2">
                {service.googleMapsUrl && (
                  <a
                    href={service.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#C29837] hover:underline transition-colors"
                  >
                    <span>Ver en Mapa</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                {service.livestreamUrl && (
                  <a
                    href={service.livestreamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#8A5B36] hover:underline"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Transmisión</span>
                  </a>
                )}

                <button
                  onClick={() => downloadCalendarEvent(service)}
                  className="text-xs text-[#7A7167] hover:text-[#2D2926] underline ml-auto cursor-pointer"
                >
                  Agendar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
