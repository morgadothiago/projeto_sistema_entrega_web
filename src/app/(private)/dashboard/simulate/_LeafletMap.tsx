"use client"

import dynamic from "next/dynamic"
import "leaflet/dist/leaflet.css"
import React from "react"
import { useMap } from "react-leaflet"
import type L from "leaflet"

export interface LeafletMapProps {
  route: [number, number][]
  addressOrigem: {
    latitude: number
    longitude: number
  }
  clientAddress: {
    latitude: number
    longitude: number
  }
  deliveryPosition?: {
    latitude: number
    longitude: number
  }
}

// Dynamically import react-leaflet components
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
)
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
})

// Ajusta o mapa para os limites da rota
function FitBounds({ route }: { route: [number, number][] }) {
  const map = useMap()
  React.useEffect(() => {
    if (route.length > 1) {
      map.fitBounds(route)
    } else if (route.length === 1) {
      map.setView(route[0], 15)
    }
  }, [map, route])
  return null
}

export default function LeafletMap({ route, deliveryPosition }: LeafletMapProps) {
  const [icons, setIcons] = React.useState<{ start: L.Icon; end: L.Icon; delivery: L.Icon } | null>(null)
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
    
    const loadIcons = async () => {
      if (typeof window === 'undefined') return
      
      const L = (await import("leaflet")).default

      const startIcon = L.icon({
        iconUrl: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#3b82f6" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="white" stroke-width="2"/>
          </svg>
        `),
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const endIcon = L.icon({
        iconUrl: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#ef4444" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#ef4444" stroke="white" stroke-width="2"/>
          </svg>
        `),
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const deliveryIcon = L.icon({
        iconUrl: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="8" width="12" height="8" rx="1" fill="#10b981" stroke="white" stroke-width="1.5"/>
            <path d="M14 10h4l2 2v4h-2" stroke="white" stroke-width="1.5" fill="#10b981"/>
            <circle cx="7" cy="17" r="1.5" fill="white" stroke="#10b981" stroke-width="1"/>
            <circle cx="17" cy="17" r="1.5" fill="white" stroke="#10b981" stroke-width="1"/>
            <path d="M14 10v6" stroke="white" stroke-width="1.5"/>
          </svg>
        `),
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      setIcons({ start: startIcon, end: endIcon, delivery: deliveryIcon })
    }

    loadIcons()
  }, [])

  if (!isClient || !route || route.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500">
        {!isClient ? "Carregando mapa..." : "Rota não disponível"}
      </div>
    )
  }

  const center = route[0]

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds route={route} />
      
      {route.length > 1 && (
        <Polyline 
          positions={route} 
          color="#3b82f6" 
          weight={4}
          opacity={0.8}
        />
      )}

      {icons && (
        <>
          <Marker position={route[0]} icon={icons.start}>
            <Popup>Origem</Popup>
          </Marker>

          {route.length > 1 && (
            <Marker position={route[route.length - 1]} icon={icons.end}>
              <Popup>Destino</Popup>
            </Marker>
          )}

          {deliveryPosition && (
            <Marker
              position={[deliveryPosition.latitude, deliveryPosition.longitude]}
              icon={icons.delivery}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-semibold text-green-600">Entregador</p>
                  <p className="text-xs text-gray-600">Posição atual</p>
                </div>
              </Popup>
            </Marker>
          )}
        </>
      )}
    </MapContainer>
  )
}
