"use client"

import { useAuth } from "@/app/context"
import { signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { IDeliverySummaryResponse } from "@/app/services/api"
import DeliveryTable from "@/components/DeliveryTable"
import api from "@/app/services/api"

export default function DeliveryListPage() {
  const { token, loading } = useAuth()
  const [data, setData] = useState<IDeliverySummaryResponse | null>(null)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // fetchDeliveries removed: using inline api.getSummary call below

  useEffect(() => {
    if (!loading && !token) {
      signOut({ redirect: true, callbackUrl: "/signin" })
      return
    }

    if (!loading && token) {
      setFetching(true)
      api.getSummary(token as string)
        .then((res: any) => {
          if (res && res.status && res.message) {
            setError(res.message)
            setData(null)
            return
          }

          // API sometimes returns paginated shape: { data: [...], total, currentPage }
          if (res && Array.isArray(res.data)) {
            setData({
              totalDeliveries: res.total ?? res.data.length,
              totalDelivered: 0,
              totalPending: 0,
              totalCancelled: 0,
              deliveries: res.data,
            })
            return
          }

          // If API already returns the expected shape
          if (res && Array.isArray(res.deliveries)) {
            setData(res as IDeliverySummaryResponse)
            return
          }

          // Fallback: try to use as array
          if (Array.isArray(res)) {
            setData({
              totalDeliveries: res.length,
              totalDelivered: 0,
              totalPending: 0,
              totalCancelled: 0,
              deliveries: res,
            })
            return
          }

          setError('Formato de resposta inválido')
          setData(null)
        })
        .catch((e: any) => setError(e?.message || "Erro ao carregar"))
        .finally(() => setFetching(false))
    }
  }, [token, loading])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold">Hello World - Lista de Entregas</h1>

      <section className="mt-6">
        {fetching ? (
          <div className="py-12 text-center text-gray-500">Carregando...</div>
        ) : error ? (
          <div className="py-12 text-center text-red-500">{error}</div>
        ) : (
          <DeliveryTable deliveries={data?.deliveries || []} />
        )}
      </section>
    </div>
  )
}
