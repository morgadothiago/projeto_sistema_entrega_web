import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icon } from "./Icon"

interface DeliveryFiltersProps {
    currentFilter: "ALL" | "IN_PROGRESS" | "DELIVERED"
    onFilterChange: (filter: "ALL" | "IN_PROGRESS" | "DELIVERED") => void
    counts: {
        all: number
        inProgress: number
        delivered: number
    }
}

export const DeliveryFilters: React.FC<DeliveryFiltersProps> = ({
    currentFilter,
    onFilterChange,
    counts,
}) => {
    const filters = [
        {
            id: "ALL" as const,
            label: "Todos",
            count: counts.all,
            color: "text-gray-700 bg-gray-100 hover:bg-gray-200 border-gray-300",
            activeColor: "text-white bg-blue-600 hover:bg-blue-700 border-blue-600",
        },
        {
            id: "IN_PROGRESS" as const,
            label: "Em Progresso",
            count: counts.inProgress,
            color: "text-yellow-700 bg-yellow-100 hover:bg-yellow-200 border-yellow-300",
            activeColor: "text-white bg-yellow-600 hover:bg-yellow-700 border-yellow-600",
        },
        {
            id: "DELIVERED" as const,
            label: "Entregues",
            count: counts.delivered,
            color: "text-green-700 bg-green-100 hover:bg-green-200 border-green-300",
            activeColor: "text-white bg-green-600 hover:bg-green-700 border-green-600",
        },
    ]

    return (
        <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-4">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <Icon name="filter" className="text-gray-500" size="md" />
                    <span className="text-sm font-semibold text-gray-700">Filtrar por:</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {filters.map((filter) => (
                        <Button
                            key={filter.id}
                            onClick={() => onFilterChange(filter.id)}
                            className={`rounded-full transition-all duration-300 border-2 ${currentFilter === filter.id ? filter.activeColor : filter.color
                                }`}
                            variant="outline"
                            size="sm"
                        >
                            {filter.label}
                            <Badge
                                className={`ml-2 ${currentFilter === filter.id
                                        ? "bg-white/30 text-white"
                                        : "bg-gray-200 text-gray-700"
                                    } border-0`}
                            >
                                {filter.count}
                            </Badge>
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    )
}
