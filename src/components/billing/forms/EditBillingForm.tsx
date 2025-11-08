import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { DollarSign } from "lucide-react"
import { EBillingStatus, EBillingType } from "@/app/types/Billing"

interface EditBillingFormProps {
  editAmount: number
  setEditAmount: (amount: number) => void
  editDescription: string
  setEditDescription: (description: string) => void
  editStatus: EBillingStatus
  setEditStatus: (status: EBillingStatus) => void
  editType: EBillingType
  setEditType: (type: EBillingType) => void
  user: any
  onSubmit: () => void
}

export const EditBillingForm: React.FC<EditBillingFormProps> = ({
  editAmount,
  setEditAmount,
  editDescription,
  setEditDescription,
  editStatus,
  setEditStatus,
  editType,
  setEditType,
  user,
  onSubmit,
}) => {
  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        if (!user?.id) {
          return
        }
        onSubmit()
      }}
    >
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Valor</label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="number"
            placeholder="0.00"
            required
            value={editAmount}
            onChange={(e) => setEditAmount(Number(e.target.value))}
            className="pl-10 h-12 text-lg font-medium"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Descrição</label>
        <Input
          placeholder="Descrição do faturamento"
          required
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="h-12 text-base"
        />
      </div>
      <div className="flex w-full gap-4">
        <div className="space-y-2 flex-1">
          <label className="text-sm font-semibold text-gray-700">Status</label>
          <Select
            value={editStatus}
            onValueChange={(val) => setEditStatus(val as typeof editStatus)}
          >
            <SelectTrigger className="h-12 w-full">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value={EBillingStatus.PAID}
                className="bg-green-50 text-green-800 hover:bg-green-100"
              >
                Pago
              </SelectItem>
              <SelectItem
                value={EBillingStatus.PENDING}
                className="bg-yellow-50 text-yellow-800 hover:bg-yellow-100"
              >
                Pendente
              </SelectItem>
              <SelectItem
                value={EBillingStatus.CANCELED}
                className="bg-red-50 text-red-800 hover:bg-red-100"
              >
                Cancelado
              </SelectItem>
              <SelectItem
                value={EBillingStatus.FAILED}
                className="bg-red-50 text-red-800 hover:bg-red-100"
              >
                Falhou
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 flex-1">
          <label className="text-sm font-semibold text-gray-700">Tipo</label>
          <Select
            value={editType}
            onValueChange={(val) => setEditType(val as typeof editType)}
          >
            <SelectTrigger className="h-12 w-full">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value={EBillingType.INCOME}
                className="bg-green-50 text-green-800 hover:bg-green-100"
              >
                Entrada
              </SelectItem>
              <SelectItem
                value={EBillingType.EXPENSE}
                className="bg-red-50 text-red-800 hover:bg-red-100"
              >
                Saída
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button
        type="submit"
        className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
      >
        Atualizar Faturamento
      </Button>
    </form>
  )
}
