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

interface ApiResponse {
  data?: Delivery[] | { data: Delivery[] }
}

type DeliveryApiResponse = Delivery[] | ApiResponse | unknown

export default function DebtsPage() {
  const { token, loading } = useAuth()
  const router = useRouter()
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)

  const fetchDeliveries = useCallback(async () => {
    if (!token) {
      logger.debug("Token not available for fetchDeliveries")
      return
    }

    try {
      setIsLoading(true)
      logger.debug("Fetching deliveries...")
      const response = await api.getAlldelivery(token) as DeliveryApiResponse

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
          }
        } else {
          setError("Formato de resposta inesperado da API")
          logger.error("Unexpected API response format", response)
        }
      } else {
        setError("Formato de resposta inesperado da API")
        logger.error("Unexpected API response format", response)
      }
    } catch (err) {
      logger.error("Error fetching deliveries", err)
      setError("Erro ao carregar as entregas. Tente novamente.")
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
      fetchDeliveries()
    }
  }, [token, loading, fetchDeliveries])

  const totalAmount = useMemo(() => {
    return deliveries.reduce((acc, delivery) => {
      const price = parseFloat(delivery.price)
      return isNaN(price) ? acc : acc + price
    }, 0)
  }, [deliveries])

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return {
          icon: CheckCircle,
          label: "Entregue",
          color: "text-green-600",
          bgColor: "bg-green-100",
          borderColor: "border-green-300"
        }
      case "IN_TRANSIT":
        return {
          icon: Truck,
          label: "Em Trânsito",
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          borderColor: "border-blue-300"
        }
      case "PENDING":
        return {
          icon: Clock,
          label: "Pendente",
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
          borderColor: "border-yellow-300"
        }
      case "CANCELLED":
        return {
          icon: XCircle,
          label: "Cancelado",
          color: "text-red-600",
          bgColor: "bg-red-100",
          borderColor: "border-red-300"
        }
      default:
        return {
          icon: Package,
          label: status,
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          borderColor: "border-gray-300"
        }
    }
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
            Carregando entregas...
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
                  onClick={fetchDeliveries}
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
                Entregas Cadastradas
              </h1>
              <p className="text-blue-100 text-sm md:text-lg">
                Gerencie suas entregas e efetue pagamentos
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 md:p-4 hidden md:block">
              <Package className="w-8 h-8 md:w-12 md:h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Lista de Entregas */}
        <Card className="bg-white rounded-2xl shadow-xl border-2 border-gray-100">
          <CardContent className="p-4 md:p-6">
            {deliveries.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">
                  Nenhuma entrega cadastrada
                </p>
                <p className="text-gray-400 mt-2">
                  As entregas cadastradas aparecerão aqui
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {deliveries.map((delivery) => {
                  const statusConfig = getStatusConfig(delivery.status)
                  const StatusIcon = statusConfig.icon

                  return (
                    <div
                      key={delivery.code}
                      className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-white gap-4"
                    >
                      {/* Left: Icon and Info */}
                      <div className="flex items-start md:items-center gap-4 flex-1 w-full">
                        <div className={`p-3 rounded-xl ${statusConfig.bgColor} shrink-0`}>
                          <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1">
                            <h3 className="font-bold text-gray-900 text-base md:text-lg truncate">
                              {delivery.Company?.name || "N/A"}
                            </h3>
                            <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-2 ${statusConfig.borderColor} whitespace-nowrap`}>
                              {statusConfig.label}
                            </Badge>
                          </div>

                          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-sm text-gray-600">
                            <span className="font-mono font-semibold">
                              #{delivery.code}
                            </span>
                            <span className="hidden md:inline">•</span>
                            <span className="truncate">{delivery.email}</span>
                            <span className="hidden md:inline">•</span>
                            <span className="font-semibold text-green-600 text-base">
                              R$ {parseFloat(delivery.price).toFixed(2).replace(".", ",")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botão Efetuar Pagamento */}
        {deliveries.length > 0 && (
          <div className="sticky bottom-4 md:static flex justify-center pb-4 md:pb-0">
            <Button
              onClick={() => setPaymentModalOpen(true)}
              className="w-full md:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 md:px-12 py-6 rounded-xl text-lg font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
            >
              <CreditCard className="w-6 h-6 mr-3" />
              Efetuar Pagamento
            </Button>
          </div>
        )}

        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          totalAmount={totalAmount}
        />
      </div>
    </div>
  )
}
