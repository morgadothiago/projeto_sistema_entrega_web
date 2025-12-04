'use client'


import { useAuth } from "@/app/context"
import api from "@/app/services/api"
import { signOut } from "next-auth/react"
import { useEffect, useState, useRef } from "react"
import { IDeliverySummaryResponse } from "@/app/services/api"
import { toast } from "sonner"

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

    const fetchSummaryData = async () => {
        if (!token) return

        setIsLoading(true)
        const toastId = toast.loading('Carregando resumo das entregas...')

        // Simulando delay da API para ver o skeleton (REMOVER EM PRODUÇÃO)
        await new Promise(resolve => setTimeout(resolve, 2000))

        try {
            const response = await api.getAlldelivery(token) as any

            if (typeof response === 'object' && response !== null && 'message' in response && 'status' in response) {
                toast.error('Erro ao buscar dados do resumo', {
                    id: toastId,
                    description: response.message
                })
                setIsLoading(false)
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
                    if (delivery.status === 'CANCELLED') acc.totalCancelled++
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

                toast.success('Resumo carregado com sucesso', {
                    id: toastId,
                    description: `${deliveriesData.length} entrega(s) encontrada(s)`
                })
            } else if (Array.isArray(response)) {
                // Fallback caso a API retorne array direto
                setDeliveries(response)

                const totals = response.reduce((acc, delivery) => {
                    acc.totalDeliveries++
                    if (delivery.status === 'COMPLETED') acc.totalDelivered++
                    if (delivery.status === 'PENDING') acc.totalPending++
                    if (delivery.status === 'IN_PROGRESS') acc.totalPending++
                    if (delivery.status === 'CANCELLED') acc.totalCancelled++
                    return acc
                }, { totalDeliveries: 0, totalDelivered: 0, totalPending: 0, totalCancelled: 0 })

                setSummaryData({
                    ...totals,
                    deliveries: response.slice(0, 10).sort((a: any, b: any) => b.id - a.id)
                })

                toast.success('Resumo carregado', {
                    id: toastId,
                    description: `${response.length} entrega(s) encontrada(s)`
                })
            } else {
                toast.warning('Formato de resposta inesperado', {
                    id: toastId,
                    description: 'Os dados foram retornados em um formato não esperado'
                })
            }
        } catch (error) {
            toast.error('Erro ao buscar dados do resumo', {
                id: toastId,
                description: error instanceof Error ? error.message : 'Erro desconhecido'
            })
        } finally {
            setIsLoading(false)
        }
    }


    useEffect(() => {
        if (!loading && !token) {
            signOut({ callbackUrl: "/signin" })
            return
        }

        if (token && !hasFetched.current) {
            hasFetched.current = true
            fetchSummaryData()
        }
    }, [token, loading])




    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
            <div className="flex flex-col gap-4 border-2 border-primary rounded-lg p-4">
                <h1 className="text-2xl font-bold">Admin Home</h1>
                <p className="text-gray-600">Bem-vindo ao painel administrador</p>
            </div>
            <div className="flex flex-col-reverse md:flex-row gap-4 max-w-[1200px] mx-auto mt-4 ">
                <div className="w-full md:w-[70%] bg-red-300 p-4 rounded-lg">
                    <h1 className="text-2xl font-bold">Resumo</h1>
                    <p className="text-gray-600">Resumo do painel administrador</p>

                    <div className="space-y-6">
                        {summaryData && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/60 p-3 rounded-lg">
                                        <p className="text-sm text-gray-600">Total de entregas</p>
                                        {isLoading ? (
                                            <div className="h-8 bg-gray-200 rounded w-12 mt-1 animate-pulse"></div>
                                        ) : (
                                            <p className="text-2xl font-bold text-blue-600">{summaryData.totalDeliveries}</p>
                                        )}
                                    </div>
                                    <div className="bg-white/60 p-3 rounded-lg">
                                        <p className="text-sm text-gray-600">Concluídas</p>
                                        {isLoading ? (
                                            <div className="h-8 bg-gray-200 rounded w-12 mt-1 animate-pulse"></div>
                                        ) : (
                                            <p className="text-2xl font-bold text-green-600">{summaryData.totalDelivered}</p>
                                        )}
                                    </div>
                                    <div className="bg-white/60 p-3 rounded-lg">
                                        <p className="text-sm text-gray-600">Pendentes</p>
                                        {isLoading ? (
                                            <div className="h-8 bg-gray-200 rounded w-12 mt-1 animate-pulse"></div>
                                        ) : (
                                            <p className="text-2xl font-bold text-yellow-600">{summaryData.totalPending}</p>
                                        )}
                                    </div>
                                    <div className="bg-white/60 p-3 rounded-lg">
                                        <p className="text-sm text-gray-600">Canceladas</p>
                                        {isLoading ? (
                                            <div className="h-8 bg-gray-200 rounded w-12 mt-1 animate-pulse"></div>
                                        ) : (
                                            <p className="text-2xl font-bold text-red-600">{summaryData.totalCancelled}</p>
                                        )}
                                    </div>
                                </div>

                                {isLoading ? (
                                    <div className="mt-6">
                                        <h2 className="text-xl font-bold mb-3">Entregas Recentes</h2>
                                        <div className="overflow-x-auto">
                                            <table className="w-full bg-white/60 rounded-lg">
                                                <thead>
                                                    <tr className="border-b border-gray-300">
                                                        <th className="text-left p-3 font-semibold">Código</th>
                                                        <th className="text-left p-3 font-semibold">Cliente</th>
                                                        <th className="text-left p-3 font-semibold">Status</th>
                                                        <th className="text-left p-3 font-semibold">Valor</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {[1, 2, 3, 4, 5].map((i) => (
                                                        <tr key={i} className="border-b border-gray-200 animate-pulse">
                                                            <td className="p-3">
                                                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : summaryData.deliveries && summaryData.deliveries.length > 0 ? (
                                    <div className="mt-6">
                                        <h2 className="text-xl font-bold mb-3">Entregas Recentes</h2>
                                        <div className="overflow-x-auto">
                                            <table className="w-full bg-white/60 rounded-lg">
                                                <thead>
                                                    <tr className="border-b border-gray-300">
                                                        <th className="text-left p-3 font-semibold">Código</th>
                                                        <th className="text-left p-3 font-semibold">Cliente</th>
                                                        <th className="text-left p-3 font-semibold">Status</th>
                                                        <th className="text-left p-3 font-semibold">Valor</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {summaryData.deliveries.map((delivery) => (
                                                        <tr key={delivery.id} className="border-b border-gray-200 hover:bg-white/40 transition-colors">
                                                            <td className="p-3 font-mono text-sm">{delivery.code}</td>
                                                            <td className="p-3 text-sm">{delivery.email}</td>
                                                            <td className="p-3">
                                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${delivery.status === 'COMPLETED' ? 'bg-green-200 text-green-800' :
                                                                    delivery.status === 'IN_PROGRESS' ? 'bg-blue-200 text-blue-800' :
                                                                        delivery.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' :
                                                                            'bg-red-200 text-red-800'
                                                                    }`}>
                                                                    {delivery.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-3">R$ {delivery.price}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : null}
                            </>
                        )}
                    </div>


                </div>
                <div className="w-full md:w-[30%] bg-green-300 p-4 rounded-lg">gráficos</div>
            </div>
        </div>
    )
}