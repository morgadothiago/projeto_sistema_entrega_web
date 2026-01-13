"use client"

import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/app/context"
import { useEffect, useState } from "react"
import api from "@/app/services/api"
import { toast } from "sonner"
import { ArrowLeft, Package, MapPin, User, Phone, Mail, Calendar, DollarSign, Ruler, Weight, AlertTriangle, Building2, Navigation } from "lucide-react"

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

        console.log('🔍 Fetching delivery details for code:', code)
        const response = await api.getDeliveryDetail(code, token as string)

        console.log('📦 API Response:', response)
        console.log('📦 Response type:', typeof response)

        if (response && typeof response === 'object' && 'status' in response && 'message' in response) {
          // Error response - extract message properly
          const rawMessage = (response as any).message
          const dataMessage = (response as any).data?.message

          let errorMsg = "Erro ao carregar detalhes da entrega"

          // Handle array messages (common in validation errors)
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

          console.error('❌ Error response:', errorMsg)
          setError(`Não foi possível carregar a entrega "${code}": ${errorMsg}`)
          toast.error(errorMsg)
        } else if (response && typeof response === 'object') {
          console.log('✅ Setting delivery data:', response)
          setDelivery(response as DeliveryDetail)
        } else {
          console.error('⚠️ Unexpected response format:', response)
          setError('Formato de resposta inválido')
          toast.error('Formato de resposta inválido')
        }
      } catch (err: any) {
        console.error('💥 Exception caught:', err)
        setError(err?.message || "Erro ao carregar detalhes da entrega")
        toast.error("Erro ao carregar detalhes da entrega")
      } finally {
        setLoading(false)
      }
    }

    fetchDeliveryDetail()
  }, [code, token, authLoading, router])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando detalhes...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !delivery) {
    return (
      <div className="container mx-auto p-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error || "Entrega não encontrada"}</p>
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
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Detalhes da Entrega</h1>
      </div>

      {/* Status Badge and Company */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(delivery.status)}`}>
          {delivery.status}
        </span>
        {delivery.Company && (
          <div className="flex items-center gap-2 text-gray-700">
            <Building2 size={18} />
            <span className="font-medium">{delivery.Company.name}</span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Main Info Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Package className="text-indigo-600" size={24} />
            Informações Principais
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Código</p>
              <p className="text-lg font-semibold text-indigo-600">{delivery.code}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Preço</p>
              <p className="text-lg font-semibold text-green-600 flex items-center gap-1">
                <DollarSign size={18} />
                R$ {delivery.price}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tipo de Veículo</p>
              <p className="text-gray-900">{delivery.vehicleType || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Distância</p>
              <p className="text-gray-900 font-medium">{delivery.distance ? `${delivery.distance} km` : '—'}</p>
            </div>
            {delivery.isFragile && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-2">
                <AlertTriangle size={18} />
                <span className="font-medium">Item Frágil</span>
              </div>
            )}
          </div>
        </div>

        {/* Package Dimensions */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Ruler className="text-indigo-600" size={24} />
            Dimensões e Peso
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Altura</p>
              <p className="text-gray-900">{delivery.height ? `${delivery.height} cm` : '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Largura</p>
              <p className="text-gray-900">{delivery.width ? `${delivery.width} cm` : '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Comprimento</p>
              <p className="text-gray-900">{delivery.length ? `${delivery.length} cm` : '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Weight size={14} />
                Peso
              </p>
              <p className="text-gray-900">{delivery.weight ? `${delivery.weight} kg` : '—'}</p>
            </div>
          </div>
          {delivery.information && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">Informações Adicionais</p>
              <p className="text-gray-900 text-sm mt-1">{delivery.information}</p>
            </div>
          )}
        </div>

        {/* Origin Address */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Navigation className="text-indigo-600" size={24} />
            Endereço de Origem
          </h2>
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-gray-400 mt-1 flex-shrink-0" />
            <p className="text-gray-900">{formatAddress(delivery.OriginAddress)}</p>
          </div>
        </div>

        {/* Destination Address */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="text-indigo-600" size={24} />
            Endereço de Destino
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-gray-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Endereço</p>
                <p className="text-gray-900">{formatAddress(delivery.ClientAddress)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="text-indigo-600" size={24} />
            Contato do Destinatário
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Mail size={18} className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">{delivery.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone size={18} className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Telefone</p>
                <p className="text-gray-900">{delivery.telefone || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="text-indigo-600" size={24} />
            Linha do Tempo
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Criado em</p>
              <p className="text-gray-900">{formatDate(delivery.createdAt)}</p>
            </div>
            {delivery.completedAt && (
              <div>
                <p className="text-sm text-gray-500">Concluído em</p>
                <p className="text-gray-900">{formatDate(delivery.completedAt)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
