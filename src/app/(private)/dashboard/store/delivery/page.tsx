"use client"

import { useAuth } from "@/app/context"
import { signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { IDeliverySummaryResponse } from "@/app/services/api"
import DeliveryTable from "@/components/DeliveryTable"
import api from "@/app/services/api"
import { Button } from "@/components/ui/button"
import { Plus, Package, TrendingUp, Clock, XCircle, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function DeliveryListPage() {
  const { token, loading } = useAuth()
  const [data, setData] = useState<IDeliverySummaryResponse | null>(null)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDeliveries = () => {
    if (!token) return

    setFetching(true)
    setError(null)
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

  useEffect(() => {
    if (!loading && !token) {
      signOut({ redirect: true, callbackUrl: "/signin" })
      return
    }

    if (!loading && token) {
      fetchDeliveries()
    }
  }, [token, loading])

  const stats = [
    {
      label: "Total de Entregas",
      value: data?.totalDeliveries ?? 0,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Concluídas",
      value: data?.totalDelivered ?? 0,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Pendentes",
      value: data?.totalPending ?? 0,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: "Canceladas",
      value: data?.totalCancelled ?? 0,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Gerenciamento de Entregas
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Visualize e gerencie todas as suas entregas em um só lugar
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDeliveries}
                disabled={fetching}
              >
                <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Nova Entrega
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {!fetching && data && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`rounded-full ${stat.bgColor} p-3`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Content */}
        <section>
          {fetching ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />
                  <p className="text-sm text-gray-600">Carregando entregas...</p>
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="rounded-full bg-red-50 p-4">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">Erro ao carregar entregas</p>
                    <p className="mt-1 text-sm text-gray-600">{error}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchDeliveries}>
                    <RefreshCw className="h-4 w-4" />
                    Tentar novamente
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <DeliveryTable deliveries={data?.deliveries || []} />
          )}
        </section>
      </div>
    </div>
  )
}
