'use client';

import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface Props {
  lat?: number;
  lng?: number;
  locationName: string;
  address: string;
  zoom?: number;
  editable?: boolean;
  onCoordinatesChange?: (newLat: number, newLng: number) => void;
}

export const InteractiveMap = ({
  lat = -16.5000,
  lng = -68.1500,
  locationName,
  address,
  zoom = 15,
  editable = false,
  onCoordinatesChange,
}: Props) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      // Importar leaflet dinámicamente solo en cliente
      const L = (await import('leaflet')).default;

      // Cargar CSS de Leaflet si no está presente
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!isMounted || !mapContainerRef.current) return;

      // Si ya existía un mapa, limpiarlo
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Crear instancia de mapa con OpenStreetMap (100% Gratuito y sin API Key)
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: zoom,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Icono personalizado solemne
      const customIcon = L.divIcon({
        className: 'custom-memorial-marker',
        html: `<div style="background-color: #2D2926; color: #E5B84A; border: 2px solid #C29837; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34],
      });

      const marker = L.marker([lat, lng], { 
        icon: customIcon,
        draggable: !!editable,
      }).addTo(map);

      marker.bindPopup(`<b>${locationName}</b><br><small>${address}</small>`).openPopup();
      markerRef.current = marker;

      // Eventos de interactividad si es editable
      if (editable) {
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          const newLat = Number(pos.lat.toFixed(6));
          const newLng = Number(pos.lng.toFixed(6));
          marker.bindPopup(`<b>${locationName}</b><br><small>Coordenadas: ${newLat}, ${newLng}</small>`).openPopup();
          if (onCoordinatesChange) onCoordinatesChange(newLat, newLng);
        });

        map.on('click', (e: any) => {
          const newLat = Number(e.latlng.lat.toFixed(6));
          const newLng = Number(e.latlng.lng.toFixed(6));
          marker.setLatLng([newLat, newLng]);
          marker.bindPopup(`<b>${locationName}</b><br><small>Marcador fijado: ${newLat}, ${newLng}</small>`).openPopup();
          if (onCoordinatesChange) onCoordinatesChange(newLat, newLng);
        });
      }

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, locationName, address, zoom, editable]);

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-[#EAE4D8] dark:border-[#282E39] shadow-xs">
      <div className="bg-[#FAF7F2] dark:bg-[#15181E] px-4 py-2 border-b border-[#EAE4D8] dark:border-[#282E39] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
        <span className="font-semibold text-[#2D2926] dark:text-[#EAE6DF] flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#C29837]" />
          <span>Ubicación de la Ceremonia (OpenStreetMap)</span>
        </span>
        <span className="text-[10px] text-[#7A7167] dark:text-[#8C847A]">
          {editable ? '📍 Haz clic en el mapa o arrastra el marcador para fijar la ubicación' : 'Mapa interactivo'}
        </span>
      </div>
      <div ref={mapContainerRef} className="h-56 w-full z-10" />
    </div>
  );
};
