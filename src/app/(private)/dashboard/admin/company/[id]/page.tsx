"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown, ArrowLeft, Loader2 } from "lucide-react"
import { User, EStatus } from "@/app/types/User"
import api from "@/app/services/api"

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Ativo" },
  { value: "INACTIVE", label: "Inativo" },
  { value: "BLOCKED", label: "Bloqueado" },
  { value: "NO_DOCUMENTS", label: "Sem Documentos" },
]

const STATUS_BADGES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-gray-100 text-gray-800",
  BLOCKED: "bg-red-100 text-red-800",
  NO_DOCUMENTS: "bg-yellow-100 text-yellow-800",
}

export default function CompanyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const companyId = params.id as string

  const [company, setCompany] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [information, setInformation] = useState<string>("")

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!session?.token || !companyId) return

      try {
        setLoading(true)
        const response = await api.getUser(companyId, session.token)

        if ("status" in response && typeof response.status === "number" && response.status >= 400) {
          const errorResponse = response as any
          toast.error("Erro ao carregar dados", {
            description: errorResponse.message || "Não foi possível carregar os dados da empresa",
          })
          return
        }

        const userData = response as User
        setCompany(userData)
        setSelectedStatus(userData.status as string)
        setInformation(userData.information || "")
      } catch (error) {
        toast.error("Erro ao carregar empresa")
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyDetails()
  }, [companyId, session])

  const handleStatusUpdate = async () => {
    if (!session?.token || !companyId) return

    if (selectedStatus === company?.status && information === (company?.information || "")) {
      toast.error("Nenhuma alteração detectada")
      return
    }

    try {
      setUpdating(true)

      const response = await api.updateCompanyStatus(
        companyId,
        selectedStatus,
        information,
        session.token
      )

      console.log(response)

      if (response && "status" in response && typeof response.status === "number" && response.status >= 400) {
        const errorResponse = response as any
        toast.error("Erro ao atualizar status", {
          description: errorResponse.message || "Não foi possível atualizar o status",
        })
        return
      }

      toast.success("Status atualizado!", {
        description: "O status da empresa foi atualizado com sucesso",
      })

      // Atualiza localmente
      if (company) {
        setCompany({
          ...company,
          status: selectedStatus as EStatus,
          information,
        })
      }
    } catch (error) {
      toast.error("Erro ao atualizar status")
    } finally {
      setUpdating(false)
    }
  }

  const getStatusLabel = (status: string) => {
    return STATUS_OPTIONS.find((opt) => opt.value === status)?.label || status
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-gray-600">Empresa não encontrada</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {company.Company?.name || company.name || "Sem nome"}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_BADGES[company.status as string] || "bg-gray-100 text-gray-800"
                }`}
            >
              {getStatusLabel(company.status as string)}
            </span>
          </div>

          <div className="mt-2 flex gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Empresa
            </span>
          </div>
        </div>

        {/* Informações Básicas */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">INFORMAÇÕES BÁSICAS</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">ID</Label>
                <p className="text-base font-medium text-gray-900">#{company.id}</p>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Email</Label>
                <p className="text-base font-medium text-gray-900">{company.email}</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2">Status</Label>
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  disabled={updating}
                  className={`
                    w-full md:w-auto
                    h-12 px-4 pr-10
                    text-base
                    bg-white
                    border-2 border-gray-200
                    rounded-xl
                    shadow-sm hover:shadow-md
                    transition-all duration-200
                    focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20
                    focus:outline-none
                    appearance-none
                    cursor-pointer
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2">Observações</Label>
              <Textarea
                value={information}
                onChange={(e) => setInformation(e.target.value)}
                disabled={updating}
                placeholder="Digite observações sobre o status..."
                rows={3}
                className="w-full border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50"
              />
            </div>

            <Button
              onClick={handleStatusUpdate}
              disabled={updating}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {updating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </div>
        </div>

        {/* Dados da Empresa */}
        {company.Company && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">DADOS DA EMPRESA</h2>

            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-600">Nome</Label>
                <p className="text-base font-medium text-gray-900">{company.Company.name}</p>
              </div>

              {company.Company.cnpj && (
                <div>
                  <Label className="text-sm text-gray-600">CNPJ</Label>
                  <p className="text-base font-medium text-gray-900">{company.Company.cnpj}</p>
                </div>
              )}

              {company.Company.phone && (
                <div>
                  <Label className="text-sm text-gray-600">Telefone</Label>
                  <p className="text-base font-medium text-gray-900">{company.Company.phone}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
