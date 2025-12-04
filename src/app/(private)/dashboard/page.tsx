"use client"

import { useAuth } from "@/app/context"
import { signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  TrendingUp,
  Package,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Truck,
  MapPin
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import api from "@/app/services/api"
import AdminHome from "./(admin)/page"

interface DashboardStats {
  totalDeliveries: number
  pendingDeliveries: number
  completedDeliveries: number
  totalRevenue: number
}

export default function Dashboard() {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalDeliveries: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
    totalRevenue: 0
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!loading && !token) {
      signOut({ callbackUrl: "/signin" })
    }
  }, [token, loading])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return

      setLoadingStats(true)
      try {
        // Fetch delivery statistics (you can implement this API endpoint later)
        // For now, we'll use mock data
        setTimeout(() => {
          setStats({
            totalDeliveries: 0,
            pendingDeliveries: 0,
            completedDeliveries: 0,
            totalRevenue: user?.Balance?.amount || 0
          })
          setLoadingStats(false)
        }, 800)
      } catch (error) {
        setLoadingStats(false)
      }
    }

    if (token) {
      fetchDashboardData()
    }
  }, [token, user])

  if (loading || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center space-y-4">
          <div className="animate-spin h-16 w-16 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-slate-600 text-lg font-medium">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  const StatCard = ({ icon: Icon, title, value, description, color, loading }: {
    icon: any
    title: string
    value: string | number
    description: string
    color: string
    loading?: boolean
  }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24 mb-1" />
        ) : (
          <div className="text-2xl font-bold text-gray-900">{value}</div>
        )}
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  )

  if (user?.role === "ADMIN") {
    return <AdminHome />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Bem-vindo, {user?.name || user?.email}! 👋
              </h1>
              <p className="text-gray-600 text-lg">
                {user?.Company?.name || "Sua Central de Entregas"}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push("/dashboard/simulate")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Truck className="mr-2 h-4 w-4" />
                Nova Simulação
              </Button>
              <Button
                onClick={() => router.push("/dashboard/delivery")}
                variant="outline"
                className="border-blue-200 hover:bg-blue-50"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Ver Entregas
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Package}
            title="Total de Entregas"
            value={stats.totalDeliveries}
            description="Total acumulado"
            color="text-blue-600"
            loading={loadingStats}
          />
          <StatCard
            icon={Clock}
            title="Entregas Pendentes"
            value={stats.pendingDeliveries}
            description="Aguardando processamento"
            color="text-amber-600"
            loading={loadingStats}
          />
          <StatCard
            icon={CheckCircle}
            title="Entregas Concluídas"
            value={stats.completedDeliveries}
            description="Finalizadas com sucesso"
            color="text-green-600"
            loading={loadingStats}
          />
          <StatCard
            icon={DollarSign}
            title="Saldo Atual"
            value={new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL"
            }).format(stats.totalRevenue)}
            description="Saldo disponível"
            color="text-purple-600"
            loading={loadingStats}
          />
        </div>

        {/* Quick Actions Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => router.push("/dashboard/simulate")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Simular Entrega
              </CardTitle>
              <CardDescription>
                Calcule o custo e tempo estimado para uma nova entrega
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700">
                Iniciar Simulação
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => router.push("/dashboard/debts")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Gerenciar Débitos
              </CardTitle>
              <CardDescription>
                Visualize e gerencie seus débitos e receitas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-green-200 hover:bg-green-50">
                Ver Débitos
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Information Banner */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <AlertCircle className="h-5 w-5" />
              Dica do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-50">
              Use a simulação de entrega para calcular custos antes de confirmar.
              Você também pode rastrear suas entregas em tempo real na página de Detalhes da Entrega.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
