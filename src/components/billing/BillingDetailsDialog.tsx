import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  User,
  FileText,
  Key,
  Edit,
  Receipt,
} from "lucide-react"
import { Billing } from "@/app/types/Debt"
import { EBillingStatus, EBillingType } from "@/app/types/Billing"
import { Icon } from "./Icon"

interface BillingDetailsDialogProps {
  billing: Billing | null
  isOpen: boolean
  onClose: () => void
  onEdit: (billing: Billing) => void
  onReceipt: (billing: Billing) => void
}

export const BillingDetailsDialog: React.FC<BillingDetailsDialogProps> = ({
  billing,
  isOpen,
  onClose,
  onEdit,
  onReceipt,
}) => {
  if (!billing) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700 border-green-200"
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "CANCELED":
        return "bg-red-100 text-red-700 border-red-200"
      case "FAILED":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return "✅"
      case "PENDING":
        return "⏳"
      case "CANCELED":
        return "❌"
      case "FAILED":
        return "💥"
      default:
        return "❓"
    }
  }

  const getTypeColor = (type: string) => {
    return type === "INCOME"
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-red-100 text-red-700 border-red-200"
  }

  const getTypeIcon = (type: string) => {
    return type === "INCOME" ? "📈" : "📉"
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Não informado"
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            Detalhes do Faturamento
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-lg">
            Visualize todas as informações detalhadas deste faturamento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header com informações principais */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-blue-800 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Informações Principais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Valor */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-600">
                      Valor
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(billing.amount || 0)}
                  </p>
                </div>

                {/* Tipo */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {billing.type === "INCOME" ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm font-semibold text-gray-600">
                      Tipo
                    </span>
                  </div>
                  <Badge
                    className={`px-3 py-1 rounded-full font-bold ${getTypeColor(
                      billing.type
                    )}`}
                  >
                    {getTypeIcon(billing.type)}{" "}
                    {billing.type === "INCOME" ? "ENTRADA" : "SAÍDA"}
                  </Badge>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-600">
                      Status
                    </span>
                  </div>
                  <Badge
                    className={`px-3 py-1 rounded-full font-bold ${getStatusColor(
                      billing.status
                    )}`}
                  >
                    {getStatusIcon(billing.status)}{" "}
                    {{
                      PAID: "Pago",
                      PENDING: "Pendente",
                      CANCELED: "Cancelado",
                      FAILED: "Falhou",
                    }[billing.status as keyof typeof EBillingStatus] ||
                      "Desconhecido"}
                  </Badge>
                </div>

                {/* Key */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-600">
                      ID
                    </span>
                  </div>
                  <p className="text-sm font-mono font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                    {billing.key}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Descrição */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Descrição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {billing.description || "Nenhuma descrição fornecida"}
              </p>
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações Adicionais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Data de Criação */}
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-gray-600">
                    Data de Criação:
                  </span>
                  <p className="text-gray-700">
                    {formatDate(billing.createdAt || "")}
                  </p>
                </div>

                {/* Data de Vencimento */}
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-gray-600">
                    Data de Vencimento:
                  </span>
                  <p className="text-gray-700">
                    {formatDate(billing.dueDate || "")}
                  </p>
                </div>

                {/* ID do Faturamento */}
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-gray-600">
                    ID do Faturamento:
                  </span>
                  <p className="text-gray-700 font-mono">
                    {billing.id || "Não informado"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-gray-800">
                Ações Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => {
                    onEdit(billing)
                    onClose()
                  }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <Edit className="w-4 h-4" />
                  Editar Faturamento
                </Button>

                <Button
                  onClick={() => {
                    onReceipt(billing)
                    onClose()
                  }}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <Icon name="document" className="w-4 h-4" />
                  Gerenciar Recibos
                </Button>

                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex items-center gap-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl transition-all duration-300"
                >
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
