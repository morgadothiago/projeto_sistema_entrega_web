import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
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
import { DollarSign, Edit, X } from "lucide-react"
import { EBillingStatus, EBillingType } from "@/app/types/Billing"
import { Billing } from "@/app/types/Debt"

interface DialogModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  billing?: Billing | null
  editable?: boolean
  onSubmit?: (data: {
    amount: number
    description: string
    status: string
    type: string
  }) => void
  title?: string
  description?: string
  buttonText?: string
  children?: React.ReactNode
}

export default function DialogModal({
  open,
  onOpenChange,
  billing,
  editable = true,
  onSubmit,
  title = "Editar Faturamento",
  description = "Edite os dados do faturamento para atualizar.",
  buttonText = "Atualizar Faturamento",
  children,
}: DialogModalProps) {
  const [editAmount, setEditAmount] = React.useState<number>(0)
  const [editDescription, setEditDescription] = React.useState<string>("")
  const [editStatus, setEditStatus] = React.useState<string>("")
  const [editType, setEditType] = React.useState<string>("")

  React.useEffect(() => {
    if (billing) {
      setEditAmount(billing.amount || 0)
      setEditDescription(billing.description || "")
      setEditStatus(billing.status || "")
      setEditType(billing.type || "")
    }
  }, [billing])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit({
        amount: editAmount,
        description: editDescription,
        status: editStatus,
        type: editType,
      })
    }
  }

  const handleViewMode = () => {
    onOpenChange(false)
  }

  // Se tem children, renderiza eles em vez do formulário padrão
  if (children) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {title}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-7 w-7 p-0 hover:bg-gray-100"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            <DialogDescription className="text-xs text-gray-500">
              {description}
            </DialogDescription>
          </DialogHeader>
          <div className="py-1">{children}</div>
        </DialogContent>
      </Dialog>
    )
  }

  // Renderiza o formulário padrão quando não há children
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {editable ? title : "Visualizar Faturamento"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-7 w-7 p-0 hover:bg-gray-100"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <DialogDescription className="text-xs text-gray-500">
            {editable ? description : "Visualize os dados do faturamento."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-3" onSubmit={handleSubmit}>
          {/* Valor */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">Valor</label>
            <div className="relative">
              <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                type="number"
                placeholder="0.00"
                required={editable}
                value={editAmount}
                onChange={(e) => setEditAmount(Number(e.target.value))}
                className="pl-7 h-8 text-sm font-medium border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                disabled={!editable}
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">
              Descrição
            </label>
            <Input
              placeholder="Descrição do faturamento"
              required={editable}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="h-8 text-xs border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
              disabled={!editable}
            />
          </div>

          {/* Status e Tipo em linha */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">
                Status
              </label>
              <Select
                value={editStatus}
                onValueChange={(val) => setEditStatus(val)}
                disabled={!editable}
              >
                <SelectTrigger className="h-8 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value={EBillingStatus.PAID}
                    className="text-green-700 hover:bg-green-50 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Pago
                    </div>
                  </SelectItem>
                  <SelectItem
                    value={EBillingStatus.PENDING}
                    className="text-yellow-700 hover:bg-yellow-50 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                      Pendente
                    </div>
                  </SelectItem>
                  <SelectItem
                    value={EBillingStatus.CANCELED}
                    className="text-red-700 hover:bg-red-50 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      Cancelado
                    </div>
                  </SelectItem>
                  <SelectItem
                    value={EBillingStatus.FAILED}
                    className="text-red-700 hover:bg-red-50 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      Falhou
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Tipo</label>
              <Select
                value={editType}
                onValueChange={(val) => setEditType(val)}
                disabled={!editable}
              >
                <SelectTrigger className="h-8 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 text-xs">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value={EBillingType.INCOME}
                    className="text-green-700 hover:bg-green-50 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Entrada
                    </div>
                  </SelectItem>
                  <SelectItem
                    value={EBillingType.EXPENSE}
                    className="text-red-700 hover:bg-red-50 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      Saída
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botão de ação */}
          <div className="pt-1">
            <Button
              type={editable ? "submit" : "button"}
              className="w-full h-9 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium text-sm transition-all duration-200 hover:scale-[1.01] shadow-sm hover:shadow-md"
              onClick={!editable ? handleViewMode : undefined}
            >
              {editable ? buttonText : "Fechar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
