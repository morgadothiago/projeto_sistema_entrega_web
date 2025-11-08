"use client"
import { useAuth } from "@/app/context"
import api from "@/app/services/api"
import type { VehicleType } from "@/app/types/VehicleType"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  PlusCircle,
  Edit,
  Trash2,
  Car,
  ArrowLeft,
  ArrowRight,
  Search,
  Filter,
  MoreVertical,
  DollarSign,
  MapPin,
  Users,
  Zap,
  Save,
  X,
} from "lucide-react"
import React, { useEffect, useState } from "react"
import { toast } from "sonner"

export default function page() {
  const { token } = useAuth()
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Estados de busca e filtro
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Estados do modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingVehicleType, setEditingVehicleType] =
    useState<VehicleType | null>(null)
  const [formData, setFormData] = useState({
    type: "",
    tarifaBase: 0,
    valorKMAdicional: 0,
    paradaAdicional: 0,
    ajudanteAdicional: 0,
  })
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    getAllVehicleTypes()
  }, [currentPage, itemsPerPage])

  // Reset para primeira página quando mudar o número de itens por página
  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  async function getAllVehicleTypes() {
    try {
      setLoading(true)
      setError(null)
      const response = await api.getAllVehicleType(currentPage, itemsPerPage)

      // Verifica se é uma resposta de erro ou sucesso
      if (response && "message" in response) {
        // É um erro
        setError(response.message)
        setVehicleTypes([])
      } else if (
        response &&
        "data" in response &&
        Array.isArray(response.data)
      ) {
        // É uma resposta de sucesso com dados
        setVehicleTypes(response.data)
        setTotalPages(response.totalPage)
        setTotalItems(response.total)
      } else {
        setVehicleTypes([])
      }
    } catch (err: any) {
      console.error("Erro ao carregar tipos de veículos:", err)
      setError(err.message || "Erro ao carregar tipos de veículos")
      setVehicleTypes([])
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteVehicleType(type: string) {
    if (
      !confirm(`Tem certeza que deseja excluir o tipo de veículo "${type}"?`)
    ) {
      return
    }

    if (!token) {
      toast.error("Token não encontrado. Faça login novamente.", {
        duration: 5000,
        position: "top-center",
      })
      return
    }

    // Verifica se o token é uma string válida
    if (typeof token !== "string" || token.trim() === "") {
      toast.error("Token inválido. Faça login novamente.", {
        duration: 5000,
        position: "top-center",
      })
      return
    }

    try {
      // Remove "Bearer " se já estiver presente para evitar duplicação
      const cleanToken = token.startsWith("Bearer ")
        ? token.replace("Bearer ", "")
        : token

      await api.deleteVehicleType(type.toLowerCase(), cleanToken)
      await getAllVehicleTypes() // Recarrega a lista

      // Toast de sucesso
      toast.success(`Tipo de veículo "${type}" excluído com sucesso!`, {
        duration: 4000,
        position: "top-center",
      })
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir tipo de veículo.", {
        duration: 5000,
        position: "top-center",
      })
    }
  }

  function handleEditVehicleType(vehicleType: VehicleType) {
    setIsEditing(true)
    setEditingVehicleType(vehicleType)
    setFormData({
      type: vehicleType.type,
      tarifaBase: vehicleType.tarifaBase,
      valorKMAdicional: vehicleType.valorKMAdicional,
      paradaAdicional: vehicleType.paradaAdicional,
      ajudanteAdicional: vehicleType.ajudanteAdicional,
    })
    setFormErrors({})
    setIsModalOpen(true)
  }

  function handleAddNewVehicleType() {
    setIsEditing(false)
    setEditingVehicleType(null)
    setFormData({
      type: "",
      tarifaBase: 0,
      valorKMAdicional: 0,
      paradaAdicional: 0,
      ajudanteAdicional: 0,
    })
    setFormErrors({})
    setIsModalOpen(true)
  }

  function validateForm() {
    const errors: { [key: string]: string } = {}

    if (!formData.type.trim()) {
      errors.type = "Nome do tipo é obrigatório"
    }

    if (formData.tarifaBase === null || formData.tarifaBase === undefined) {
      errors.tarifaBase = "Tarifa base é obrigatória"
    } else if (isNaN(formData.tarifaBase) || formData.tarifaBase <= 0) {
      errors.tarifaBase = "Tarifa base deve ser um número positivo"
    }

    if (
      formData.valorKMAdicional === null ||
      formData.valorKMAdicional === undefined
    ) {
      errors.valorKMAdicional = "Valor por KM adicional é obrigatório"
    } else if (
      isNaN(formData.valorKMAdicional) ||
      formData.valorKMAdicional < 0
    ) {
      errors.valorKMAdicional =
        "Valor por KM adicional deve ser um número não negativo"
    }

    if (
      formData.paradaAdicional === null ||
      formData.paradaAdicional === undefined
    ) {
      errors.paradaAdicional = "Valor por parada adicional é obrigatório"
    } else if (
      isNaN(formData.paradaAdicional) ||
      formData.paradaAdicional < 0
    ) {
      errors.paradaAdicional =
        "Valor por parada adicional deve ser um número não negativo"
    }

    if (
      formData.ajudanteAdicional === null ||
      formData.ajudanteAdicional === undefined
    ) {
      errors.ajudanteAdicional = "Valor por ajudante adicional é obrigatório"
    } else if (
      isNaN(formData.ajudanteAdicional) ||
      formData.ajudanteAdicional < 0
    ) {
      errors.ajudanteAdicional =
        "Valor por ajudante adicional deve ser um número não negativo"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit() {
    if (!validateForm()) {
      return
    }

    if (!token) {
      toast.error("Token não encontrado. Faça login novamente.", {
        duration: 5000,
        position: "top-center",
      })
      return
    }

    // Verifica se o token é uma string válida
    if (typeof token !== "string" || token.trim() === "") {
      toast.error("Token inválido. Faça login novamente.", {
        duration: 5000,
        position: "top-center",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Não precisa mais de parseFloat, pois já são numbers
      const {
        tarifaBase,
        valorKMAdicional,
        paradaAdicional,
        ajudanteAdicional,
      } = formData

      // Verifica se os valores são números válidos
      if (
        isNaN(tarifaBase) ||
        isNaN(valorKMAdicional) ||
        isNaN(paradaAdicional) ||
        isNaN(ajudanteAdicional)
      ) {
        toast.error(
          "Por favor, preencha todos os campos obrigatórios com valores numéricos válidos.",
          { duration: 5000, position: "top-center" }
        )
        return
      }

      // Verifica se os valores são finitos e positivos
      if (
        !isFinite(tarifaBase) ||
        !isFinite(valorKMAdicional) ||
        !isFinite(paradaAdicional) ||
        !isFinite(ajudanteAdicional)
      ) {
        toast.error("Por favor, insira apenas números válidos.", {
          duration: 5000,
          position: "top-center",
        })
        return
      }

      if (tarifaBase <= 0) {
        toast.error("A tarifa base deve ser maior que zero.", {
          duration: 5000,
          position: "top-center",
        })
        return
      }

      const cleanToken = token.startsWith("Bearer ")
        ? token.replace("Bearer ", "")
        : token

      if (isEditing && editingVehicleType) {
        // Monta o objeto apenas com campos válidos
        const data: any = {
          tarifaBase: formData.tarifaBase,
          valorKMAdicional: formData.valorKMAdicional,
          paradaAdicional: formData.paradaAdicional,
          ajudanteAdicional: formData.ajudanteAdicional,
        }
        // Só envie 'type' se o usuário alterou o nome
        if (formData.type && formData.type !== editingVehicleType.type) {
          data.type = formData.type.trim()
        }
        // Remove campos indefinidos ou nulos
        Object.keys(data).forEach(
          (key) =>
            (data[key] === undefined || data[key] === null) && delete data[key]
        )
        console.log("Enviando para o update:", data)
        await api.updateVehicleType(editingVehicleType.type, data, cleanToken)
      } else {
        const vehicleTypeData = {
          type: formData.type.trim(),
          tarifaBase,
          valorKMAdicional,
          paradaAdicional,
          ajudanteAdicional,
        }
        await api.createVehicleType(vehicleTypeData, cleanToken)
      }

      setIsModalOpen(false)
      await getAllVehicleTypes() // Recarrega a lista

      // Toast de sucesso
      toast.success(
        isEditing
          ? `Tipo de veículo "${formData.type}" atualizado com sucesso!`
          : `Tipo de veículo "${formData.type}" criado com sucesso!`,
        {
          duration: 4000,
          position: "top-center",
        }
      )
    } catch (err: any) {
      console.log("=== ERRO DA API ===")
      console.log("Status:", err?.response?.status)
      console.log("Response data:", err?.response?.data)
      console.log("Response status:", err?.response?.status)
      console.log("Response headers:", err?.response?.headers)
      console.log("Mensagens de erro:", err?.response?.data?.message)
      console.log("===================")

      let errorMessage = "Erro ao salvar tipo de veículo"

      if (err.message) {
        errorMessage = err.message
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.status === 409) {
        errorMessage = "Este tipo de veículo já existe"
      } else if (err.status === 401) {
        errorMessage = "Token inválido ou expirado. Faça login novamente."
      } else if (err.status === 422) {
        errorMessage =
          err.response?.data?.message || "Dados inválidos. Verifique os campos."
      } else if (err.status === 500) {
        errorMessage =
          err.response?.data?.message ||
          "Erro interno do servidor. Tente novamente."
      }

      // Toast de erro com configurações específicas
      toast.error(errorMessage, {
        duration: 5000,
        position: "top-center",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  function nextPage() {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))
  }

  function previousPage() {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))
  }

  function goToPage(page: number) {
    setCurrentPage(page)
  }

  // Gera array de páginas para exibir
  function getPageNumbers() {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Se temos poucas páginas, mostra todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Se temos muitas páginas, mostra uma janela
      let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
      let end = Math.min(totalPages, start + maxVisiblePages - 1)

      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  // Filtra os tipos de veículos baseado no termo de busca
  const filteredVehicleTypes = vehicleTypes.filter((vehicleType) =>
    vehicleType.type
      .toLowerCase()
      .normalize("NFD")
      .replace(/[ -\u036f]/g, "")
      .includes(
        searchTerm
          .toLowerCase()
          .trim()
          .normalize("NFD")
          .replace(/[ -\u036f]/g, "")
      )
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">
                Carregando tipos de veículos...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Tipos de Veículos
              </h1>
              <p className="text-gray-600 text-lg">
                Gerencie os tipos de veículos disponíveis no sistema
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
              </Button>

              <Button
                onClick={handleAddNewVehicleType}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <PlusCircle className="h-4 w-4" />
                Novo Tipo
              </Button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar por tipo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    Itens por página:
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600 text-center">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        {filteredVehicleTypes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchTerm
                  ? "Nenhum resultado encontrado"
                  : "Nenhum tipo de veículo cadastrado"}
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Tente ajustar os filtros de busca"
                  : "Comece adicionando o primeiro tipo de veículo ao sistema"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Grid de Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {filteredVehicleTypes.map((vehicleType) => (
                <Card
                  key={vehicleType.id}
                  className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <Car className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900">
                            {vehicleType.type}
                          </CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            ID: {vehicleType.id}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          onClick={() => handleEditVehicleType(vehicleType)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() =>
                            handleDeleteVehicleType(vehicleType.type)
                          }
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-xs text-gray-500">Tarifa Base</p>
                          <p className="font-semibold text-green-700">
                            {formatCurrency(vehicleType.tarifaBase)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-500">KM Adicional</p>
                          <p className="font-semibold text-blue-700">
                            {formatCurrency(vehicleType.valorKMAdicional)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                        <MapPin className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="text-xs text-gray-500">
                            Parada Adicional
                          </p>
                          <p className="font-semibold text-purple-700">
                            {formatCurrency(
                              Number(vehicleType.paradaAdicional) || 0
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                        <Users className="h-4 w-4 text-orange-600" />
                        <div>
                          <p className="text-xs text-gray-500">
                            Ajudante Adicional
                          </p>
                          <p className="font-semibold text-orange-700">
                            {formatCurrency(
                              Number(vehicleType.ajudanteAdicional) || 0
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Paginação */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="text-sm text-gray-600 text-center lg:text-left">
                      {totalItems === 0
                        ? "Nenhum tipo de veículo encontrado"
                        : totalPages === 1
                        ? `Mostrando todos os ${totalItems} tipos de veículos`
                        : `Mostrando ${
                            (currentPage - 1) * itemsPerPage + 1
                          } a ${Math.min(
                            currentPage * itemsPerPage,
                            totalItems
                          )} de ${totalItems} tipos de veículos`}
                    </div>

                    {totalItems > 0 && !showFilters && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          Itens por página:
                        </span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) =>
                            setItemsPerPage(Number(e.target.value))
                          }
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                      <div className="flex gap-2">
                        <Button
                          onClick={previousPage}
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          className="flex items-center gap-2"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span className="hidden sm:inline">Anterior</span>
                        </Button>

                        <Pagination>
                          <PaginationContent>
                            {getPageNumbers().map((page) => (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => goToPage(page)}
                                  isActive={currentPage === page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                          </PaginationContent>
                        </Pagination>

                        <Button
                          onClick={nextPage}
                          variant="outline"
                          size="sm"
                          disabled={currentPage === totalPages}
                          className="flex items-center gap-2"
                        >
                          <span className="hidden sm:inline">Próxima</span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Modal para Adicionar/Editar */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                {isEditing
                  ? "Editar Tipo de Veículo"
                  : "Adicionar Novo Tipo de Veículo"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Modifique as informações do tipo de veículo selecionado."
                  : "Preencha as informações para criar um novo tipo de veículo."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Nome do Tipo *</Label>
                <Input
                  id="type"
                  placeholder="Ex: Carro, Moto, Utilitário..."
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className={formErrors.type ? "border-red-500" : ""}
                />
                {formErrors.type && (
                  <p className="text-red-500 text-sm">{formErrors.type}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="tarifaBase">Tarifa Base (R$) *</Label>
                  <Input
                    id="tarifaBase"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.tarifaBase}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tarifaBase: Number(e.target.value),
                      })
                    }
                    className={formErrors.tarifaBase ? "border-red-500" : ""}
                  />
                  {formErrors.tarifaBase && (
                    <p className="text-red-500 text-sm">
                      {formErrors.tarifaBase}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="valorKMAdicional">
                    Valor por KM Adicional (R$) *
                  </Label>
                  <Input
                    id="valorKMAdicional"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.valorKMAdicional}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        valorKMAdicional: Number(e.target.value),
                      })
                    }
                    className={
                      formErrors.valorKMAdicional ? "border-red-500" : ""
                    }
                  />
                  {formErrors.valorKMAdicional && (
                    <p className="text-red-500 text-sm">
                      {formErrors.valorKMAdicional}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="paradaAdicional">
                    Valor por Parada Adicional (R$) *
                  </Label>
                  <Input
                    id="paradaAdicional"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.paradaAdicional}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paradaAdicional: Number(e.target.value),
                      })
                    }
                    className={
                      formErrors.paradaAdicional ? "border-red-500" : ""
                    }
                  />
                  {formErrors.paradaAdicional && (
                    <p className="text-red-500 text-sm">
                      {formErrors.paradaAdicional}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ajudanteAdicional">
                    Valor por Ajudante Adicional (R$) *
                  </Label>
                  <Input
                    id="ajudanteAdicional"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.ajudanteAdicional}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ajudanteAdicional: Number(e.target.value),
                      })
                    }
                    className={
                      formErrors.ajudanteAdicional ? "border-red-500" : ""
                    }
                  />
                  {formErrors.ajudanteAdicional && (
                    <p className="text-red-500 text-sm">
                      {formErrors.ajudanteAdicional}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting
                  ? "Salvando..."
                  : isEditing
                  ? "Atualizar"
                  : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
