"use client"

import { useAuth } from "@/app/context"
import api from "@/app/services/api"
import { Delivery } from "@/types/delivery"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import React, { useEffect, useState, useCallback, useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Package, Truck, CheckCircle, Clock, XCircle, CreditCard, User, ChevronRight, Eye } from "lucide-react"
import { PaymentModal } from "@/components/payment/PaymentModal"
import { VehicleType } from "@/app/types/VehicleType"
import { ClientDebtDetailsModal } from "@/components/debts/ClientDebtDetailsModal"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
      // logger.debug("Token not available for fetchData")
      return
    }

    try {
      setIsLoading(true)
      // logger.debug("Fetching data...")

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
      // logger.error("Error fetching data", err)
      setError("Erro ao carregar dados. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!loading && !token) {
      // logger.warn("No token after loading, redirecting to signin")
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

        {/* Lista de Clientes - Tabela Responsiva */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader className="hidden sm:table-header-group bg-gray-50/50">
                <TableRow>
                  <TableHead className="h-14 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Cliente
                  </TableHead>
                  <TableHead className="h-14 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Entregas
                  </TableHead>
                  <TableHead className="h-14 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total a Pagar
                  </TableHead>
                  <TableHead className="h-14 px-6 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="block sm:table-row-group divide-y divide-gray-200">
                {Object.keys(groupedDeliveries).length === 0 ? (
                  <TableRow className="block sm:table-row">
                    <TableCell colSpan={4} className="py-20 text-center block sm:table-cell">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="rounded-full bg-gray-100 p-4">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900">Nenhum débito encontrado</p>
                          <p className="text-sm text-gray-500 font-medium">Não há pendências no momento</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  Object.entries(groupedDeliveries).map(([clientName, clientDeliveries]) => {
                    const totalDebt = clientDeliveries.reduce((acc, delivery) => {
                      const price = parseFloat(delivery.price)
                      return isNaN(price) ? acc : acc + price
                    }, 0)

                    return (
                      <TableRow
                        key={clientName}
                        onClick={() => handleClientClick(clientName)}
                        className="group hover:bg-blue-50/50 transition-all duration-200 cursor-pointer border-b border-gray-100 mb-4 block sm:table-row last:mb-0 shadow-sm sm:shadow-none mx-4 sm:mx-0 my-4 sm:my-0 rounded-2xl sm:rounded-none bg-white sm:bg-transparent"
                      >
                        <TableCell
                          data-label="Cliente"
                          className="px-6 py-4 block sm:table-cell text-right sm:text-left before:content-[attr(data-label)] before:font-bold before:text-blue-600 before:float-left sm:before:content-none before:mr-2"
                        >
                          <div className="flex items-center justify-end sm:justify-start gap-4">
                            <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 group-hover:bg-blue-600 transition-colors duration-300">
                              <User className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {clientName}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell
                          data-label="Entregas"
                          className="px-6 py-4 block sm:table-cell text-right sm:text-left before:content-[attr(data-label)] before:font-bold before:text-blue-600 before:float-left sm:before:content-none before:mr-2"
                        >
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-semibold px-3 py-1">
                            <Package className="w-3.5 h-3.5 mr-1.5" />
                            {clientDeliveries.length} {clientDeliveries.length === 1 ? "entrega" : "entregas"}
                          </Badge>
                        </TableCell>

                        <TableCell
                          data-label="Total a Pagar"
                          className="px-6 py-4 block sm:table-cell text-right sm:text-left before:content-[attr(data-label)] before:font-bold before:text-blue-600 before:float-left sm:before:content-none before:mr-2"
                        >
                          <div className="flex flex-col items-end sm:items-start">
                            <span className="sm:hidden text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Total a Pagar</span>
                            <span className="text-xl font-black text-gray-900">
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(totalDebt)}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell
                          data-label="Ações"
                          className="px-6 py-4 block sm:table-cell text-right sm:text-left before:content-[attr(data-label)] before:font-bold before:text-blue-600 before:float-left sm:before:content-none before:mr-2 border-t sm:border-t-0 mt-2 sm:mt-0"
                        >
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="hidden sm:inline">Ver Detalhes</span>
                              <span className="sm:hidden">Detalhes</span>
                            </Button>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" />
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
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
