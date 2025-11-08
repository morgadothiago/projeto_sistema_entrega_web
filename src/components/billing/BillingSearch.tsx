import React from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface BillingSearchProps {
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const BillingSearch: React.FC<BillingSearchProps> = ({ onSearch }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <Input
        placeholder="Buscar faturamentos por descrição, valor ou status..."
        onBlur={onSearch}
        className="pl-12 pr-4 h-14 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm hover:shadow-md"
      />
    </div>
  )
}
