"use client"
import dynamic from "next/dynamic"
import type { ComponentType } from "react"

const LeafletMap = dynamic(() => import("./_LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-lg">
      <div className="text-slate-500 text-sm">Carregando mapa...</div>
    </div>
  ),
}) as ComponentType<{ route: [number, number][] }>

interface MapSimulateProps {
  route: [number, number][]
}

export default function MapSimulate({ route }: MapSimulateProps) {
  return <LeafletMap route={route} />
}
