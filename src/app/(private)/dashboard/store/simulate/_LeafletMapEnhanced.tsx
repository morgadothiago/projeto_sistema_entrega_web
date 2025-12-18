"use client"

import dynamic from "next/dynamic"
import "leaflet/dist/leaflet.css"
import React, { useState, useEffect, useCallback } from "react"
import { useMap } from "react-leaflet"
import type L from "leaflet"
import { Maximize2, Navigation, Layers, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  showDistance?: boolean
  showETA?: boolean
}

// Enhanced icon definitions with better visuals
let cachedIcons: {
  start: L.Icon
  end: L.Icon
  delivery: L.Icon
  deliveryMoving: L.Icon
} | null = null

const createEnhancedIcons = async () => {
  if (cachedIcons) return cachedIcons

  if (typeof window === "undefined") return null

  const L = (await import("leaflet")).default

  cachedIcons = {
    start: L.icon({
      iconUrl:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#shadow)">
            <path d="M20 0C12.268 0 6 6.268 6 14C6 24 20 50 20 50C20 50 34 24 34 14C34 6.268 27.732 0 20 0Z" fill="#3b82f6"/>
            <circle cx="20" cy="14" r="6" fill="white"/>
            <path d="M20 10L19 14H21L20 18V14" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round"/>
          </g>
          <defs>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
            </filter>
          </defs>
        </svg>
      `),
      iconSize: [40, 50],
      iconAnchor: [20, 50],
      popupAnchor: [0, -50],
    }),
    end: L.icon({
      iconUrl:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#shadow)">
            <path d="M20 0C12.268 0 6 6.268 6 14C6 24 20 50 20 50C20 50 34 24 34 14C34 6.268 27.732 0 20 0Z" fill="#ef4444"/>
            <circle cx="20" cy="14" r="6" fill="white"/>
            <path d="M17 14L19 16L23 12" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
          <defs>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
            </filter>
          </defs>
        </svg>
      `),
      iconSize: [40, 50],
      iconAnchor: [20, 50],
      popupAnchor: [0, -50],
    }),
    delivery: L.icon({
      iconUrl:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#shadow)">
            <circle cx="24" cy="24" r="20" fill="#10b981" opacity="0.2"/>
            <circle cx="24" cy="24" r="16" fill="#10b981"/>
            <path d="M14 20h12v8H14v-8z" fill="white"/>
            <path d="M26 22h4l2 2v4h-2" stroke="white" stroke-width="1.5" fill="none"/>
            <circle cx="18" cy="30" r="2" fill="white"/>
            <circle cx="30" cy="30" r="2" fill="white"/>
            <path d="M26 22v8" stroke="white" stroke-width="1.5"/>
          </g>
          <defs>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.4"/>
            </filter>
          </defs>
        </svg>
      `),
      iconSize: [48, 48],
      iconAnchor: [24, 24],
      popupAnchor: [0, -24],
      className: "delivery-marker-pulse",
    }),
    deliveryMoving: L.icon({
      iconUrl:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#shadow)">
            <circle cx="24" cy="24" r="20" fill="#10b981" opacity="0.3">
              <animate attributeName="r" values="20;24;20" dur="1.5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.3;0.1;0.3" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="24" cy="24" r="16" fill="#10b981"/>
            <path d="M14 20h12v8H14v-8z" fill="white"/>
            <path d="M26 22h4l2 2v4h-2" stroke="white" stroke-width="1.5" fill="none"/>
            <circle cx="18" cy="30" r="2" fill="white"/>
            <circle cx="30" cy="30" r="2" fill="white"/>
            <path d="M26 22v8" stroke="white" stroke-width="1.5"/>
          </g>
          <defs>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.4"/>
            </filter>
          </defs>
        </svg>
      `),
      iconSize: [48, 48],
      iconAnchor: [24, 24],
      popupAnchor: [0, -24],
    }),
  }

  return cachedIcons
}

// Optimized dynamic imports
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })
const Circle = dynamic(() => import("react-leaflet").then((mod) => mod.Circle), { ssr: false })

// Map controls component
const MapControls = React.memo(
  ({
    onZoomIn,
    onZoomOut,
    onCenter,
    onToggleFullscreen,
    onChangeLayer,
    currentLayer,
  }: {
    onZoomIn: () => void
    onZoomOut: () => void
    onCenter: () => void
    onToggleFullscreen: () => void
    onChangeLayer: (layer: string) => void
    currentLayer: string
  }) => {
    return (
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <Button
          size="icon"
          variant="secondary"
          className="bg-white hover:bg-gray-100 shadow-lg"
          onClick={onToggleFullscreen}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant="secondary"
          className="bg-white hover:bg-gray-100 shadow-lg"
          onClick={onCenter}
        >
          <Navigation className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="secondary" className="bg-white hover:bg-gray-100 shadow-lg">
              <Layers className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onChangeLayer("streets")}>
              <span className={currentLayer === "streets" ? "font-semibold" : ""}>Mapa de Ruas</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeLayer("satellite")}>
              <span className={currentLayer === "satellite" ? "font-semibold" : ""}>Satélite</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeLayer("dark")}>
              <span className={currentLayer === "dark" ? "font-semibold" : ""}>Modo Escuro</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex flex-col gap-1">
          <Button
            size="icon"
            variant="secondary"
            className="bg-white hover:bg-gray-100 shadow-lg h-8 w-8"
            onClick={onZoomIn}
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="bg-white hover:bg-gray-100 shadow-lg h-8 w-8"
            onClick={onZoomOut}
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }
)
MapControls.displayName = "MapControls"

// FitBounds component
const FitBounds = React.memo(({ route }: { route: [number, number][] }) => {
  const map = useMap()

  React.useEffect(() => {
    if (route.length > 1) {
      map.fitBounds(route, { padding: [50, 50] })
    } else if (route.length === 1) {
      map.setView(route[0], 15)
    }
  }, [map, route])

  return null
})
FitBounds.displayName = "FitBounds"

// Map event handlers
const MapEventHandlers = React.memo(
  ({
    onZoomIn,
    onZoomOut,
    onCenter,
    route,
  }: {
    onZoomIn: (fn: () => void) => void
    onZoomOut: (fn: () => void) => void
    onCenter: (fn: () => void) => void
    route: [number, number][]
  }) => {
    const map = useMap()

    useEffect(() => {
      onZoomIn(() => map.zoomIn())
      onZoomOut(() => map.zoomOut())
      onCenter(() => {
        if (route.length > 1) {
          map.fitBounds(route, { padding: [50, 50] })
        } else if (route.length === 1) {
          map.setView(route[0], 15)
        }
      })
    }, [map, onZoomIn, onZoomOut, onCenter, route])

    return null
  }
)
MapEventHandlers.displayName = "MapEventHandlers"

// Calculate distance helper
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Internal map component
const MapContent = React.memo(
  ({
    route,
    icons,
    deliveryPosition,
    showDistance,
    showETA,
    tileLayer,
  }: {
    route: [number, number][]
    icons: {
      start: L.Icon
      end: L.Icon
      delivery: L.Icon
      deliveryMoving: L.Icon
    }
    deliveryPosition?: { latitude: number; longitude: number }
    showDistance?: boolean
    showETA?: boolean
    tileLayer: string
  }) => {
    const center = route[0]
    const [zoomInFn, setZoomInFn] = useState<() => void>(() => () => {})
    const [zoomOutFn, setZoomOutFn] = useState<() => void>(() => () => {})
    const [centerFn, setCenterFn] = useState<() => void>(() => () => {})
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [currentLayer, setCurrentLayer] = useState(tileLayer)

    const totalDistance = React.useMemo(() => {
      if (route.length < 2) return 0
      let distance = 0
      for (let i = 0; i < route.length - 1; i++) {
        distance += calculateDistance(route[i][0], route[i][1], route[i + 1][0], route[i + 1][1])
      }
      return distance
    }, [route])

    const estimatedTime = React.useMemo(() => {
      // Assuming average speed of 30 km/h
      return Math.ceil((totalDistance / 30) * 60)
    }, [totalDistance])

    const toggleFullscreen = useCallback(() => {
      const elem = document.getElementById("map-container")
      if (!elem) return

      if (!isFullscreen) {
        if (elem.requestFullscreen) {
          elem.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
      setIsFullscreen(!isFullscreen)
    }, [isFullscreen])

    const getTileLayerUrl = (layer: string) => {
      switch (layer) {
        case "satellite":
          return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        case "dark":
          return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        default:
          return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      }
    }

    const getTileLayerAttribution = (layer: string) => {
      switch (layer) {
        case "satellite":
          return "&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        case "dark":
          return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        default:
          return '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
      }
    }

    return (
      <div id="map-container" className="relative w-full h-full">
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer attribution={getTileLayerAttribution(currentLayer)} url={getTileLayerUrl(currentLayer)} />

          <MapEventHandlers
            onZoomIn={setZoomInFn}
            onZoomOut={setZoomOutFn}
            onCenter={setCenterFn}
            route={route}
          />

          <FitBounds route={route} />

          {route.length > 1 && (
            <>
              <Polyline positions={route} color="#3b82f6" weight={5} opacity={0.7} />
              <Polyline positions={route} color="#60a5fa" weight={3} opacity={0.9} dashArray="10, 10" />
            </>
          )}

          <Marker position={route[0]} icon={icons.start}>
            <Popup>
              <div className="p-2">
                <p className="font-bold text-blue-600 mb-1">📍 Origem</p>
                <p className="text-xs text-gray-600">
                  {route[0][0].toFixed(6)}, {route[0][1].toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>

          {route.length > 1 && (
            <Marker position={route[route.length - 1]} icon={icons.end}>
              <Popup>
                <div className="p-2">
                  <p className="font-bold text-red-600 mb-1">🎯 Destino</p>
                  <p className="text-xs text-gray-600">
                    {route[route.length - 1][0].toFixed(6)}, {route[route.length - 1][1].toFixed(6)}
                  </p>
                  {showDistance && (
                    <p className="text-xs text-gray-800 mt-2 font-semibold">
                      📏 Distância: {totalDistance.toFixed(2)} km
                    </p>
                  )}
                  {showETA && (
                    <p className="text-xs text-gray-800 font-semibold">⏱️ Tempo estimado: {estimatedTime} min</p>
                  )}
                </div>
              </Popup>
            </Marker>
          )}

          {deliveryPosition && (
            <>
              <Circle
                center={[deliveryPosition.latitude, deliveryPosition.longitude]}
                radius={100}
                pathOptions={{ fillColor: "#10b981", fillOpacity: 0.1, color: "#10b981", weight: 1 }}
              />
              <Marker
                position={[deliveryPosition.latitude, deliveryPosition.longitude]}
                icon={icons.deliveryMoving}
              >
                <Popup>
                  <div className="p-2">
                    <p className="font-bold text-green-600 mb-1">🚚 Entregador</p>
                    <p className="text-xs text-gray-600 mb-2">Posição atual (tempo real)</p>
                    <p className="text-xs text-gray-600">
                      {deliveryPosition.latitude.toFixed(6)}, {deliveryPosition.longitude.toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            </>
          )}
        </MapContainer>

        <MapControls
          onZoomIn={zoomInFn}
          onZoomOut={zoomOutFn}
          onCenter={centerFn}
          onToggleFullscreen={toggleFullscreen}
          onChangeLayer={setCurrentLayer}
          currentLayer={currentLayer}
        />

        {(showDistance || showETA) && (
          <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3 max-w-xs">
            <div className="flex flex-col gap-2">
              {showDistance && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">📏</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Distância Total</p>
                    <p className="text-sm font-bold text-gray-900">{totalDistance.toFixed(2)} km</p>
                  </div>
                </div>
              )}
              {showETA && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">⏱️</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tempo Estimado</p>
                    <p className="text-sm font-bold text-gray-900">{estimatedTime} minutos</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <style jsx global>{`
          @keyframes pulse {
            0%,
            100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.8;
            }
          }

          .delivery-marker-pulse {
            animation: pulse 2s ease-in-out infinite;
          }

          .leaflet-container {
            border-radius: 0.5rem;
          }
        `}</style>
      </div>
    )
  }
)
MapContent.displayName = "MapContent"

const LeafletMapEnhanced = React.memo(
  ({ route, deliveryPosition, showDistance = true, showETA = true }: LeafletMapProps) => {
    const [icons, setIcons] = React.useState<{
      start: L.Icon
      end: L.Icon
      delivery: L.Icon
      deliveryMoving: L.Icon
    } | null>(null)
    const [isClient, setIsClient] = React.useState(false)
    const [tileLayer, setTileLayer] = React.useState("streets")

    React.useEffect(() => {
      setIsClient(true)
      createEnhancedIcons().then(setIcons)
    }, [])

    if (!isClient || !route || route.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">
              {!isClient ? "Carregando mapa..." : "Rota não disponível"}
            </p>
          </div>
        </div>
      )
    }

    if (!icons) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Carregando mapa...</p>
          </div>
        </div>
      )
    }

    return (
      <MapContent
        route={route}
        icons={icons}
        deliveryPosition={deliveryPosition}
        showDistance={showDistance}
        showETA={showETA}
        tileLayer={tileLayer}
      />
    )
  }
)
LeafletMapEnhanced.displayName = "LeafletMapEnhanced"

export default LeafletMapEnhanced
