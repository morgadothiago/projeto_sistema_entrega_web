"use client"

import { useAuth } from "@/app/context"
import api from "@/app/services/api"
import { Delivery } from "@/types/delivery"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import React, { useEffect, useState, useCallback, useMemo } from "react"
import { logger } from "@/lib/logger"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Package, Truck, CheckCircle, Clock, XCircle, CreditCard } from "lucide-react"
import { PaymentModal } from "@/components/payment/PaymentModal"
import { VehicleType } from "@/app/types/VehicleType"
import { ClientDebtCard } from "@/components/debts/ClientDebtCard"
import { ClientDebtDetailsModal } from "@/components/debts/ClientDebtDetailsModal"

interface ApiResponse {
  data?: Delivery[] | { data: Delivery[] }
}

type DeliveryApiResponse = Delivery[] | ApiResponse | unknown

export default function DebtsPage() {
  const { token, loading } = useAuth()
  const router = useRouter()
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for the details modal
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchData = useCallback(async () => {
    if (!token) {
      logger.debug("Token not available for fetchData")
      return
    }

    try {
      setIsLoading(true)
      logger.debug("Fetching data...")

      const [deliveriesResponse, vehicleTypesResponse] = await Promise.all([
        api.getAlldelivery(token) as Promise<DeliveryApiResponse>,
        api.getAllVehicleType(token)
      ])

      // Handle Deliveries
      if (Array.isArray(deliveriesResponse)) {
        setDeliveries(deliveriesResponse as Delivery[])
      } else if (deliveriesResponse && typeof deliveriesResponse === 'object' && 'data' in deliveriesResponse) {
        const apiResponse = deliveriesResponse as ApiResponse
        if (Array.isArray(apiResponse.data)) {
          setDeliveries(apiResponse.data)
        } else if (apiResponse.data && typeof apiResponse.data === 'object' && 'data' in apiResponse.data) {
          const nestedData = apiResponse.data as { data: Delivery[] }
          if (Array.isArray(nestedData.data)) {
            setDeliveries(nestedData.data)
          }
        } else {
          setError("Formato de resposta inesperado da API (Entregas)")
        }
      }

      // Handle Vehicle Types
      if (vehicleTypesResponse && 'data' in vehicleTypesResponse && Array.isArray(vehicleTypesResponse.data)) {
        setVehicleTypes(vehicleTypesResponse.data)
      }

    } catch (err) {
      logger.error("Error fetching data", err)
      setError("Erro ao carregar dados. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!loading && !token) {
      logger.warn("No token after loading, redirecting to signin")
      signOut({ redirect: true, callbackUrl: "/signin" })
      return
    }

    if (!loading && token) {
      fetchData()
    }
  }, [token, loading, fetchData])

  // Group deliveries by client
  const groupedDeliveries = useMemo(() => {
    const groups: Record<string, Delivery[]> = {}

    deliveries.forEach(delivery => {
      const clientName = delivery.Company?.name || "Cliente Desconhecido"
      if (!groups[clientName]) {
        groups[clientName] = []
      }
      groups[clientName].push(delivery)
    })

    return groups
  }, [deliveries])

  const handleClientClick = (clientName: string) => {
    setSelectedClient(clientName)
    setIsModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600 mb-6"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-ping"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">
            Carregando débitos...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4">
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-red-200 p-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-red-100 rounded-full">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-800 mb-2">
                  Erro ao carregar
                </h3>
                <p className="text-red-600">{error}</p>
                <button
                  onClick={fetchData}
                  className="mt-4 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold transition-all duration-300 hover:shadow-lg"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                Débitos por Cliente
              </h1>
              <p className="text-blue-100 text-sm md:text-lg">
                Gerencie os pagamentos pendentes agrupados por cliente
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 md:p-4 hidden md:block">
              <Package className="w-8 h-8 md:w-12 md:h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Lista de Clientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(groupedDeliveries).length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">
                Nenhum débito encontrado
              </p>
            </div>
          ) : (
            Object.entries(groupedDeliveries).map(([clientName, clientDeliveries]) => {
              const totalDebt = clientDeliveries.reduce((acc, delivery) => {
                const price = parseFloat(delivery.price)
                return isNaN(price) ? acc : acc + price
              }, 0)

              return (
                <ClientDebtCard
                  key={clientName}
                  clientName={clientName}
                  totalDebt={totalDebt}
                  deliveryCount={clientDeliveries.length}
                  onClick={() => handleClientClick(clientName)}
                />
              )
            })
          )}
        </div>

        {/* Modal de Detalhes */}
        {selectedClient && (
          <ClientDebtDetailsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            clientName={selectedClient}
            deliveries={groupedDeliveries[selectedClient] || []}
            vehicleTypes={vehicleTypes}
          />
        )}
      </div>
    </div>
  )
}
