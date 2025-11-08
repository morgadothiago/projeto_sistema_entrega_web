import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, DollarSign } from "lucide-react"

interface BillingEmptyStateProps {
  onCreateFirst: () => void
}

export const BillingEmptyState: React.FC<BillingEmptyStateProps> = ({
  onCreateFirst,
}) => {
  return (
    <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm border-2 border-dashed border-gray-300">
      <CardContent>
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Nenhum faturamento encontrado
        </h3>
        <p className="text-gray-500 mb-6">
          Comece criando seu primeiro faturamento para organizar suas finanças
        </p>
        <Button
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-3 transition-all duration-300 hover:scale-105 shadow-lg"
          onClick={onCreateFirst}
        >
          <Plus className="w-5 h-5 mr-2" />
          Criar Primeiro Faturamento
        </Button>
      </CardContent>
    </Card>
  )
}
