"use client"

import React, { useEffect, useState, useMemo } from "react"
import { useAuth } from "@/app/context"
import api from "@/app/services/api"
import { Delivery } from "@/types/delivery"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

import { NotificationHeader } from "@/components/notification/NotificationHeader"
import { NotificationFilters } from "@/components/notification/NotificationFilters"
import { NotificationCard } from "@/components/notification/NotificationCard"
import { Bell, Loader2 } from "lucide-react"

interface ApiResponse {
  data?: Delivery[] | { data: Delivery[] }
}

type DeliveryApiResponse = Delivery[] | ApiResponse | unknown

export default function NotificationPage() {
  const { token, loading } = useAuth()
  const router = useRouter()
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "in_progress" | "finalized">("all")

  useEffect(() => {
    if (!loading && !token) {
      signOut({ redirect: true, callbackUrl: "/signin" })
      return
    }

    if (!loading && token) {
      fetchDeliveries()
    }
  }, [token, loading])

  const fetchDeliveries = async () => {
    try {
      setIsLoading(true)
      const response = await api.getAlldelivery(token!) as DeliveryApiResponse

      // Verificar se é uma resposta de erro
      if (response && typeof response === 'object' && 'status' in response && 'message' in response) {
        const errorResponse = response as { status: number; message: string }

        // Não mostrar erro para 404 pois o interceptor já mostrou o toast
        if (errorResponse.status !== 404) {
          const { toast } = await import("sonner")
          toast.error(errorResponse.message || "Erro ao carregar entregas")
        }

        setDeliveries([])
        return
      }

      // Processar resposta de sucesso
      if (Array.isArray(response)) {
        setDeliveries(response as Delivery[])
      } else if (response && typeof response === 'object' && 'data' in response) {
        const apiResponse = response as ApiResponse
        if (Array.isArray(apiResponse.data)) {
          setDeliveries(apiResponse.data)
        } else if (apiResponse.data && typeof apiResponse.data === 'object' && 'data' in apiResponse.data) {
          const nestedData = apiResponse.data as { data: Delivery[] }
          if (Array.isArray(nestedData.data)) {
            setDeliveries(nestedData.data)
          } else {
            setDeliveries([])
          }
        } else {
          setDeliveries([])
        }
      } else {
        setDeliveries([])
      }
    } catch (err) {
      const { toast } = await import("sonner")
      toast.error("Erro ao carregar entregas. Tente novamente.")
      setDeliveries([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((delivery) => {
      if (filter === "all") return true
      if (filter === "in_progress") {
        return ["PENDING", "IN_TRANSIT"].includes(delivery.status)
      }
      if (filter === "finalized") {
        return ["DELIVERED", "CANCELLED"].includes(delivery.status)
      }
      return true
    })
  }, [deliveries, filter])

  const counts = useMemo(() => {
    return {
      all: deliveries.length,
      in_progress: deliveries.filter(d => ["PENDING", "IN_TRANSIT"].includes(d.status)).length,
      finalized: deliveries.filter(d => ["DELIVERED", "CANCELLED"].includes(d.status)).length
    }
  }, [deliveries])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-600 font-medium">Carregando notificações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        <NotificationHeader />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Suas Atualizações
          </h2>
          <NotificationFilters
            activeFilter={filter}
            onFilterChange={setFilter}
            counts={counts}
          />
        </div>

        <div className="space-y-4">
          {filteredDeliveries.length > 0 ? (
            filteredDeliveries.map((delivery) => (
              <NotificationCard
                key={delivery.code}
                delivery={delivery}
                onClick={() => router.push(`/dashboard/store/delivery/${delivery.code}`)}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Nenhuma notificação encontrada
              </h3>
              <p className="text-gray-500 mt-1">
                Não há entregas com este status no momento.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
