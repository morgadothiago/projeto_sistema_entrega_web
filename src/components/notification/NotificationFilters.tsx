import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface NotificationFiltersProps {
    activeFilter: "all" | "in_progress" | "finalized"
    onFilterChange: (filter: "all" | "in_progress" | "finalized") => void
    counts: {
        all: number
        in_progress: number
        finalized: number
    }
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
    activeFilter,
    onFilterChange,
    counts,
}) => {
    const filters = [
        { id: "all", label: "Todas", count: counts.all },
        { id: "in_progress", label: "Em Progresso", count: counts.in_progress },
        { id: "finalized", label: "Finalizadas", count: counts.finalized },
    ] as const

    return (
        <div className="flex flex-wrap gap-2 p-1 bg-gray-100/50 rounded-xl w-full md:w-auto">
            {filters.map((filter) => (
                <Button
                    key={filter.id}
                    variant={activeFilter === filter.id ? "default" : "ghost"}
                    onClick={() => onFilterChange(filter.id)}
                    className={`
            flex-1 md:flex-none rounded-lg transition-all duration-300
            ${activeFilter === filter.id
                            ? "bg-white text-blue-600 shadow-md hover:bg-white/90"
                            : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"
                        }
          `}
                >
                    <span className="font-medium mr-2">{filter.label}</span>
                    <Badge
                        variant="secondary"
                        className={`
              ${activeFilter === filter.id
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-200 text-gray-600"
                            }
            `}
                    >
                        {filter.count}
                    </Badge>
                </Button>
            ))}
        </div>
    )
}
