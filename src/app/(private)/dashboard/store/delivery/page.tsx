"use client"

import { useAuth } from "@/app/context"
import api from "@/app/services/api"
import { Delivery } from "@/types/delivery"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import React, { useEffect, useState, useCallback, useMemo } from "react"
import { logger } from "@/lib/logger"
import {
  DeliveryCard,
  DeliveryStats,
  DeliveryFilters,
  DeliverySearch,
  DeliveryHeader,
  DeliveryEmptyState,
} from "@/components/delivery"

interface ApiResponse {
  data?: Delivery[] | { data: Delivery[] }
}

type DeliveryApiResponse = Delivery[] | ApiResponse | unknown

type FilterType = "ALL" | "IN_PROGRESS" | "DELIVERED"

export default function DeliveryPage() {
  const { token, loading } = useAuth()
  const router = useRouter()
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentFilter, setCurrentFilter] = useState<FilterType>("ALL")

  const fetchDeliveries = useCallback(async () => {
    if (!token) {
      logger.debug("Token not available for fetchDeliveries")
      return
    }

    try {
      setIsLoading(true)
      logger.debug("Fetching deliveries...")
      const response = await api.getAlldelivery(token) as DeliveryApiResponse

      // Handle different possible response structures
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

  // Filter deliveries based on current filter and search term
  const filteredDeliveries = useMemo(() => {
    let filtered = deliveries

    // Apply status filter
    if (currentFilter === "IN_PROGRESS") {
      filtered = filtered.filter((d) =>
        ["PENDING", "IN_TRANSIT", "IN_PROGRESS"].includes(d.status)
      )
    } else if (currentFilter === "DELIVERED") {
      filtered = filtered.filter((d) =>
        ["DELIVERED", "COMPLETED"].includes(d.status)
      )
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (d) =>
          d.code.toLowerCase().includes(term) ||
          d.Company?.name.toLowerCase().includes(term) ||
          d.email.toLowerCase().includes(term)
      )
    }

    return filtered
  }, [deliveries, currentFilter, searchTerm])

  // Calculate statistics
  const stats = useMemo(() => {
    const inProgress = deliveries.filter((d) =>
      ["PENDING", "IN_TRANSIT", "IN_PROGRESS"].includes(d.status)
    ).length
    const completed = deliveries.filter((d) =>
      ["DELIVERED", "COMPLETED"].includes(d.status)
    ).length
    const totalRevenue = deliveries
      .filter((d) => ["DELIVERED", "COMPLETED"].includes(d.status))
      .reduce((sum, d) => sum + parseFloat(d.price), 0)

    return {
      totalDeliveries: deliveries.length,
      inProgress,
      completed,
      totalRevenue,
    }
  }, [deliveries])

  // Calculate filter counts
  const filterCounts = useMemo(() => {
    const inProgress = deliveries.filter((d) =>
      ["PENDING", "IN_TRANSIT", "IN_PROGRESS"].includes(d.status)
    ).length
    const delivered = deliveries.filter((d) =>
      ["DELIVERED", "COMPLETED"].includes(d.status)
    ).length

    return {
      all: deliveries.length,
      inProgress,
      delivered,
    }
  }, [deliveries])

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
                <svg
                  className="h-8 w-8 text-red-600"
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
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <DeliveryHeader
          onNewDelivery={() => router.push("/dashboard/simulate")}
        />

        {/* Statistics Cards */}
        <DeliveryStats
          totalDeliveries={stats.totalDeliveries}
          inProgress={stats.inProgress}
          completed={stats.completed}
          totalRevenue={stats.totalRevenue}
        />

        {/* Search Bar */}
        <DeliverySearch value={searchTerm} onChange={setSearchTerm} />

        {/* Filters */}
        <DeliveryFilters
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
          counts={filterCounts}
        />

        {/* Deliveries List */}
        {filteredDeliveries.length === 0 ? (
          <DeliveryEmptyState
            onCreateFirst={() => router.push("/dashboard/simulate")}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeliveries.map((delivery) => (
              <DeliveryCard
                key={delivery.code}
                delivery={delivery}
                onClick={() =>
                  router.push(`/dashboard/store/delivery/${delivery.code}`)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
