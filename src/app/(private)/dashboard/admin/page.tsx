"use client"

import { useAuth } from "@/app/context"
import api from "@/app/services/api"
import { signOut } from "next-auth/react"
import { useEffect, useState, useRef } from "react"
import { IDeliverySummaryResponse } from "@/app/services/api"
import { toast } from "sonner"
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Package,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Truck,
} from "lucide-react"

export default function AdminHome() {
  const { user, token, loading } = useAuth()
  const [summaryData, setSummaryData] = useState<IDeliverySummaryResponse>({
    totalDeliveries: 0,
    totalDelivered: 0,
    totalPending: 0,
    totalCancelled: 0,
  })
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [companiesData, setCompaniesData] = useState({
    total: 0,
    active: 0,
    users: [] as any[],
  })
  const [deliverymenData, setDeliverymenData] = useState({
    total: 0,
    active: 0,
    users: [] as any[],
  })
  const [isLoading, setIsLoading] = useState(false)
  const hasFetched = useRef(false)
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<"companies" | "deliverymen">("companies")

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && !token) {
      signOut({ callbackUrl: "/signin" })
      return
    }

    if (token) {
      if (!hasFetched.current) {
        hasFetched.current = true
        fetchSummaryData()
        fetchCompaniesData()
        fetchDeliverymenData()
      }

      const intervalId = setInterval(() => {
        // Only poll if tab is visible to avoid 429 errors
        if (!document.hidden) {
          fetchSummaryData(true)
          fetchCompaniesData(true)
          fetchDeliverymenData(true)
        }
      }, 300000) // 5 minutos para evitar rate limit (era 60s)

      return () => clearInterval(intervalId)
    }
  }, [token, loading])

  const fetchSummaryData = async (isBackground = false) => {
    if (!token) return

    let toastId: string | number | undefined

    if (!isBackground) {
      setIsLoading(true)
      toastId = toast.loading("Carregando resumo das entregas...")
    }

    if (!isBackground) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    try {
      const response = (await api.getAlldelivery(token)) as any

      if (
        typeof response === "object" &&
        response !== null &&
        "message" in response &&
        "status" in response
      ) {
        if (!isBackground) {
          toast.error("Erro ao buscar dados do resumo", {
            id: toastId,
            description: response.message,
          })
          setIsLoading(false)
        }
        return
      }

      if (response && response.data && Array.isArray(response.data)) {
        const deliveriesData = response.data
        setDeliveries(deliveriesData)

        const totals = deliveriesData.reduce(
          (acc: any, delivery: any) => {
            acc.totalDeliveries++
            if (delivery.status === "COMPLETED") acc.totalDelivered++
            if (delivery.status === "PENDING") acc.totalPending++
            if (delivery.status === "IN_PROGRESS") acc.totalPending++
            if (
              delivery.status === "CANCELLED" ||
              delivery.status === "CANCELED"
            )
              acc.totalCancelled++
            return acc
          },
          {
            totalDeliveries: 0,
            totalDelivered: 0,
            totalPending: 0,
            totalCancelled: 0,
          }
        )

        const summaryWithDeliveries = {
          ...totals,
          deliveries: deliveriesData
            .slice(0, 10)
            .sort((a: any, b: any) => {
              return b.id - a.id
            })
            .map((d: any) => ({
              id: d.id,
              code: d.code,
              status: d.status,
              price: d.price,
              email: d.email,
              createdAt: d.createdAt || new Date().toISOString(),
            })),
        }

        setSummaryData(summaryWithDeliveries)

        if (!isBackground) {
          toast.success("Resumo carregado com sucesso", {
            id: toastId,
            description: `${deliveriesData.length} entrega(s) encontrada(s)`,
          })
        }
      } else if (Array.isArray(response)) {
        setDeliveries(response)

        const totals = response.reduce(
          (acc, delivery) => {
            acc.totalDeliveries++
            if (delivery.status === "COMPLETED") acc.totalDelivered++
            if (delivery.status === "PENDING") acc.totalPending++
            if (delivery.status === "IN_PROGRESS") acc.totalPending++
            if (
              delivery.status === "CANCELLED" ||
              delivery.status === "CANCELED"
            )
              acc.totalCancelled++
            return acc
          },
          {
            totalDeliveries: 0,
            totalDelivered: 0,
            totalPending: 0,
            totalCancelled: 0,
          }
        )

        setSummaryData({
          ...totals,
          deliveries: response
            .slice(0, 10)
            .sort((a: any, b: any) => b.id - a.id),
        })

        if (!isBackground) {
          toast.success("Resumo carregado", {
            id: toastId,
            description: `${response.length} entrega(s) encontrada(s)`,
          })
        }
      } else {
        if (!isBackground) {
          toast.warning("Formato de resposta inesperado", {
            id: toastId,
            description: "Os dados foram retornados em um formato não esperado",
          })
        }
      }
    } catch (error) {
      if (!isBackground) {
        toast.error("Erro ao buscar dados do resumo", {
          id: toastId,
          description:
            error instanceof Error ? error.message : "Erro desconhecido",
        })
      }
    } finally {
      if (!isBackground) {
        setIsLoading(false)
      }
    }
  }

  const fetchCompaniesData = async (isBackground = false) => {
    if (!token) return

    try {
      const response = (await api.getCompanies(token)) as any

      if (
        typeof response === "object" &&
        response !== null &&
        "message" in response &&
        "status" in response
      ) {
        if (!isBackground) {
        }
        return
      }

      if (response && response.data && Array.isArray(response.data)) {
        const companies = response.data
        const active = companies.filter(
          (c: any) => c.status === "ACTIVE" || c.active === true
        ).length

        setCompaniesData({
          total: companies.length,
          active: active,
          users: companies.slice(0, 10).sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt || 0).getTime()
            const dateB = new Date(b.createdAt || 0).getTime()
            return dateB - dateA
          }),
        })
      }
    } catch (error) {
      if (!isBackground) {
      }
    }
  }

  const fetchDeliverymenData = async (isBackground = false) => {
    if (!token) return

    try {
      const response = (await api.getDeliverymen(token)) as any

      if (
        typeof response === "object" &&
        response !== null &&
        "message" in response &&
        "status" in response
      ) {
        if (!isBackground) {
        }
        return
      }

      if (response && response.data && Array.isArray(response.data)) {
        const deliverymen = response.data
        const active = deliverymen.filter(
          (d: any) => d.status === "ACTIVE" || d.active === true
        ).length

        setDeliverymenData({
          total: deliverymen.length,
          active: active,
          users: deliverymen.slice(0, 10).sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt || 0).getTime()
            const dateB = new Date(b.createdAt || 0).getTime()
            return dateB - dateA
          }),
        })
      }
    } catch (error) {
      if (!isBackground) {
      }
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-3 overflow-hidden">
      <div className="max-w-7xl mx-auto h-full flex flex-col space-y-3">
        {/* Header - Mais compacto */}
        <div className="bg-white rounded-xl shadow-sm p-3 border border-blue-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-gray-600 text-xs">Visão geral e gerenciamento</p>
            </div>
            <div className="bg-blue-50 px-3 py-1 rounded-lg">
              <span className="text-xs font-medium text-blue-700">
                {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid - Compacto */}
        <div className="grid grid-cols-4 gap-3 flex-shrink-0">
          <Card className="border-blue-100">
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-xs text-gray-600 flex items-center justify-between">
                <span>Total Lojas</span>
                <Package className="h-3 w-3" />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2">
              <div className="text-2xl font-bold">{companiesData.total}</div>
              <p className="text-xs text-gray-500">cadastradas</p>
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-xs text-gray-600 flex items-center justify-between">
                <span>Lojas Ativas</span>
                <CheckCircle className="h-3 w-3 text-green-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2">
              <div className="text-2xl font-bold text-green-600">{companiesData.active}</div>
              <p className="text-xs text-gray-500">ativas</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-100">
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-xs text-gray-600 flex items-center justify-between">
                <span>Total Entregadores</span>
                <Truck className="h-3 w-3" />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2">
              <div className="text-2xl font-bold">{deliverymenData.total}</div>
              <p className="text-xs text-gray-500">cadastrados</p>
            </CardContent>
          </Card>

          <Card className="border-purple-100">
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-xs text-gray-600 flex items-center justify-between">
                <span>Entregadores Ativos</span>
                <CheckCircle className="h-3 w-3 text-purple-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2">
              <div className="text-2xl font-bold text-purple-600">{deliverymenData.active}</div>
              <p className="text-xs text-gray-500">ativos</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Grid 2 colunas, ocupa espaço restante */}
        <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
          {/* Gráficos lado a lado */}
          <div className="grid grid-cols-2 gap-3">
            {/* Gráfico Entregas */}
            <Card className="flex flex-col">
              <CardHeader className="pb-2 pt-2 px-3 flex-shrink-0">
                <CardTitle className="text-sm font-bold">Status das Entregas</CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-2 flex-1 flex flex-col">
                {!isMounted || isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="flex justify-center flex-1 relative min-h-0">
                      <PieChart width={160} height={160}>
                        <Pie
                          data={[
                            { name: "Em Progresso", value: summaryData.totalPending, fill: "#eab308" },
                            { name: "Concluídas", value: summaryData.totalDelivered, fill: "#22c55e" },
                            { name: "Canceladas", value: summaryData.totalCancelled, fill: "#ef4444" },
                          ]}
                          cx={80}
                          cy={80}
                          innerRadius={35}
                          outerRadius={60}
                          dataKey="value"
                          label={({ percent }: { percent: number }) => `${(percent * 100).toFixed(0)}%`}
                        >
                          {[{ fill: "#eab308" }, { fill: "#22c55e" }, { fill: "#ef4444" }].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                      <div className="absolute top-[80px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <p className="text-xl font-bold">{summaryData.totalDeliveries}</p>
                        <p className="text-xs text-gray-500">Total</p>
                      </div>
                    </div>
                    <div className="space-y-1 mt-2">
                      <div className="flex justify-between p-1 bg-yellow-50 rounded text-xs">
                        <span>Em Progresso</span>
                        <span className="font-bold">{summaryData.totalPending}</span>
                      </div>
                      <div className="flex justify-between p-1 bg-green-50 rounded text-xs">
                        <span>Concluídas</span>
                        <span className="font-bold">{summaryData.totalDelivered}</span>
                      </div>
                      <div className="flex justify-between p-1 bg-red-50 rounded text-xs">
                        <span>Canceladas</span>
                        <span className="font-bold">{summaryData.totalCancelled}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gráfico Lojas & Entregadores */}
            <Card className="flex flex-col">
              <CardHeader className="pb-2 pt-2 px-3 flex-shrink-0">
                <CardTitle className="text-sm font-bold">Lojas & Entregadores</CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-2 flex-1 flex flex-col">
                {!isMounted || isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="flex justify-center flex-1">
                      <BarChart width={160} height={140} data={[
                        { name: 'Lojas', Ativas: companiesData.active, Inativas: companiesData.total - companiesData.active },
                        { name: 'Entregadores', Ativas: deliverymenData.active, Inativas: deliverymenData.total - deliverymenData.active },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 9 }} />
                        <Tooltip contentStyle={{ fontSize: '10px' }} />
                        <Legend wrapperStyle={{ fontSize: '9px' }} />
                        <Bar dataKey="Ativas" fill="#22c55e" />
                        <Bar dataKey="Inativas" fill="#94a3b8" />
                      </BarChart>
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      <div className="p-1.5 bg-blue-50 rounded text-center">
                        <p className="text-xs font-medium">Lojas</p>
                        <p className="text-lg font-bold text-blue-600">{companiesData.total}</p>
                        <p className="text-xs text-green-600">{companiesData.active} ativas</p>
                      </div>
                      <div className="p-1.5 bg-purple-50 rounded text-center">
                        <p className="text-xs font-medium">Entregadores</p>
                        <p className="text-lg font-bold text-purple-600">{deliverymenData.total}</p>
                        <p className="text-xs text-green-600">{deliverymenData.active} ativos</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tabela Colaboradores */}
          <Card className="flex flex-col min-h-0">
            <CardHeader className="pb-2 pt-2 px-3 flex-shrink-0">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Colaboradores Recentes
              </CardTitle>
              <div className="flex gap-2 mt-2 border-b">
                <button
                  onClick={() => setActiveTab("companies")}
                  className={`px-3 py-1 text-xs font-medium ${activeTab === "companies" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
                >
                  Lojas ({companiesData.total})
                </button>
                <button
                  onClick={() => setActiveTab("deliverymen")}
                  className={`px-3 py-1 text-xs font-medium ${activeTab === "deliverymen" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
                >
                  Entregadores ({deliverymenData.total})
                </button>
              </div>
            </CardHeader>
            <CardContent className="px-2 pb-2 flex-1 overflow-auto min-h-0">
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8" />)}
                </div>
              ) : (
                <>
                  {activeTab === "companies" && companiesData.users.length > 0 ? (
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-white">
                        <tr className="border-b">
                          <th className="text-left py-1 px-2 font-semibold text-gray-500">Nome</th>
                          <th className="text-left py-1 px-2 font-semibold text-gray-500">Email</th>
                          <th className="text-left py-1 px-2 font-semibold text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {companiesData.users.map((c) => (
                          <tr key={c.id} className="hover:bg-gray-50">
                            <td className="py-1.5 px-2">{c.name || c.email?.split('@')[0]}</td>
                            <td className="py-1.5 px-2 text-gray-600">{c.email}</td>
                            <td className="py-1.5 px-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs ${c.status === "ACTIVE" || c.active ? "bg-green-100 text-green-800" : "bg-gray-100"}`}>
                                {c.status === "ACTIVE" || c.active ? "Ativo" : "Inativo"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : activeTab === "deliverymen" && deliverymenData.users.length > 0 ? (
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-white">
                        <tr className="border-b">
                          <th className="text-left py-1 px-2 font-semibold text-gray-500">Nome</th>
                          <th className="text-left py-1 px-2 font-semibold text-gray-500">Email</th>
                          <th className="text-left py-1 px-2 font-semibold text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deliverymenData.users.map((d) => (
                          <tr key={d.id} className="hover:bg-gray-50">
                            <td className="py-1.5 px-2">{d.name || d.email?.split('@')[0]}</td>
                            <td className="py-1.5 px-2 text-gray-600">{d.email}</td>
                            <td className="py-1.5 px-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs ${d.status === "ACTIVE" || d.active ? "bg-green-100 text-green-800" : "bg-gray-100"}`}>
                                {d.status === "ACTIVE" || d.active ? "Ativo" : "Inativo"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-xs">Nenhum colaborador encontrado.</div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
