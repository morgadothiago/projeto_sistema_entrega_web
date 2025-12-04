'use client'


import { useAuth } from "@/app/context"
import api from "@/app/services/api"
import { signOut } from "next-auth/react"
import { useEffect, useState, useRef } from "react"
import { IDeliverySummaryResponse } from "@/app/services/api"
import { toast } from "sonner"
import { PieChart, Pie, Cell, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Package, CheckCircle, Clock, XCircle, TrendingUp, Truck } from "lucide-react"

export default function AdminHome() {
    const { user, token, loading } = useAuth()
    const [summaryData, setSummaryData] = useState<IDeliverySummaryResponse>({
        totalDeliveries: 0,
        totalDelivered: 0,
        totalPending: 0,
        totalCancelled: 0
    })
    const [deliveries, setDeliveries] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const hasFetched = useRef(false)

    useEffect(() => {
        if (!loading && !token) {
            signOut({ callbackUrl: "/signin" })
            return
        }

        if (token) {
            // Initial fetch
            if (!hasFetched.current) {
                hasFetched.current = true
                fetchSummaryData()
            }

            // Polling every 10 seconds
            const intervalId = setInterval(() => {
                fetchSummaryData(true)
            }, 10000)

            return () => clearInterval(intervalId)
        }
    }, [token, loading])


    const fetchSummaryData = async (isBackground = false) => {
        if (!token) return

        let toastId: string | number | undefined

        if (!isBackground) {
            setIsLoading(true)
            toastId = toast.loading('Carregando resumo das entregas...')
        }

        // Simulando delay da API apenas no carregamento inicial
        if (!isBackground) {
            await new Promise(resolve => setTimeout(resolve, 2000))
        }

        try {
            const response = await api.getAlldelivery(token) as any

            if (typeof response === 'object' && response !== null && 'message' in response && 'status' in response) {
                if (!isBackground) {
                    toast.error('Erro ao buscar dados do resumo', {
                        id: toastId,
                        description: response.message
                    })
                    setIsLoading(false)
                }
                return
            }

            // A API retorna um objeto paginado com { data: [...], total, currentPage, totalPage }
            if (response && response.data && Array.isArray(response.data)) {
                const deliveriesData = response.data
                setDeliveries(deliveriesData)

                // Calcular os totais
                const totals = deliveriesData.reduce((acc: any, delivery: any) => {
                    acc.totalDeliveries++
                    if (delivery.status === 'COMPLETED') acc.totalDelivered++
                    if (delivery.status === 'PENDING') acc.totalPending++
                    if (delivery.status === 'IN_PROGRESS') acc.totalPending++ // IN_PROGRESS também é pendente
                    if (delivery.status === 'CANCELLED' || delivery.status === 'CANCELED') acc.totalCancelled++
                    return acc
                }, { totalDeliveries: 0, totalDelivered: 0, totalPending: 0, totalCancelled: 0 })

                const summaryWithDeliveries = {
                    ...totals,
                    deliveries: deliveriesData.slice(0, 10).sort((a: any, b: any) => {
                        // Ordenar por ID decrescente (mais recente primeiro)
                        return b.id - a.id
                    }).map((d: any) => ({
                        id: d.id,
                        code: d.code,
                        status: d.status,
                        price: d.price,
                        email: d.email,
                        createdAt: d.createdAt || new Date().toISOString()
                    }))
                }

                setSummaryData(summaryWithDeliveries)

                if (!isBackground) {
                    toast.success('Resumo carregado com sucesso', {
                        id: toastId,
                        description: `${deliveriesData.length} entrega(s) encontrada(s)`
                    })
                }
            } else if (Array.isArray(response)) {
                // Fallback caso a API retorne array direto
                setDeliveries(response)

                const totals = response.reduce((acc, delivery) => {
                    acc.totalDeliveries++
                    if (delivery.status === 'COMPLETED') acc.totalDelivered++
                    if (delivery.status === 'PENDING') acc.totalPending++
                    if (delivery.status === 'IN_PROGRESS') acc.totalPending++
                    if (delivery.status === 'CANCELLED' || delivery.status === 'CANCELED') acc.totalCancelled++
                    return acc
                }, { totalDeliveries: 0, totalDelivered: 0, totalPending: 0, totalCancelled: 0 })

                setSummaryData({
                    ...totals,
                    deliveries: response.slice(0, 10).sort((a: any, b: any) => b.id - a.id)
                })

                if (!isBackground) {
                    toast.success('Resumo carregado', {
                        id: toastId,
                        description: `${response.length} entrega(s) encontrada(s)`
                    })
                }
            } else {
                if (!isBackground) {
                    toast.warning('Formato de resposta inesperado', {
                        id: toastId,
                        description: 'Os dados foram retornados em um formato não esperado'
                    })
                }
            }
        } catch (error) {
            if (!isBackground) {
                toast.error('Erro ao buscar dados do resumo', {
                    id: toastId,
                    description: error instanceof Error ? error.message : 'Erro desconhecido'
                })
            }
        } finally {
            if (!isBackground) {
                setIsLoading(false)
            }
        }
    }






    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-blue-100">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                Painel Administrativo
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Visão geral e gerenciamento de entregas
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                                <span className="text-sm font-medium text-blue-700">
                                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Stats & Table */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="hover:shadow-md transition-shadow duration-300 border-blue-100">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">Total - Lojas</CardTitle>
                                    <Package className="h-4 w-4 text-blue-600" />
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <Skeleton className="h-7 w-16" />
                                    ) : (
                                        <div className="text-2xl font-bold text-gray-900">{summaryData.totalDeliveries}</div>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">Entregas registradas</p>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow duration-300 border-green-100">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">Lojas - Ativas</CardTitle>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <Skeleton className="h-7 w-16" />
                                    ) : (
                                        <div className="text-2xl font-bold text-gray-900">{summaryData.totalDelivered}</div>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">Entregas finalizadas</p>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow duration-300 border-yellow-100">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">Total - Entregadores</CardTitle>
                                    <Clock className="h-4 w-4 text-yellow-600" />
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <Skeleton className="h-7 w-16" />
                                    ) : (
                                        <div className="text-2xl font-bold text-gray-900">{summaryData.totalPending}</div>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">Aguardando ação</p>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow duration-300 border-red-100">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">Entregadores - Ativos</CardTitle>
                                    <XCircle className="h-4 w-4 text-red-600" />
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <Skeleton className="h-7 w-16" />
                                    ) : (
                                        <div className="text-2xl font-bold text-gray-900">{summaryData.totalCancelled}</div>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">Entregas canceladas</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Deliveries Table */}
                        <Card className="border-gray-100 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-blue-600" />
                                    Entregas Recentes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                                <Skeleton className="h-4 w-20" />
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-6 w-24 rounded-full" />
                                                <Skeleton className="h-4 w-16" />
                                            </div>
                                        ))}
                                    </div>
                                ) : summaryData.deliveries && summaryData.deliveries.length > 0 ? (
                                    <div className="overflow-x-auto -mx-6 px-6">
                                        <table className="w-full min-w-[600px]">
                                            <thead>
                                                <tr className="border-b border-gray-100">
                                                    <th className="text-left py-3 font-semibold text-xs md:text-sm text-gray-500 uppercase tracking-wider">Código</th>
                                                    <th className="text-left py-3 font-semibold text-xs md:text-sm text-gray-500 uppercase tracking-wider">Cliente</th>
                                                    <th className="text-left py-3 font-semibold text-xs md:text-sm text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="text-left py-3 font-semibold text-xs md:text-sm text-gray-500 uppercase tracking-wider">Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {summaryData.deliveries.map((delivery) => (
                                                    <tr key={delivery.id} className="hover:bg-gray-50/50 transition-colors group">
                                                        <td className="py-3 text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{delivery.code}</td>
                                                        <td className="py-3 text-sm text-gray-600">{delivery.email}</td>
                                                        <td className="py-3">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${delivery.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                                delivery.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                                    delivery.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                                        (delivery.status === 'CANCELLED' || delivery.status === 'CANCELED') ? 'bg-red-100 text-red-800' :
                                                                            ''
                                                                }`}>
                                                                {delivery.status === 'COMPLETED' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                                {delivery.status === 'IN_PROGRESS' && <Truck className="w-3 h-3 mr-1" />}
                                                                {delivery.status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                                                                {(delivery.status === 'CANCELLED' || delivery.status === 'CANCELED') && <XCircle className="w-3 h-3 mr-1" />}
                                                                {delivery.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 text-sm font-medium text-gray-900 whitespace-nowrap">R$ {delivery.price}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        Nenhuma entrega recente encontrada.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Chart */}
                    <div className="lg:col-span-1">
                        <Card className="border-gray-100 shadow-sm h-full">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold text-gray-800">Status das Entregas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center h-64">
                                        <Skeleton className="w-48 h-48 rounded-full" />
                                        <div className="mt-6 space-y-3 w-full">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-center mb-6 relative">
                                            {typeof window !== 'undefined' && (
                                            <PieChart width={280} height={280}>
                                                <Pie
                                                    data={[
                                                        { name: 'Em Progresso', value: summaryData.totalPending, fill: '#eab308' },
                                                        { name: 'Concluídas', value: summaryData.totalDelivered, fill: '#22c55e' },
                                                        { name: 'Canceladas', value: summaryData.totalCancelled, fill: '#ef4444' },
                                                    ]}
                                                    cx={140}
                                                    cy={140}
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    label={({ name, percent }: { name: string; percent: number }) => `${(percent * 100).toFixed(0)}%`}
                                                    labelLine={false}
                                                >
                                                    {[
                                                        { name: 'Em Progresso', value: summaryData.totalPending, fill: '#eab308' },
                                                        { name: 'Concluídas', value: summaryData.totalDelivered, fill: '#22c55e' },
                                                        { name: 'Canceladas', value: summaryData.totalCancelled, fill: '#ef4444' },
                                                    ].map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    itemStyle={{ color: '#374151', fontSize: '14px', fontWeight: 500 }}
                                                />
                                            </PieChart>
                                        )}
                                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                                <p className="text-3xl font-bold text-gray-800">{summaryData.totalDeliveries}</p>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100 hover:bg-yellow-100 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 bg-yellow-500 rounded-full ring-2 ring-yellow-200"></div>
                                                    <span className="text-sm font-medium text-gray-700">Em Progresso</span>
                                                </div>
                                                <span className="text-sm font-bold text-yellow-700">{summaryData.totalPending}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 bg-green-500 rounded-full ring-2 ring-green-200"></div>
                                                    <span className="text-sm font-medium text-gray-700">Concluídas</span>
                                                </div>
                                                <span className="text-sm font-bold text-green-700">{summaryData.totalDelivered}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 bg-red-500 rounded-full ring-2 ring-red-200"></div>
                                                    <span className="text-sm font-medium text-gray-700">Canceladas</span>
                                                </div>
                                                <span className="text-sm font-bold text-red-700">{summaryData.totalCancelled}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
