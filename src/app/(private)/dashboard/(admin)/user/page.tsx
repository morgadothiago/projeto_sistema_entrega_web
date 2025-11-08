"use client"

import { useAuth } from "@/app/context"
import api from "@/app/services/api"
import { IUserPaginate, type ERole, type EStatus } from "@/app/types/User"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Ban,
  CheckCircle2,
  CircleOff,
  UserCog,
  Store,
  Car,
  Eye,
  Activity,
  Search,
  ArrowLeft,
  ArrowRight,
  Users,
  Mail,
  Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"

import React, { useEffect, useState } from "react"
import { toast } from "sonner"

const User: React.FC = () => {
  const limit = 10

  const [users, setUsers] = useState<IUserPaginate[]>([])
  const [isLoading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(1)
  const [filter, setFilter] = useState<{
    role?: ERole
    status?: EStatus
    email?: string
  }>({})
  const [lastPage, setLastPage] = useState(1)
  const { token, user: currentUser } = useAuth()
  const router = useRouter()

  function nextPage() {
    setPage((currentPage) =>
      currentPage < lastPage ? currentPage + 1 : currentPage
    )
  }

  function previousPage() {
    setPage((currentPage) =>
      currentPage - 1 > 0 ? currentPage - 1 : currentPage
    )
  }

  useEffect(() => {
    if (!token) return

    setLoading(true)

    const fetchUsers = async () => {
      try {
        const response = await api.getUsers(
          {
            page,
            ...filter,
            limit,
          },
          token
        )

        if (
          response &&
          typeof response === "object" &&
          "data" in response &&
          Array.isArray(response.data) &&
          "currentPage" in response &&
          "totalPage" in response &&
          "total" in response
        ) {
          setUsers(response.data)
          setPage(response.currentPage)
          setLastPage(response.totalPage)
          setTotal(response.total)
        } else if (
          response &&
          typeof response === "object" &&
          "status" in response &&
          response.status === 401
        ) {
          toast.error("Sessão expirada. Por favor, faça login novamente.")
        } else {
          toast.error("Erro ao carregar usuários. Resposta inesperada.")
        }
      } catch (error) {
        console.error("Erro ao buscar usuários:", error)
        toast.error("Erro ao carregar usuários")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [token, filter, page])

  function onSubmit(data: FormData) {
    const email = data.get("mail")?.toString() || ""
    const status = data.get("status")?.toString() || ""
    const role = data.get("role")?.toString() || ""

    setPage(1)
    setFilter(() => ({
      ...(email && { email }),
      ...(status &&
        status !== "" &&
        status !== "ALL" && { status: status as EStatus }),
      ...(role && role !== "" && role !== "ALL" && { role: role as ERole }),
    }))
  }

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!token) {
      toast.error("Token não disponível. Faça login novamente.")
      return
    }

    // Verificar se o usuário está tentando deletar a si mesmo
    if (currentUser?.id === userId) {
      toast.error("Você não pode deletar sua própria conta!")
      return
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja deletar o usuário "${userName}"?\n\nEsta ação não pode ser desfeita.`
    )

    if (!confirmed) return

    try {
      setLoading(true)
      const response = await api.deleteUser(userId.toString(), token)

      if (response && typeof response === "object" && "status" in response) {
        if (response.status === 401) {
          toast.error("Sessão expirada. Por favor, faça login novamente.")
        } else {
          toast.error(response.message || "Erro ao deletar usuário")
        }
      } else {
        toast.success(`Usuário "${userName}" foi deletado com sucesso!`)

        // Recarregar a lista de usuários
        const currentFilters = { page, ...filter, limit }
        const updatedResponse = await api.getUsers(currentFilters, token)

        if (
          updatedResponse &&
          typeof updatedResponse === "object" &&
          "data" in updatedResponse &&
          Array.isArray(updatedResponse.data) &&
          "total" in updatedResponse &&
          "totalPage" in updatedResponse
        ) {
          setUsers(updatedResponse.data)
          setTotal(updatedResponse.total)
          setLastPage(updatedResponse.totalPage)
        }
      }
    } catch (error) {
      console.error("Erro ao deletar usuário:", error)
      toast.error("Erro ao deletar usuário. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 mb-8 backdrop-blur-sm bg-opacity-90">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#003873] to-[#0056b3] bg-clip-text text-transparent mb-2">
              Gerenciamento de Usuários
            </h1>
            <p className="text-gray-600 text-lg">
              Gerencie e monitore todos os usuários do sistema
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
            <Users className="w-5 h-5 text-[#003873]" />
            <span className="text-gray-700 font-medium">{total} usuários</span>
          </div>
        </div>

        <form
          action={onSubmit}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end"
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="mail"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              E-mail
            </label>
            <Input
              type="email"
              name="mail"
              id="mail"
              className="h-11 border-gray-200 focus:ring-2 focus:ring-[#003873] focus:border-[#003873] transition-all rounded-xl"
              defaultValue={filter.email || ""}
              placeholder="Buscar por e-mail"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Status
            </label>
            <Select
              name="status"
              value={filter.status || "ALL"}
              onValueChange={(value) =>
                setFilter((f) => ({
                  ...f,
                  status: value === "ALL" ? undefined : (value as EStatus),
                }))
              }
            >
              <SelectTrigger className="h-11 border-gray-200 focus:ring-2 focus:ring-[#003873] focus:border-[#003873] transition-all rounded-xl">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="ALL">Todos os status</SelectItem>
                <SelectItem value="ACTIVE">
                  <div className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    <span>Ativo</span>
                  </div>
                </SelectItem>
                <SelectItem value="INACTIVE">
                  <div className="flex items-center">
                    <CircleOff className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Inativo</span>
                  </div>
                </SelectItem>
                <SelectItem value="BLOCKED">
                  <div className="flex items-center">
                    <Ban className="w-4 h-4 mr-2 text-red-500" />
                    <span>Bloqueado</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <UserCog className="w-4 h-4" />
              Perfil
            </label>
            <Select
              name="role"
              value={filter.role || "ALL"}
              onValueChange={(value) =>
                setFilter((f) => ({
                  ...f,
                  role: value === "ALL" ? undefined : (value as ERole),
                }))
              }
            >
              <SelectTrigger className="h-11 border-gray-200 focus:ring-2 focus:ring-[#003873] focus:border-[#003873] transition-all rounded-xl">
                <SelectValue placeholder="Todos os perfis" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="ALL">Todos os perfis</SelectItem>
                <SelectItem value="DELIVERY">
                  <div className="flex items-center">
                    <Car className="w-4 h-4 mr-2 text-green-500" />
                    <span>Entregador</span>
                  </div>
                </SelectItem>
                <SelectItem value="ADMIN">
                  <div className="flex items-center">
                    <UserCog className="w-4 h-4 mr-2 text-blue-500" />
                    <span>Administrador</span>
                  </div>
                </SelectItem>
                <SelectItem value="COMPANY">
                  <div className="flex items-center">
                    <Store className="w-4 h-4 mr-2 text-amber-500" />
                    <span>Loja</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#003873] to-[#0056b3] text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Filtrando...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Filtrar</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white rounded-3xl shadow-lg border border-gray-100">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#003873] border-t-transparent rounded-full animate-spin" />
            <span className="text-[#003873] font-medium text-lg">
              Carregando usuários...
            </span>
          </div>
        </div>
      ) : users.length ? (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader className="hidden sm:table-header-group bg-gray-50">
                <TableRow>
                  <TableHead className="h-14 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Código
                  </TableHead>
                  <TableHead className="h-14 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    E-mail
                  </TableHead>
                  <TableHead className="h-14 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="h-14 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Perfil
                  </TableHead>
                  <TableHead className="h-14 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="block sm:table-row-group divide-y divide-gray-200">
                {users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="group hover:bg-gray-50/80 transition-colors duration-200 border-b border-gray-200 mb-4 block sm:table-row last:mb-0"
                  >
                    <TableCell
                      data-label="Código"
                      className="px-4 py-3 block sm:table-cell text-right sm:text-left before:content-[attr(data-label)] before:font-semibold before:float-left sm:before:content-none before:mr-2"
                    >
                      <div className="flex items-center justify-end sm:justify-start w-full">
                        <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-xl bg-gray-100 group-hover:bg-gray-200 transition-colors">
                          <span className="text-sm font-medium text-gray-600">
                            #{user.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell
                      data-label="E-mail"
                      className="px-4 py-3 block sm:table-cell text-right sm:text-left before:content-[attr(data-label)] before:font-semibold before:float-left sm:before:content-none before:mr-2 overflow-hidden"
                    >
                      <div className="text-sm text-gray-900 break-words max-w-full sm:max-w-xs inline-block sm:block text-right sm:text-left">
                        {user.email}
                      </div>
                    </TableCell>

                    <TableCell
                      data-label="Status"
                      className="px-4 py-3 block sm:table-cell text-right sm:text-left before:content-[attr(data-label)] before:font-semibold before:float-left sm:before:content-none before:mr-2"
                    >
                      <div className="flex items-center justify-end sm:justify-start w-full min-w-0 flex-wrap">
                        {user.status === "ACTIVE" && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
                            <CheckCircle2 className="w-4 h-4 mr-1.5 text-green-500" />
                            Ativo
                          </span>
                        )}
                        {user.status === "INACTIVE" && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20">
                            <CircleOff className="w-4 h-4 mr-1.5 text-gray-500" />
                            Inativo
                          </span>
                        )}
                        {user.status === "BLOCKED" && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20">
                            <Ban className="w-4 h-4 mr-1.5 text-red-500" />
                            Bloqueado
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell
                      data-label="Perfil"
                      className="px-4 py-3 block sm:table-cell text-right sm:text-left before:content-[attr(data-label)] before:font-semibold before:float-left sm:before:content-none before:mr-2"
                    >
                      <div className="flex items-center justify-end sm:justify-start w-full min-w-0 flex-wrap">
                        {user.role === "DELIVERY" && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
                            <Car className="w-4 h-4 mr-1.5 text-green-500" />
                            Entregador
                          </span>
                        )}
                        {user.role === "ADMIN" && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                            <UserCog className="w-4 h-4 mr-1.5 text-blue-500" />
                            Administrador
                          </span>
                        )}
                        {user.role === "COMPANY" && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
                            <Store className="w-4 h-4 mr-1.5 text-amber-500" />
                            Loja
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell
                      data-label="Ações"
                      className="px-4 py-3 block sm:table-cell text-right sm:text-left before:content-[attr(data-label)] before:font-semibold before:float-left sm:before:content-none before:mr-2"
                    >
                      <div className="flex items-center justify-end sm:justify-start w-full min-w-0 flex-wrap gap-2">
                        <Button
                          variant="link"
                          onClick={() => {
                            router.push(`/dashboard/user/${user.id}`)
                          }}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-[#003873] hover:bg-[#003873]/5 transition-colors duration-200"
                        >
                          <Eye className="w-4 h-4 mr-1.5" />
                          Ver detalhes
                        </Button>
                        <Button
                          variant="link"
                          onClick={() =>
                            handleDeleteUser(
                              user.id,
                              user.name || "Usuário sem nome"
                            )
                          }
                          className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            currentUser?.id === user.id
                              ? "text-gray-400 cursor-not-allowed opacity-50"
                              : "text-red-600 hover:bg-red-50 hover:text-red-700"
                          }`}
                          disabled={isLoading || currentUser?.id === user.id}
                          title={
                            currentUser?.id === user.id
                              ? "Você não pode deletar sua própria conta"
                              : "Deletar usuário"
                          }
                        >
                          <Trash2 className="w-4 h-4 mr-1.5" />
                          Deletar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <UserCog className="w-full h-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Nenhum usuário encontrado
            </h3>
            <p className="text-gray-500">
              Tente ajustar os filtros para encontrar o que procura
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="text-sm text-gray-500">
          Mostrando página {page} de {lastPage}
        </div>
        <div className="flex gap-2">
          <button
            onClick={previousPage}
            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={isLoading || page === 1}
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </button>
          <button
            onClick={nextPage}
            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={isLoading || page === lastPage}
          >
            Próxima
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default User
