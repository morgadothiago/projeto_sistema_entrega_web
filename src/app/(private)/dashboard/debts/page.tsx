"use client"

import { useAuth } from "@/app/context"
import api from "@/app/services/api"
import { Billing } from "@/app/types/Debt"
import { useEffect, useState, useCallback, useMemo } from "react"
import {
  BillingToast,
  ReceiptToast,
  ValidationToast,
} from "@/components/ui/custom-toast"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import {
  Edit,
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react"
import {
  EBillingStatus,
  EBillingType,
  FilteredBillings,
  NewBilling,
} from "@/app/types/Billing"
import DialogModal from "@/app/components/DialogModal"

import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

// Importar componentes refatorados
import {
  BillingCard,
  BillingStats,
  BillingFilters,
  BillingSearch,
  BillingPagination,
  BillingEmptyState,
  BillingHeader,
  CreateBillingForm,
  EditBillingForm,
  BillingDetailsDialog,
  Icon,
} from "@/components/billing"
import { themeVariants, toastConfig } from "@/app/theme/global"
import { toast } from "sonner"

// Componentes reutilizáveis (movidos para arquivos separados)

// Componente FileUpload reutilizável
interface FileUploadProps {
  file: File | null
  onFileSelect: (file: File | null) => void
  theme: "green" | "blue"
  required?: boolean
  id: string
}

const FileUpload: React.FC<FileUploadProps> = ({
  file,
  onFileSelect,
  theme,
  required = false,
  id,
}) => {
  const themeColors = {
    green: {
      border: "border-green-300 hover:border-green-400",
      bg: "from-green-100 to-emerald-100",
      text: "text-green-600",
      button:
        "from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700",
      preview: "border-green-200 bg-green-100",
    },
    blue: {
      border: "border-blue-300 hover:border-blue-400",
      bg: "from-blue-100 to-indigo-100",
      text: "text-blue-600",
      button:
        "from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700",
      preview: "border-blue-200 bg-blue-100",
    },
  }

  const colors = themeColors[theme]

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700">
        Arquivo do Recibo {required && "*"}
      </label>
      <div
        className={`border-2 border-dashed ${colors.border} rounded-2xl p-6 text-center transition-colors duration-300`}
      >
        <div className="space-y-4">
          <div
            className={`mx-auto w-16 h-16 bg-gradient-to-r ${colors.bg} rounded-full flex items-center justify-center`}
          >
            <Icon name="document" className={colors.text} size="lg" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">
              {file ? file.name : "Arraste e solte o arquivo aqui"}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              ou clique para selecionar
            </p>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
              className="hidden"
              id={id}
            />
            <label
              htmlFor={id}
              className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${colors.button} text-white font-semibold rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 shadow-lg`}
            >
              <Icon name="upload" className="mr-2" />
              Selecionar Arquivo
            </label>
          </div>
        </div>
      </div>

      {/* Preview do Arquivo */}
      {file && (
        <div className={`bg-white/80 rounded-xl p-4 border ${colors.preview}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${colors.preview} rounded-lg`}>
                <Icon name="check" className={colors.text} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFileSelect(null)}
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
            >
              <Icon name="close" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente FeatureList reutilizável
interface FeatureListProps {
  features: string[]
  theme: "green" | "blue"
}

const FeatureList: React.FC<FeatureListProps> = ({ features, theme }) => {
  const textColor = theme === "green" ? "text-green-700" : "text-blue-700"

  return (
    <div className={`space-y-2 text-sm ${textColor}`}>
      {features.map((feature, index) => (
        <div key={index} className="flex items-center justify-center gap-2">
          <Icon name="check" size="sm" />
          <span>{feature}</span>
        </div>
      ))}
    </div>
  )
}

export default function BillingPage() {
  const { token, loading, user } = useAuth()
  const [billings, setBillings] = useState<Billing[] | null>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogEditOpen, setDialogEditOpen] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilteredBillings>()

  const [amount, setAmount] = useState<number>(0)
  const [description, setDescription] = useState<string>("")
  const [status, setStatus] = useState<EBillingStatus>(EBillingStatus.PENDING)
  const [dialogReciptsOpen, setDialogReciptsOpen] = useState(false)
  const [dialogDetailsOpen, setDialogDetailsOpen] = useState(false)
  const [selectedBillingForDetails, setSelectedBillingForDetails] =
    useState<Billing | null>(null)

  const [selectedBillingForReceipt, setSelectedBillingForReceipt] =
    useState<Billing | null>(null)
  const [receiptMode, setReceiptMode] = useState<"SELECT" | "CREATE" | "EDIT">(
    "SELECT"
  )
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false)
  const [receiptDescription, setReceiptDescription] = useState("")
  const [receiptAmount, setReceiptAmount] = useState<number>(0)

  const [editingBilling, setEditingBilling] = useState<Billing | null>(null)
  const [editAmount, setEditAmount] = useState<number>(0)
  const [editDescription, setEditDescription] = useState<string>("")
  const [editStatus, setEditStatus] = useState<EBillingStatus>(
    EBillingStatus.PENDING
  )
  const [editType, setEditType] = useState<EBillingType>(EBillingType.INCOME)

  const router = useRouter()

  const fetchBillings = useCallback(async () => {
    console.log("🔄 fetchBillings chamado")
    if (!token) {
      toast.error("Token expirado")
      return
    }

    setIsLoading(true)
    try {
      const response = await api.getBillings(token as string, {
        page: filters?.page,
        limit: filters?.limit,
        amount: filters?.amount,
        type: filters?.type,
        status: filters?.status,
        description: filters?.description,
      })

      // Verifica se é uma resposta de erro ou sucesso
      if (response && "message" in response && response.message) {
        // É um erro
        if (response.status === 401) {
          console.log("🔒 Erro 401 detectado - Token expirado")
          signOut({
            callbackUrl: "/signin",
            redirect: true,
          })
          return
        }
        setBillings([])
      } else if (
        response &&
        "data" in response &&
        Array.isArray(response.data)
      ) {
        // É uma resposta de sucesso com dados
        BillingToast.loaded()
        setBillings(response.data)
      } else {
        setBillings([])
      }
      setIsLoading(false)
    } catch (err) {
      console.error("Erro ao carregar faturamentos:", err)
      setError("Erro ao carregar as entregas. Tente novamente.")
      setIsLoading(false)
    }
  }, [token, filters])

  useEffect(() => {
    if (!loading && !token) {
      signOut({
        callbackUrl: "/signin",
        redirect: true,
      })
      router.push("/signin")
      return
    }
    if (token) {
      fetchBillings()
    }
  }, [token, loading, router, fetchBillings])

  console.log("aqui esta buscando os dados", billings)

  const handleAddNewBilling = async (data: FilteredBillings) => {
    try {
      if (typeof data.idUser !== "number") {
        ValidationToast.required("Usuário autenticado")
        return
      }
      // Ensure idUser is always a number
      const billingData = {
        ...data,
        idUser: data.idUser as number,
      }
      const response = await api.createNewBilling(billingData, token as string)

      if (response && "message" in response) {
        BillingToast.error(response.message)
        return
      }
      BillingToast.created()
      setDialogOpen(false)
      fetchBillings()
      setBillings(response.data || [])
    } catch (err) {
      BillingToast.error("Erro ao criar novo faturamento")
    }
  }

  const handleEditBilling = (billing: Billing) => {
    setEditingBilling(billing)
    setEditAmount(billing.amount || 0)
    setEditDescription(billing.description || "")
    setEditStatus((billing.status as EBillingStatus) || EBillingStatus.PENDING)
    setEditType((billing.type as EBillingType) || EBillingType.INCOME)
    setDialogEditOpen(true)
  }

  const handleUpdateBilling = async () => {
    if (!editingBilling || !user?.id) {
      ValidationToast.required("Dados para edição")
      return
    }

    try {
      const updateData = {
        ...editingBilling,
        amount: editAmount,
        description: editDescription,
        status: editStatus,
        type: editingBilling.type,
      }

      const response = await api.upDateBilling(updateData, token as string)

      if (response && "message" in response) {
        BillingToast.error(response.message)
        return
      }

      BillingToast.updated()
      setDialogEditOpen(false)
      setEditingBilling(null)
      fetchBillings()
    } catch (err) {
      BillingToast.error("Erro ao atualizar faturamento")
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600 mb-6"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-ping"></div>
        </div>
        <p className="text-gray-600 text-lg font-medium">
          Carregando faturamentos...
        </p>
        <p className="text-gray-400 text-sm mt-2">Aguarde um momento</p>
      </div>
    )
  }

  const handleFilterd = (prop: keyof FilteredBillings) => {
    return (data: any) => {
      setFilters((prev: any) => {
        return { ...prev, [prop]: data }
      })
    }
  }
  const handleNextPage = () => {
    setFilters((prev: any) => {
      return { ...prev, page: (prev?.page || 1) + 1 }
    })
  }
  const handlePrevPage = () => {
    setFilters((prev: any) => {
      return { ...prev, page: (prev?.page || 1) - 1 }
    })
  }

  const handleReceiptDialog = (billing: Billing) => {
    setSelectedBillingForReceipt(billing)
    setReceiptAmount(billing.amount || 0)
    setReceiptDescription(billing.description || "")
    setReceiptMode("SELECT")
    setDialogReciptsOpen(true)
  }

  const handleViewDetails = (billing: Billing) => {
    setSelectedBillingForDetails(billing)
    setDialogDetailsOpen(true)
  }

  const handleCreateReceipt = async () => {
    if (!receiptFile || !selectedBillingForReceipt) {
      ReceiptToast.fileRequired()
      return
    }

    if (!receiptDescription.trim()) {
      ReceiptToast.descriptionRequired()
      return
    }

    setIsUploadingReceipt(true)
    try {
      const response = await api.createRecipetFile(
        selectedBillingForReceipt.key,
        receiptFile,
        token as string
      )

      if (response && "message" in response) {
        ReceiptToast.uploadError()
        return
      }

      ReceiptToast.created()
      setDialogReciptsOpen(false)
      resetReceiptForm()
      fetchBillings()
    } catch (err) {
      ReceiptToast.uploadError()
    } finally {
      setIsUploadingReceipt(false)
    }
  }

  const handleEditReceipt = async () => {
    if (!receiptDescription.trim()) {
      ReceiptToast.descriptionRequired()
      return
    }

    if (!selectedBillingForReceipt) {
      ReceiptToast.uploadError()
      return
    }

    setIsUploadingReceipt(true)
    try {
      // Sempre atualiza a descrição via PATCH do faturamento
      const updateData = {
        ...selectedBillingForReceipt,
        description: receiptDescription,
      }

      const updateResponse = await api.upDateBilling(
        updateData,
        token as string
      )

      console.log("aqui esta o response da descrição", updateResponse)

      if (updateResponse && "message" in updateResponse) {
        ReceiptToast.uploadError()
        return
      }

      // Se há um arquivo selecionado, faz upload/atualização do arquivo
      if (receiptFile) {
        console.log("📁 Enviando arquivo:", {
          fileName: receiptFile.name,
          fileSize: receiptFile.size,
          fileType: receiptFile.type,
          billingKey: selectedBillingForReceipt.key,
        })

        const fileResponse = await api.createRecipetFile(
          selectedBillingForReceipt.key,
          receiptFile,
          token as string
        )

        console.log("📁 Response do arquivo:", fileResponse)

        if (fileResponse && "message" in fileResponse) {
          console.log("❌ Erro no upload do arquivo:", fileResponse.message)
          ReceiptToast.uploadError()
          return
        } else {
          console.log("✅ Arquivo enviado com sucesso!")
        }
      } else {
        console.log("ℹ️ Nenhum arquivo selecionado para upload")
      }

      ReceiptToast.updated()
      setDialogReciptsOpen(false)
      resetReceiptForm()
      fetchBillings()
    } catch (err) {
      ReceiptToast.uploadError()
    } finally {
      setIsUploadingReceipt(false)
    }
  }

  const resetReceiptForm = () => {
    setReceiptFile(null)
    setReceiptDescription("")
    setReceiptAmount(0)
    setSelectedBillingForReceipt(null)
    setReceiptMode("SELECT")
  }

  // Calcular estatísticas
  const totalIncome =
    billings
      ?.filter(
        (b) =>
          b.type === EBillingType.INCOME && b.status === EBillingStatus.PAID
      )
      .reduce((sum, b) => sum + (b.amount || 0), 0) || 0
  const totalExpense =
    billings
      ?.filter(
        (b) =>
          b.type === EBillingType.EXPENSE && b.status === EBillingStatus.PAID
      )
      .reduce((sum, b) => sum + (b.amount || 0), 0) || 0
  const balance = totalIncome - totalExpense

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, description: e.target.value } as any)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header com gradiente */}
        <BillingHeader dialogOpen={dialogOpen} setDialogOpen={setDialogOpen}>
          <CreateBillingForm
            amount={amount}
            setAmount={setAmount}
            description={description}
            setDescription={setDescription}
            status={status}
            setStatus={setStatus}
            filters={filters}
            user={user}
            onSubmit={handleAddNewBilling}
          />
        </BillingHeader>

        {/* Cards de estatísticas */}
        <BillingStats
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          balance={balance}
        />

        {/* Barra de busca moderna */}
        <BillingSearch onSearch={onSearch} />

        {/* Filtros modernos */}
        <BillingFilters
          filters={filters}
          onFilterChange={handleFilterd}
          onClearFilters={() => setFilters({} as FilteredBillings)}
        />

        {/* Lista de faturamentos */}
        {isLoading ? (
          <div className="flex items-center justify-center h-40 bg-white rounded-2xl shadow-sm">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600 mb-4"></div>
              <p className="text-gray-600 text-lg">
                Carregando faturamentos...
              </p>
            </div>
          </div>
        ) : billings?.length === 0 ? (
          <BillingEmptyState onCreateFirst={() => setDialogOpen(true)} />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {billings?.map((billing) => (
                <BillingCard
                  key={billing.key}
                  billing={billing}
                  onEdit={handleEditBilling}
                  onReceipt={handleReceiptDialog}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>

            {/* Paginação moderna */}
            <BillingPagination
              filters={filters}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
            />
          </div>
        )}

        {/* Dialog de edição */}
        <Dialog open={dialogEditOpen} onOpenChange={setDialogEditOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Editar Faturamento
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Edite os dados do faturamento para atualizar.
              </DialogDescription>
            </DialogHeader>
            <EditBillingForm
              editAmount={editAmount}
              setEditAmount={setEditAmount}
              editDescription={editDescription}
              setEditDescription={setEditDescription}
              editStatus={editStatus}
              setEditStatus={setEditStatus}
              editType={editType}
              setEditType={setEditType}
              user={user}
              onSubmit={handleUpdateBilling}
            />
          </DialogContent>
        </Dialog>

        {/* Dialog melhorado para Recibos */}
        {dialogReciptsOpen && (
          <Dialog open={dialogReciptsOpen} onOpenChange={setDialogReciptsOpen}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                    <Icon name="document" className="text-white" size="lg" />
                  </div>
                  Gerenciar Recibos
                </DialogTitle>
                <DialogDescription className="text-gray-600 text-lg">
                  {selectedBillingForReceipt ? (
                    <>
                      Escolha uma ação para o faturamento:
                      <span className="font-bold text-purple-600 ml-2">
                        {selectedBillingForReceipt.description}
                      </span>
                    </>
                  ) : (
                    "Selecione um faturamento para gerenciar recibos"
                  )}
                </DialogDescription>
              </DialogHeader>

              {selectedBillingForReceipt && (
                <div className="space-y-6">
                  {/* Informações do Faturamento */}
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Detalhes do Faturamento
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <span className="text-sm text-gray-600 font-medium">
                            Valor:
                          </span>
                          <p className="text-xl font-bold text-blue-600">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(selectedBillingForReceipt.amount || 0)}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <span className="text-sm text-gray-600 font-medium">
                            Tipo:
                          </span>
                          <Badge
                            className={`px-3 py-1 rounded-full font-bold ${
                              selectedBillingForReceipt.type === "INCOME"
                                ? "bg-green-100 text-green-700 border-green-300"
                                : "bg-red-100 text-red-700 border-red-300"
                            }`}
                          >
                            {selectedBillingForReceipt.type === "INCOME"
                              ? " ENTRADA"
                              : "💸 SAÍDA"}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <span className="text-sm text-gray-600 font-medium">
                            Status:
                          </span>
                          <Badge
                            className={`px-3 py-1 rounded-full font-bold ${
                              selectedBillingForReceipt.status === "PAID"
                                ? "bg-green-100 text-green-700 border-green-300"
                                : selectedBillingForReceipt.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                                : "bg-red-100 text-red-700 border-red-300"
                            }`}
                          >
                            {{
                              PAID: "✅ Pago",
                              PENDING: "⏳ Pendente",
                              CANCELED: "❌ Cancelado",
                              FAILED: "💥 Falhou",
                            }[
                              selectedBillingForReceipt.status as keyof typeof EBillingStatus
                            ] || "Desconhecido"}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <span className="text-sm text-gray-600 font-medium">
                            Key:
                          </span>
                          <p className="text-xs font-mono font-bold text-gray-700 truncate">
                            {selectedBillingForReceipt.key}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Seleção de Ação */}
                  {receiptMode === "SELECT" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Criar Recibo */}
                      <Card
                        className="group cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-400 hover:shadow-xl transition-all duration-300 hover:scale-105"
                        onClick={() => setReceiptMode("CREATE")}
                      >
                        <CardContent className="p-8 text-center">
                          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                            <Icon
                              name="plus"
                              className="text-white"
                              size="lg"
                            />
                          </div>
                          <h3 className="text-2xl font-bold text-green-800 mb-3">
                            Criar Novo Recibo
                          </h3>
                          <p className="text-green-600 mb-6 leading-relaxed">
                            Crie um novo recibo para este faturamento. Você
                            precisará fornecer uma descrição e um arquivo.
                          </p>
                          <FeatureList
                            features={[
                              "Descrição obrigatória",
                              "Arquivo obrigatório",
                              "Valor opcional",
                            ]}
                            theme="green"
                          />
                        </CardContent>
                      </Card>

                      {/* Editar Recibo */}
                      <Card
                        className="group cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 hover:scale-105"
                        onClick={() => setReceiptMode("EDIT")}
                      >
                        <CardContent className="p-8 text-center">
                          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                            <Icon
                              name="edit"
                              className="text-white"
                              size="lg"
                            />
                          </div>
                          <h3 className="text-2xl font-bold text-blue-800 mb-3">
                            Editar Recibo Existente
                          </h3>
                          <p className="text-blue-600 mb-6 leading-relaxed">
                            Edite um recibo já existente para este faturamento.
                            Você pode alterar a descrição e adicionar um novo
                            arquivo.
                          </p>
                          <FeatureList
                            features={[
                              "Descrição obrigatória",
                              "Arquivo opcional",
                              "Valor opcional",
                            ]}
                            theme="blue"
                          />
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Formulário de Criação */}
                  {receiptMode === "CREATE" && (
                    <Card className={themeVariants.card.green}>
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-bold text-green-800 flex items-center gap-2">
                            <Icon name="plus" />
                            Criar Novo Recibo
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReceiptMode("SELECT")}
                            className={themeVariants.button.green}
                          >
                            ← Voltar
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Descrição */}
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">
                            Descrição do Recibo *
                          </label>
                          <Input
                            placeholder="Digite a descrição do recibo..."
                            value={receiptDescription}
                            onChange={(e) =>
                              setReceiptDescription(e.target.value)
                            }
                            className={themeVariants.input.green}
                          />
                        </div>

                        {/* Valor */}
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">
                            Valor do Recibo
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={receiptAmount}
                              onChange={(e) =>
                                setReceiptAmount(Number(e.target.value))
                              }
                              className={themeVariants.input.greenNumber}
                            />
                          </div>
                        </div>

                        {/* Upload */}
                        <FileUpload
                          file={receiptFile}
                          onFileSelect={setReceiptFile}
                          theme="green"
                          required={true}
                          id="receipt-file-create"
                        />

                        {/* Ações */}
                        <div className="flex justify-end gap-4 pt-4 border-t border-green-200">
                          <Button
                            variant="outline"
                            onClick={() => setReceiptMode("SELECT")}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition-all duration-300"
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleCreateReceipt}
                            disabled={
                              !receiptFile ||
                              !receiptDescription.trim() ||
                              isUploadingReceipt
                            }
                            className={themeVariants.button.greenPrimary}
                          >
                            {isUploadingReceipt ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                Criando...
                              </>
                            ) : (
                              <>
                                <Icon name="plus" className="mr-2" />
                                Criar Recibo
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Formulário de Edição */}
                  {receiptMode === "EDIT" && (
                    <Card className={themeVariants.card.blue}>
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
                            <Icon name="edit" />
                            Editar Recibo Existente
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReceiptMode("SELECT")}
                            className={themeVariants.button.blue}
                          >
                            ← Voltar
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Descrição */}
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">
                            Descrição do Recibo *
                          </label>
                          <Input
                            placeholder="Digite a descrição do recibo..."
                            value={receiptDescription}
                            onChange={(e) =>
                              setReceiptDescription(e.target.value)
                            }
                            className={themeVariants.input.blue}
                          />
                        </div>

                        {/* Valor */}
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">
                            Valor do Recibo
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={receiptAmount}
                              onChange={(e) =>
                                setReceiptAmount(Number(e.target.value))
                              }
                              className={themeVariants.input.blueNumber}
                            />
                          </div>
                        </div>

                        {/* Upload */}
                        <FileUpload
                          file={receiptFile}
                          onFileSelect={setReceiptFile}
                          theme="blue"
                          required={false}
                          id="receipt-file-edit"
                        />

                        {/* Ações */}
                        <div className="flex justify-end gap-4 pt-4 border-t border-blue-200">
                          <Button
                            variant="outline"
                            onClick={() => setReceiptMode("SELECT")}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition-all duration-300"
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleEditReceipt}
                            disabled={
                              !receiptDescription.trim() || isUploadingReceipt
                            }
                            className={themeVariants.button.bluePrimary}
                          >
                            {isUploadingReceipt ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                Atualizando...
                              </>
                            ) : (
                              <>
                                <Icon name="edit" className="mr-2" />
                                Atualizar Recibo
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}

        {/* Dialog de Detalhes do Faturamento */}
        <BillingDetailsDialog
          billing={selectedBillingForDetails}
          isOpen={dialogDetailsOpen}
          onClose={() => setDialogDetailsOpen(false)}
          onEdit={handleEditBilling}
          onReceipt={handleReceiptDialog}
        />
      </div>
    </div>
  )
}
