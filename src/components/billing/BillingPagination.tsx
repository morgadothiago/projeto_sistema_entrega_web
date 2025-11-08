import React from "react"
import { Button } from "@/components/ui/button"
import { FilteredBillings } from "@/app/types/Billing"

interface BillingPaginationProps {
  filters: FilteredBillings | undefined
  onPrevPage: () => void
  onNextPage: () => void
}

export const BillingPagination: React.FC<BillingPaginationProps> = ({
  filters,
  onPrevPage,
  onNextPage,
}) => {
  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <Button
        variant="outline"
        onClick={onPrevPage}
        className="h-12 px-6 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
        disabled={!filters?.page || filters.page <= 1}
      >
        Anterior
      </Button>

      {filters?.page && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white w-12 h-12 flex items-center justify-center rounded-xl font-semibold shadow-lg">
          {filters.page}
        </div>
      )}

      <Button
        variant="outline"
        onClick={onNextPage}
        className="h-12 px-6 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
      >
        Próximo
      </Button>
    </div>
  )
}
