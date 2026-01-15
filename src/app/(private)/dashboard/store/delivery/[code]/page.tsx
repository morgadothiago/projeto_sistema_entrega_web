"use client"

import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/app/context"
import { useEffect, useState } from "react"
import api from "@/app/services/api"
import { toast } from "sonner"
import { ArrowLeft, Package, MapPin, User, Phone, Mail, Calendar, DollarSign, Ruler, Weight, AlertTriangle, Building2, Navigation, Truck, Clock, CheckCircle2, XCircle, Edit } from "lucide-react"
import { StatusBadge } from "@/app/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface Address {
  street: string
  number: string
  city: string
  state: string
  zipCode: string
  complement?: string
}

interface DeliveryDetail {
  id: number
  code: string
  status: string
  price: string
  createdAt?: string
  completedAt?: string

  // Dimensões e peso
  height?: number
  width?: number
  length?: number
  weight?: number
  isFragile: boolean
  information: string

  // Contato
  email: string
  telefone: string

  // Endereços
  ClientAddress: Address
  OriginAddress: Address

  // Outros
  vehicleType: string
  distance?: number
  Company: {
    name: string
    phone?: string
  }
  DeliveryMan?: {
    id: number
    name: string
    phone: string
    cpf: string
    Vehicle?: {
      licensePlate: string
      model: string
    }
  }
  [key: string]: any
}

export default function DeliveryDetailPage() {
  const { code } = useParams<{ code: string }>()
  const router = useRouter()
  const { token, loading: authLoading } = useAuth()
  const [delivery, setDelivery] = useState<DeliveryDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!token) {
      toast.error("Sessão expirada. Faça login novamente.")
      router.push("/signin")
      return
    }

    const fetchDeliveryDetail = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await api.getDeliveryDetail(code, token as string)

        if (response && typeof response === 'object' && 'status' in response && 'message' in response) {
          const rawMessage = (response as any).message
          const dataMessage = (response as any).data?.message

          let errorMsg = "Erro ao carregar detalhes da entrega"

          if (Array.isArray(rawMessage) && rawMessage.length > 0) {
            errorMsg = rawMessage.map(m => typeof m === 'string' ? m : m.message || JSON.stringify(m)).join(', ')
          } else if (Array.isArray(dataMessage) && dataMessage.length > 0) {
            errorMsg = dataMessage.map(m => typeof m === 'string' ? m : m.message || JSON.stringify(m)).join(', ')
          } else if (typeof rawMessage === 'string') {
            errorMsg = rawMessage
          } else if (typeof dataMessage === 'string') {
            errorMsg = dataMessage
          } else if ((response as any).data?.error) {
            errorMsg = (response as any).data.error
          }

          setError(`Não foi possível carregar a entrega "${code}": ${errorMsg}`)
          toast.error(errorMsg)
        } else if (response && typeof response === 'object') {
          setDelivery(response as DeliveryDetail)
        } else {
          setError('Formato de resposta inválido')
          toast.error('Formato de resposta inválido')
        }
      } catch (err: any) {
        setError(err?.message || "Erro ao carregar detalhes da entrega")
        toast.error("Erro ao carregar detalhes da entrega")
      } finally {
        setLoading(false)
      }
    }

    fetchDeliveryDetail()
  }, [code, token, authLoading, router])

  const normalizeStatus = (status?: string): "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "CANCELED" => {
    if (!status) return "PENDING"
    const normalized = status.toUpperCase()
    if (normalized.includes('PEND')) return "PENDING"
    if (normalized.includes('PROGRESS') || normalized.includes('ANDAMENTO')) return "IN_PROGRESS"
    if (normalized.includes('COMPLET') || normalized.includes('DELIV') || normalized.includes('CONCLU')) return "COMPLETED"
    if (normalized.includes('CANCEL')) return "CANCELLED"
    return "PENDING"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />
                <p className="text-sm text-gray-600">Carregando detalhes da entrega...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !delivery) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="rounded-full bg-red-50 p-4">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">Erro ao carregar entrega</p>
                  <p className="mt-1 text-sm text-gray-600">{error || "Entrega não encontrada"}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.back()}>
                  Voltar para lista
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || ""
    if (s.includes("pend")) return "bg-yellow-100 text-yellow-800 border-yellow-300"
    if (s.includes("deliv") || s.includes("concl")) return "bg-green-100 text-green-800 border-green-300"
    if (s.includes("cancel")) return "bg-red-100 text-red-800 border-red-300"
    return "bg-gray-100 text-gray-800 border-gray-300"
  }

  const formatAddress = (address?: Address) => {
    if (!address) return "—"
    const parts = [
      address.street && address.number ? `${address.street}, ${address.number}` : '',
      address.complement,
      address.city && address.state ? `${address.city} - ${address.state}` : '',
      address.zipCode ? `CEP: ${address.zipCode}` : ''
    ].filter(Boolean)
    return parts.join(', ') || "—"
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
        {/* Hero Card - Main Info */}
        <Card className="mb-6 border-0 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-8 text-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2 text-indigo-100">
                  <Package className="h-5 w-5" />
                  <span className="text-sm font-medium">Entrega</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">#{delivery.code}</h1>
                {delivery.Company && (
                  <div className="mt-3 flex items-center gap-2 text-indigo-100">
                    <Building2 className="h-4 w-4" />
                    <span className="text-sm">{delivery.Company.name}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-start gap-3 sm:items-end">
                <StatusBadge status={normalizeStatus(delivery.status)} />
                <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 backdrop-blur-sm">
                  <DollarSign className="h-5 w-5" />
                  <span className="text-2xl font-bold">R$ {delivery.price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <CardContent className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-3">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Veículo</p>
                <p className="text-sm font-semibold text-gray-900">{delivery.vehicleType || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-50 p-3">
                <Navigation className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Distância</p>
                <p className="text-sm font-semibold text-gray-900">{delivery.distance ? `${delivery.distance} km` : '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-50 p-3">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Criado em</p>
                <p className="text-sm font-semibold text-gray-900">{formatDate(delivery.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-50 p-3">
                {delivery.completedAt ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Clock className="h-5 w-5 text-amber-600" />
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {delivery.completedAt ? 'Concluído em' : 'Status'}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {delivery.completedAt ? formatDate(delivery.completedAt) : 'Em andamento'}
                </p>
              </div>
            </div>
          </CardContent>

          {delivery.isFragile && (
            <div className="border-t border-amber-200 bg-amber-50 px-6 py-3">
              <div className="flex items-center gap-2 text-amber-900">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Atenção: Este item é frágil e requer cuidados especiais</span>
              </div>
            </div>
          )}
        </Card>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Package Dimensions */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="rounded-lg bg-indigo-50 p-2">
                  <Ruler className="h-5 w-5 text-indigo-600" />
                </div>
                Dimensões e Peso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">Altura</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {delivery.height ? `${delivery.height}cm` : '—'}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">Largura</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {delivery.width ? `${delivery.width}cm` : '—'}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">Comprimento</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {delivery.length ? `${delivery.length}cm` : '—'}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <Weight className="h-3 w-3" />
                    Peso
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {delivery.weight ? `${delivery.weight}kg` : '—'}
                  </p>
                </div>
              </div>
              {delivery.information && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Informações Adicionais</p>
                    <p className="mt-2 text-sm text-gray-600">{delivery.information}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="rounded-lg bg-indigo-50 p-2">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
                Contato do Destinatário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 rounded-lg border border-gray-200 p-4">
                <div className="rounded-lg bg-blue-50 p-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500">Email</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 break-all">
                    {delivery.email || '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-lg border border-gray-200 p-4">
                <div className="rounded-lg bg-green-50 p-2">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500">Telefone</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {delivery.telefone || '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Man Info */}
          <Card className="border-0 shadow-sm w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="rounded-lg bg-indigo-50 p-2">
                  <Truck className="h-5 w-5 text-indigo-600" />
                </div>
                Entregador Responsável
              </CardTitle>
            </CardHeader>
            <CardContent>
              {delivery.DeliveryMan ? (
                <div className="space-y-4 ">
                  <div className="flex items-start gap-4 rounded-lg border border-gray-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
                    <div className="rounded-full bg-indigo-100 p-3">
                      <User className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-gray-900">
                        {delivery.DeliveryMan.name}
                      </p>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{delivery.DeliveryMan.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-3.5 w-3.5" />
                          <span>CPF: {delivery.DeliveryMan.cpf}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-3.5 w-3.5" />
                          <span>Telefone: {delivery.DeliveryMan.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {delivery.DeliveryMan.Vehicle && (
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Truck className="h-4 w-4" />
                        Veículo
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Modelo:</span> {delivery.DeliveryMan.Vehicle.model}
                        </p>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Placa:</span> {delivery.DeliveryMan.Vehicle.licensePlate}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                  <div className="rounded-full bg-gray-100 p-4 mb-3">
                    <Truck className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    Nenhum entregador atribuído
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Esta entrega ainda não foi designada a um entregador
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Origin Address */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="rounded-lg bg-indigo-50 p-2">
                  <Navigation className="h-5 w-5 text-indigo-600" />
                </div>
                Endereço de Origem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <MapPin className="h-5 w-5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatAddress(delivery.OriginAddress)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Destination Address */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="rounded-lg bg-indigo-50 p-2">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                </div>
                Endereço de Destino
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <MapPin className="h-5 w-5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatAddress(delivery.ClientAddress)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
