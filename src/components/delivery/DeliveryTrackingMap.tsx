'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useDeliveryTracking, LocationUpdate } from '@/hooks/useDeliveryTracking';

// Importação dinâmica do mapa para evitar erros SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

interface DeliveryTrackingMapProps {
  deliveryCode: string;
  token: string;
  originAddress?: {
    latitude: number;
    longitude: number;
    street: string;
    number: string;
    city: string;
  };
  clientAddress?: {
    latitude: number;
    longitude: number;
    street: string;
    number: string;
    city: string;
  };
  className?: string;
}

export function DeliveryTrackingMap({
  deliveryCode,
  token,
  originAddress,
  clientAddress,
  className,
}: DeliveryTrackingMapProps) {
  const [routePoints, setRoutePoints] = useState<LocationUpdate[]>([]);
  const [L, setL] = useState<any>(null);
  const mapRef = useRef<any>(null);

  // Carrega Leaflet apenas no cliente
  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet.default);

      // Fix para ícones do Leaflet no Next.js
      delete (leaflet.default.Icon.Default.prototype as any)._getIconUrl;
      leaflet.default.Icon.Default.mergeOptions({
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        iconUrl: '/leaflet/marker-icon.png',
        shadowUrl: '/leaflet/marker-shadow.png',
      });
    });
  }, []);

  // Hook de rastreamento WebSocket
  const { isConnected, error, lastLocation } = useDeliveryTracking({
    deliveryCode,
    token,
    enabled: true,
    onLocationUpdate: (location) => {
      setRoutePoints((prev) => [...prev, location]);

      // Centraliza mapa na última localização
      if (mapRef.current) {
        mapRef.current.setView([location.latitude, location.longitude], 15);
      }
    },
  });

  // Centro padrão do mapa
  const defaultCenter = originAddress
    ? [originAddress.latitude, originAddress.longitude]
    : [-23.550520, -46.633308]; // São Paulo como fallback

  if (!L) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-100 rounded-lg ${className}`}>
        <p className="text-gray-500">Carregando mapa...</p>
      </div>
    );
  }

  // Cria ícones customizados
  const deliverymanIcon = new L.Icon({
    iconUrl: '/icons/deliveryman-marker.png',
    iconRetinaUrl: '/icons/deliveryman-marker.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    shadowUrl: '/leaflet/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [12, 41],
  });

  const originIcon = new L.Icon({
    iconUrl: '/icons/store-marker.png',
    iconRetinaUrl: '/icons/store-marker.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const clientIcon = new L.Icon({
    iconUrl: '/icons/client-marker.png',
    iconRetinaUrl: '/icons/client-marker.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  return (
    <div className={`relative ${className}`}>
      {/* Status do rastreamento */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg px-4 py-3 min-w-[250px]">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span className="text-sm font-semibold">
            {isConnected ? 'Rastreando GPS' : 'Desconectado'}
          </span>
        </div>

        {/* Debug info */}
        <div className="text-xs text-gray-600 space-y-1 border-t pt-2 mt-2">
          <div>Código: <span className="font-mono">{deliveryCode}</span></div>
          <div>Última localização: {lastLocation ? '✅ Recebida' : '⏳ Aguardando...'}</div>
          <div>Pontos rastreados: <span className="font-semibold">{routePoints.length}</span></div>
          {lastLocation && (
            <div className="text-green-600 font-semibold">
              📍 Lat: {lastLocation.latitude.toFixed(6)}, Lon: {lastLocation.longitude.toFixed(6)}
            </div>
          )}
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="absolute top-16 right-4 z-[1000] bg-red-50 border border-red-200 rounded-lg shadow-lg px-4 py-2">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Mapa */}
      <MapContainer
        center={defaultCenter as [number, number]}
        zoom={13}
        className="h-full w-full rounded-lg"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marcador de origem (loja) */}
        {originAddress && (
          <Marker
            position={[originAddress.latitude, originAddress.longitude]}
            icon={originIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong>Origem</strong>
                <br />
                {originAddress.street}, {originAddress.number}
                <br />
                {originAddress.city}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcador de destino (cliente) */}
        {clientAddress && (
          <Marker
            position={[clientAddress.latitude, clientAddress.longitude]}
            icon={clientIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong>Destino</strong>
                <br />
                {clientAddress.street}, {clientAddress.number}
                <br />
                {clientAddress.city}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcador de posição atual do entregador */}
        {lastLocation && (
          <Marker
            position={[lastLocation.latitude, lastLocation.longitude]}
            icon={deliverymanIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong>Entregador</strong>
                <br />
                Última atualização: {new Date().toLocaleTimeString()}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Linha da rota percorrida */}
        {routePoints.length > 1 && (
          <Polyline
            positions={routePoints.map((p) => [p.latitude, p.longitude])}
            color="#3b82f6"
            weight={4}
            opacity={0.7}
          />
        )}
      </MapContainer>

      {/* Informações da rota */}
      {routePoints.length > 0 && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg px-4 py-2">
          <p className="text-sm font-medium text-gray-700">
            {routePoints.length} pontos rastreados
          </p>
        </div>
      )}
    </div>
  );
}
