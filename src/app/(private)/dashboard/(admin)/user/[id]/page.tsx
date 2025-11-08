"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import api from "@/app/services/api"
import { useAuth } from "@/app/context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Loader2,
  UserIcon,
  Store,
  MapPin,
  Mail,
  Shield,
  Activity,
  Building2,
  FileText,
  Phone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { User } from "@/app/types/User"
import { EStatus } from "@/app/types/User"
import AddressDisplay from "@/app/components/AndressDisplay"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function UserDetailPage() {
  const { id } = useParams()

  const { token } = useAuth()
  const [userDetail, setUserDetail] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!token) return
    const fetchUser = async () => {
      try {
        if (!id) throw new Error("ID do usuário não encontrado")
        const response = await api.getUser(id.toString(), token)
        console.log(response)
        if (response.status === 500) {
          toast.error("Usuário não encontrado", {
            description:
              "Ocorreu um erro ao buscar os dados do usuário. Por favor, tente novamente mais tarde.",
            duration: 3000,
            position: "top-right",
            richColors: true,
          })
          setUserDetail(null)
        }

        if (response.status === 404) {
          toast.error("Usuário não encontrado", {
            description:
              "Ocorreu um erro ao buscar os dados do usuário. Por favor, tente novamente mais tarde.",
            duration: 3000,
            position: "top-right",
            richColors: true,
          })
          setUserDetail(null)

          return
        }

        setUserDetail(response as User)
      } catch (error: unknown) {
        setUserDetail(null)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [id, token])

  const handleStatusChange = async (newStatus: EStatus) => {
    if (!userDetail || !token) return

    setStatusLoading(true)
    try {
      // Aqui você pode adicionar a chamada da API para atualizar o status
      // const response = await api.updateUserStatus(userDetail.id, newStatus, token)

      // Por enquanto, vamos apenas atualizar o estado local
      setUserDetail((prev) => (prev ? { ...prev, status: newStatus } : null))

      toast.success("Status atualizado com sucesso!", {
        description: `Status do usuário foi alterado para ${newStatus}`,
        duration: 3000,
        position: "top-right",
        richColors: true,
      })
    } catch (error) {
      toast.error("Erro ao atualizar status", {
        description:
          "Não foi possível atualizar o status do usuário. Tente novamente.",
        duration: 3000,
        position: "top-right",
        richColors: true,
      })
    } finally {
      setStatusLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-white/50 backdrop-blur-sm">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#003873]/20 to-[#5DADE2]/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative z-10 p-4 bg-white/80 rounded-full shadow-lg">
            <Loader2 className="w-12 h-12 animate-spin text-[#003873]" />
          </div>
        </div>
        <div className="mt-8 space-y-3 text-center">
          <span className="text-[#2C3E50] font-semibold text-xl animate-pulse">
            Carregando dados do usuário...
          </span>
          <p className="text-sm text-gray-500 max-w-sm">
            Estamos buscando as informações mais recentes. Isso pode levar
            alguns segundos.
          </p>
        </div>
      </div>
    )
  }

  if (!userDetail) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <Card className="border border-gray-200 shadow-xl rounded-2xl bg-white/90 backdrop-blur-md">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
              <div className="p-4 bg-red-50 rounded-full">
                <UserIcon className="w-12 h-12 text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Usuário não encontrado
                </h3>
                <p className="text-gray-500">
                  Não foi possível encontrar o usuário solicitado. Verifique se
                  o ID está correto ou tente novamente mais tarde.
                </p>
              </div>
              <Button
                variant="default"
                onClick={() => router.push("/dashboard/user/")}
                className="bg-[#003873] hover:bg-[#003873]/90 text-white transition-colors duration-300 px-6"
              >
                Voltar para Lista de Usuários
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="flex flex-col lg:flex-row gap-8 px-6 py-10 pb-12 max-w-screen-xl mx-auto">
        {/* User Details Card */}
        <div className="w-full lg:w-1/3 xl:w-1/4">
          <Card className="border border-gray-200 shadow-xl rounded-2xl bg-white/90 backdrop-blur-md hover:shadow-[#5DADE2]/20 transition-all duration-500 sticky top-24">
            <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-white border-b">
              <CardTitle className="text-[#003873] text-lg sm:text-xl flex items-center gap-2">
                <UserIcon className="w-6 h-6 text-[#5DADE2]" /> Informações do
                Usuário
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-[#5DADE2]" /> ID do Usuário
                </span>
                <span className="text-gray-900 font-mono text-base bg-gray-50 p-2 rounded-md">
                  #{userDetail.id}
                </span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#5DADE2]" /> Email
                </span>
                <span className="text-gray-900 break-all text-base bg-gray-50 p-2 rounded-md">
                  {userDetail.email}
                </span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#5DADE2]" /> Perfil
                </span>
                <span className="text-gray-900 text-base bg-gray-50 p-2 rounded-md">
                  {userDetail.role ?? "Usuário"}
                </span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#5DADE2]" /> Status
                </span>
                <Select
                  value={userDetail.status ?? EStatus.ACTIVE}
                  onValueChange={handleStatusChange}
                  disabled={statusLoading}
                >
                  <SelectTrigger className="text-gray-900 text-base bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EStatus.ACTIVE}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Ativo
                      </div>
                    </SelectItem>
                    <SelectItem value={EStatus.INACTIVE}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        Inativo
                      </div>
                    </SelectItem>
                    <SelectItem value={EStatus.BLOCKED}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Bloqueado
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Container para Company e Address */}
        {userDetail.Company && (
          <div className="flex flex-col gap-8 w-full lg:w-2/3 xl:w-3/4">
            {/* Company Details Card */}
            <Card className="border border-gray-200 shadow-xl rounded-2xl bg-white/90 backdrop-blur-md hover:shadow-[#5DADE2]/20 transition-all duration-500">
              <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-white border-b">
                <CardTitle className="text-[#003873] text-lg sm:text-xl flex items-center gap-2">
                  <Store className="w-6 h-6 text-[#5DADE2]" /> Informações da
                  Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-6">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#5DADE2]" /> Nome da
                    Empresa
                  </span>
                  <span className="text-gray-900 text-base bg-gray-50 p-2 rounded-md">
                    {userDetail.Company.name}
                  </span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#5DADE2]" /> CNPJ
                  </span>
                  <span className="text-gray-900 text-base bg-gray-50 p-2 rounded-md font-mono">
                    {userDetail.Company.cnpj}
                  </span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#5DADE2]" /> Telefone
                  </span>
                  <span className="text-gray-900 text-base bg-gray-50 p-2 rounded-md">
                    {userDetail.Company.phone}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Address Info Card */}
            {userDetail.Company.Adress && (
              <Card className="border border-gray-200 shadow-xl rounded-2xl bg-white/90 backdrop-blur-sm hover:shadow-[#5DADE2]/20 transition-all duration-500">
                <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-white border-b">
                  <CardTitle className="text-[#003873] text-lg sm:text-xl flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-[#5DADE2]" /> Endereço
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 text-base text-gray-900">
                  <AddressDisplay Adress={userDetail.Company.Adress} />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
