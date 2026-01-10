"use client"

import { useParams } from "next/navigation"

export default function DeliveryDetailPage() {
  const { code } = useParams<{ code: string }>()

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Hello World - Detalhes da Entrega</h1>
      <p className="text-lg">Código: {code}</p>
    </div>
  )
}
