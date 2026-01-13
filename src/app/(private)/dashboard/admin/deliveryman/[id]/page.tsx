"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import api from "@/app/services/api"
import { useAuth } from "@/app/context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Loader2,
  UserIcon,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { User } from "@/app/types/User"
import { EStatus, ERole } from "@/app/types/User"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DeliverymanStats {
  totalDeliveries: number
  deliveriesInProgress: number
  completedDeliveries: number
  cancelledDeliveries: number
  averageRating: number
  totalEarnings: number
}

interface Transaction {
  id: number
  type: string
  amount: number
  description: string
  createdAt: string
}

interface DeliverymanBalance {
  currentBalance: number
  totalEarned: number
  totalWithdrawn: number
  transactions: Transaction[]
}

interface DeliveryReport {
  date: string
  deliveries: number
  earnings: number
}

interface DeliverymanReports {
  weeklyReports: DeliveryReport[]
  totalDeliveries: number
  totalEarnings: number
}

export default function DeliverymanDetailPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const [userDetail, setUserDetail] = useState<User | null>(null)
  const [stats, setStats] = useState<DeliverymanStats | null>(null)
  const [balance, setBalance] = useState<DeliverymanBalance | null>(null)
  const [reports, setReports] = useState<DeliverymanReports | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!token || !id) return

    let cancelled = false
    const controller = new AbortController()

    const fetchDeliverymanData = async () => {
      try {
        if (!id) throw new Error("ID do entregador não encontrado")

        const userResponse = await api.getUser(id.toString(), token)

        // Verificar se a resposta é um erro
        if ('status' in userResponse && 'message' in userResponse) {
          toast.error(userResponse.message || "Erro ao carregar usuário")
          setUserDetail(null)
          setLoading(false)
          return
        }

        if (cancelled) return
        setUserDetail(userResponse as User)

        // Buscar estatísticas se for entregador (com delay de 1 segundo entre requisições)
        if ((userResponse as User).role === ERole.DELIVERY) {
          // Delay de 1 segundo antes da primeira requisição adicional
          await new Promise(resolve => setTimeout(resolve, 1000))

          try {
            if (cancelled) return
            const statsResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_HOST}/deliveryman/${id}/stats`,
              {
                headers: { Authorization: `Bearer ${token}` },
                signal: controller.signal,
              }
            )
            if (statsResponse.ok) {
              const statsData = await statsResponse.json()
              if (!cancelled) setStats(statsData)
            } else if (statsResponse.status === 404) {
              // Estatísticas não disponíveis
            } else if (statsResponse.status === 429) {
              // Rate limit atingido para estatísticas
            }
          } catch (error: any) {
            if (error.name !== 'AbortError') {
            }
          }

          // Delay de 1 segundo entre requisições
          await new Promise(resolve => setTimeout(resolve, 1000))

          try {
            if (cancelled) return
            const balanceResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_HOST}/deliveryman/${id}/balance`,
              {
                headers: { Authorization: `Bearer ${token}` },
                signal: controller.signal,
              }
            )
            if (balanceResponse.ok) {
              const balanceData = await balanceResponse.json()
              if (!cancelled) setBalance(balanceData)
            } else if (balanceResponse.status === 404) {
              // Saldo não disponível
            } else if (balanceResponse.status === 429) {
              // Rate limit atingido para saldo
            }
          } catch (error: any) {
            if (error.name !== 'AbortError') {
            }
          }

          // Delay de 1 segundo entre requisições
          await new Promise(resolve => setTimeout(resolve, 1000))

          try {
            if (cancelled) return
            const reportsResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_HOST}/deliveryman/${id}/reports`,
              {
                headers: { Authorization: `Bearer ${token}` },
                signal: controller.signal,
              }
            )
            if (reportsResponse.ok) {
              const reportsData = await reportsResponse.json()
              if (!cancelled) setReports(reportsData)
            } else if (reportsResponse.status === 404) {
              // Relatórios não disponíveis
            } else if (reportsResponse.status === 429) {
              // Rate limit atingido para relatórios
            }
          } catch (error: any) {
            if (error.name !== 'AbortError') {
            }
          }
        }
      } catch (error) {
        toast.error("Erro ao carregar dados do usuário")
        setUserDetail(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDeliverymanData()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [id, token])

  const handleStatusChange = async (newStatus: EStatus) => {
    if (!userDetail || !token || newStatus === userDetail.status) return

    setStatusLoading(true)
    try {
      if (!id) return

      const response = await api.updateUserStatus(id.toString(), newStatus, token)

      // Verificação de erro
      if (response && typeof response === 'object' && 'status' in response && (response as any).status >= 400) {
        const errorResponse = response as any
        if (errorResponse.status === 429) {
          toast.error("Muitas requisições. Aguarde um momento e tente novamente.")
          return
        }
        throw new Error(errorResponse.message || "Erro ao atualizar status")
      }

      setUserDetail((prev) => (prev ? { ...prev, status: newStatus } : null))
      toast.success("Status atualizado com sucesso")
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar status")
    } finally {
      setStatusLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!userDetail) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <UserIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Usuário não encontrado</h3>
            <Button
              onClick={() => router.push("/dashboard/admin/deliveryman")}
              variant="outline"
              className="mt-4"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const InfoRow = ({ label, value }: { label: string; value: string | number | undefined | null }) => {
    if (!value) return null
    return (
      <div className="flex py-3 border-b border-gray-100 last:border-0">
        <dt className="text-sm font-medium text-gray-500 w-1/3">{label}</dt>
        <dd className="text-sm text-gray-900 w-2/3">{value}</dd>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/admin/deliveryman")}
          className="mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Card>
          <CardHeader className="border-b">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">
                  {userDetail.name || userDetail.DeliveryMan?.name || userDetail.Company?.name || userDetail.email}
                </CardTitle>
                <div className="flex items-center gap-3 text-sm">
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {userDetail.role === "DELIVERY" && "Entregador"}
                    {userDetail.role === "COMPANY" && "Empresa"}
                    {userDetail.role === "ADMIN" && "Administrador"}
                    {!["DELIVERY", "COMPANY", "ADMIN"].includes(userDetail.role as string) && userDetail.role}
                  </span>
                  <span className={`px-2 py-1 rounded ${userDetail.status === "ACTIVE" ? 'bg-green-100 text-green-700' :
                      userDetail.status === "INACTIVE" ? 'bg-gray-100 text-gray-700' :
                        userDetail.status === "NO_DOCUMENTS" ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                    }`}>
                    {userDetail.status === "ACTIVE" && "Ativo"}
                    {userDetail.status === "INACTIVE" && "Inativo"}
                    {userDetail.status === "BLOCKED" && "Bloqueado"}
                    {userDetail.status === "NO_DOCUMENTS" && "Sem Documentos"}
                    {!userDetail.status && `Status: ${userDetail.status || 'não definido'}`}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Informações Básicas */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Informações Básicas</h3>
              <dl className="divide-y divide-gray-100">
                <InfoRow label="ID" value={`#${userDetail.id}`} />
                <InfoRow label="Email" value={userDetail.email} />
                <InfoRow
                  label="Criado em"
                  value={userDetail.createdAt ? new Date(userDetail.createdAt).toLocaleDateString('pt-BR') : null}
                />
                <InfoRow
                  label="Atualizado em"
                  value={userDetail.updatedAt ? new Date(userDetail.updatedAt).toLocaleDateString('pt-BR') : null}
                />
                <div className="flex py-3 border-b border-gray-100 last:border-0">
                  <dt className="text-sm font-medium text-gray-500 w-1/3">Status</dt>
                  <dd className="text-sm w-2/3">
                    <Select
                      value={userDetail.status}
                      onValueChange={handleStatusChange}
                      disabled={statusLoading}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Ativo</SelectItem>
                        <SelectItem value="INACTIVE">Inativo</SelectItem>
                        <SelectItem value="BLOCKED">Bloqueado</SelectItem>
                        <SelectItem value="NO_DOCUMENTS">Sem Documentos</SelectItem>
                      </SelectContent>
                    </Select>
                  </dd>
                </div>
                {userDetail.information && <InfoRow label="Observações" value={userDetail.information} />}
              </dl>
            </div>

            {/* Dados da Empresa */}
            {userDetail?.Company && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Dados da Empresa</h3>
                <dl className="divide-y divide-gray-100">
                  <InfoRow label="Nome" value={userDetail.Company.name} />
                  <InfoRow label="CNPJ" value={userDetail.Company.cnpj} />
                  <InfoRow label="Telefone" value={userDetail.Company.phone} />
                  {userDetail.Company.Adress && (
                    <>
                      <InfoRow
                        label="Endereço"
                        value={`${userDetail.Company.Adress.street}, ${userDetail.Company.Adress.number}`}
                      />
                      <InfoRow
                        label="Cidade/Estado"
                        value={`${userDetail.Company.Adress.city} - ${userDetail.Company.Adress.state}`}
                      />
                      <InfoRow label="CEP" value={userDetail.Company.Adress.zipCode} />
                    </>
                  )}
                </dl>
              </div>
            )}

            {/* Dados do Entregador */}
            {userDetail?.DeliveryMan && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Dados do Entregador</h3>
                <dl className="divide-y divide-gray-100">
                  <InfoRow label="Nome Completo" value={userDetail.DeliveryMan.name} />
                  <InfoRow label="CPF" value={userDetail.DeliveryMan.cpf} />
                  <InfoRow
                    label="Data de Nascimento"
                    value={userDetail.DeliveryMan.dob ? new Date(userDetail.DeliveryMan.dob).toLocaleDateString('pt-BR') : null}
                  />
                  <InfoRow label="Telefone" value={userDetail.DeliveryMan.phone} />
                  {userDetail.DeliveryMan.Address && (
                    <>
                      <InfoRow
                        label="Endereço"
                        value={`${userDetail.DeliveryMan.Address.street}, ${userDetail.DeliveryMan.Address.number}`}
                      />
                      <InfoRow
                        label="Cidade/Estado"
                        value={`${userDetail.DeliveryMan.Address.city} - ${userDetail.DeliveryMan.Address.state}`}
                      />
                      <InfoRow label="CEP" value={userDetail.DeliveryMan.Address.zipCode} />
                    </>
                  )}
                  {userDetail.DeliveryMan.Vehicle && (
                    <>
                      <InfoRow label="Veículo - Tipo" value={userDetail.DeliveryMan.Vehicle.Type?.type} />
                      <InfoRow label="Veículo - Marca" value={userDetail.DeliveryMan.Vehicle.brand} />
                      <InfoRow label="Veículo - Modelo" value={userDetail.DeliveryMan.Vehicle.model} />
                      <InfoRow label="Veículo - Placa" value={userDetail.DeliveryMan.Vehicle.licensePlate} />
                      <InfoRow label="Veículo - Ano" value={userDetail.DeliveryMan.Vehicle.year} />
                      <InfoRow label="Veículo - Cor" value={userDetail.DeliveryMan.Vehicle.color} />
                    </>
                  )}
                </dl>
              </div>
            )}

            {/* Saldo */}
            {balance && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Informações Financeiras</h3>
                <dl className="divide-y divide-gray-100">
                  <InfoRow label="Saldo Atual" value={`R$ ${balance.currentBalance?.toFixed(2) || '0.00'}`} />
                  <InfoRow label="Total Ganho" value={`R$ ${balance.totalEarned?.toFixed(2) || '0.00'}`} />
                  <InfoRow label="Total Sacado" value={`R$ ${balance.totalWithdrawn?.toFixed(2) || '0.00'}`} />
                </dl>
              </div>
            )}

            {/* Estatísticas */}
            {stats && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Estatísticas</h3>
                <dl className="divide-y divide-gray-100">
                  <InfoRow label="Total de Entregas" value={stats.totalDeliveries} />
                  <InfoRow label="Em Andamento" value={stats.deliveriesInProgress} />
                  <InfoRow label="Concluídas" value={stats.completedDeliveries} />
                  <InfoRow label="Canceladas" value={stats.cancelledDeliveries} />
                  <InfoRow label="Avaliação Média" value={stats.averageRating?.toFixed(1)} />
                  <InfoRow label="Total de Ganhos" value={`R$ ${stats.totalEarnings?.toFixed(2) || '0.00'}`} />
                </dl>
              </div>
            )}

            {/* Transações */}
            {balance?.transactions && balance.transactions.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Transações Recentes</h3>
                <div className="space-y-2">
                  {balance.transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <span className={`text-sm font-semibold ${transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {transaction.type === 'CREDIT' ? '+' : '-'}R$ {transaction.amount?.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Relatórios */}
            {reports?.weeklyReports && reports.weeklyReports.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Relatório Semanal</h3>
                <div className="space-y-2">
                  {reports.weeklyReports.map((report, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(report.date).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-gray-500">{report.deliveries} entregas</p>
                      </div>
                      <span className="text-sm font-semibold text-green-600">
                        R$ {report.earnings?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  ))}
                </div>
                <dl className="divide-y divide-gray-100 mt-4 pt-4 border-t">
                  <InfoRow label="Total de Entregas" value={reports.totalDeliveries} />
                  <InfoRow label="Total Ganho" value={`R$ ${reports.totalEarnings?.toFixed(2) || '0.00'}`} />
                </dl>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
