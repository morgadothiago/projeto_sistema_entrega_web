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

export default function LeafletMap({ route }: LeafletMapProps) {
  const [icons, setIcons] = React.useState<{ start: L.Icon; end: L.Icon } | null>(null)
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

      setIcons({ start: startIcon, end: endIcon })
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
        </>
      )}
    </MapContainer>
  )
}
