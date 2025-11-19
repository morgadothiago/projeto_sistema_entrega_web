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
import {
  EBillingStatus,
  EBillingType,
  FilteredBillings,
} from "@/app/types/Billing"

interface CreateBillingFormProps {
  amount: number
  setAmount: (amount: number) => void
  description: string
  setDescription: (description: string) => void
  status: EBillingStatus
  setStatus: (status: EBillingStatus) => void
  type: EBillingType
  setType: (type: EBillingType) => void
  filters: FilteredBillings | undefined
  user: any
  onSubmit: (data: FilteredBillings) => void
}

export const CreateBillingForm: React.FC<CreateBillingFormProps> = ({
  amount,
  setAmount,
  description,
  setDescription,
  status,
  setStatus,
  type,
  setType,
  filters,
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
        onSubmit({
          idUser: user?.id as number,
          amount: amount,
          type: type,
          status: status,
          description: description,
        })
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
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="pl-10 h-12 text-lg font-medium"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Descrição</label>
        <Input
          placeholder="Descrição do faturamento"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="h-12 text-base"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Tipo *</label>
        <Select
          value={type}
          onValueChange={(val) => setType(val as typeof type)}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value={EBillingType.INCOME}
              className="bg-green-50 text-green-800 hover:bg-green-100"
            >
              💰 Entrada (Receita)
            </SelectItem>
            <SelectItem
              value={EBillingType.EXPENSE}
              className="bg-red-50 text-red-800 hover:bg-red-100"
            >
              💸 Saída (Despesa)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Status</label>
        <Select
          value={status}
          onValueChange={(val) => setStatus(val as typeof status)}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value={EBillingStatus.PAID}
              className="bg-green-50 text-green-800 hover:bg-green-100"
            >
              ✅ Pago
            </SelectItem>
            <SelectItem
              value={EBillingStatus.PENDING}
              className="bg-yellow-50 text-yellow-800 hover:bg-yellow-100"
            >
              ⏳ Pendente
            </SelectItem>
            <SelectItem
              value={EBillingStatus.CANCELED}
              className="bg-red-50 text-red-800 hover:bg-red-100"
            >
              ❌ Cancelado
            </SelectItem>
            <SelectItem
              value={EBillingStatus.FAILED}
              className="bg-red-50 text-red-800 hover:bg-red-100"
            >
              💥 Falhou
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        type="submit"
        className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
      >
        Criar Faturamento
      </Button>
    </form>
  )
}
