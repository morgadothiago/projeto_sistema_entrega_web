"use client"

import { useAuth } from "@/app/context"
import api from "@/app/services/api"
import { Delivery } from "@/types/delivery"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

export default function DeliveryPage() {
  const { token } = useAuth()
  const router = useRouter()
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDeliveries = async () => {
    if (!token) return

    try {
      setIsLoading(true)
      const response = await api.getAlldelivery(token)
      console.log("API Response:", response)

      // Handle different possible response structures
      if (Array.isArray(response)) {
        setDeliveries(response)
      } else if (response && Array.isArray(response.data)) {
        setDeliveries(response.data)
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        setDeliveries(response.data.data)
      } else {
        console.error("Unexpected response format:", response)
        setError("Formato de resposta inesperado da API")
      }
    } catch (err) {
      console.error("Error fetching deliveries:", err)
      setError("Erro ao carregar as entregas. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!token) {
      signOut({ redirect: true, callbackUrl: "/signin" })
      return
    }
    fetchDeliveries()
  }, [token])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={fetchDeliveries}
                className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lista de Entregas</h1>
        <button
          onClick={() => router.push("/dashboard/delivery/new")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Nova Entrega
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destinatário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deliveries.length > 0 ? (
                deliveries.map((delivery) => (
                  <tr
                    key={delivery.code}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      router.push(`/dashboard/delivery/${delivery.code}`)
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {delivery.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {delivery.Company?.name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {delivery.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          delivery.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : delivery.status === "IN_TRANSIT"
                            ? "bg-blue-100 text-blue-800"
                            : delivery.status === "DELIVERED"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {delivery.status === "PENDING"
                          ? "Pendente"
                          : delivery.status === "IN_TRANSIT"
                          ? "Em Trânsito"
                          : delivery.status === "DELIVERED"
                          ? "Entregue"
                          : "Cancelado"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {delivery.vehicleType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      R${" "}
                      {parseFloat(delivery.price).toFixed(2).replace(".", ",")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/dashboard/delivery/${delivery.code}`)
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3 cursor-pointer"
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Nenhuma entrega encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
