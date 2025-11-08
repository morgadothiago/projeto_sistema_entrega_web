import React from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Filter } from "lucide-react"
import {
  EBillingStatus,
  EBillingType,
  FilteredBillings,
} from "@/app/types/Billing"

interface BillingFiltersProps {
  filters: FilteredBillings | undefined
  onFilterChange: (prop: keyof FilteredBillings) => (data: any) => void
  onClearFilters: () => void
}

export const BillingFilters: React.FC<BillingFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Select
          value={filters?.status}
          onValueChange={onFilterChange("status")}
        >
          <SelectTrigger className="w-full sm:w-[200px] h-12 border-2 border-gray-200 hover:border-blue-300 transition-colors">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value={EBillingStatus.PAID}
              className="hover:bg-green-50"
            >
              Pago
            </SelectItem>
            <SelectItem
              value={EBillingStatus.PENDING}
              className="hover:bg-yellow-50"
            >
              Pendente
            </SelectItem>
            <SelectItem
              value={EBillingStatus.CANCELED}
              className="hover:bg-red-50"
            >
              Cancelado
            </SelectItem>
            <SelectItem
              value={EBillingStatus.FAILED}
              className="hover:bg-red-50"
            >
              Falhou
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters?.type} onValueChange={onFilterChange("type")}>
          <SelectTrigger className="w-full sm:w-[200px] h-12 border-2 border-gray-200 hover:border-blue-300 transition-colors">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value={EBillingType.INCOME}
              className="hover:bg-green-50"
            >
              Entrada
            </SelectItem>
            <SelectItem
              value={EBillingType.EXPENSE}
              className="hover:bg-red-50"
            >
              Saída
            </SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          className="h-12 px-6 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
          onClick={onClearFilters}
        >
          Limpar Filtros
        </Button>
      </div>
    </div>
  )
}
