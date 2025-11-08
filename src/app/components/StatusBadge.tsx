import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface StatusBadgeProps {
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "CANCELED"
}

const statusMap: Record<
  StatusBadgeProps["status"],
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pendente",
    className: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  IN_PROGRESS: {
    label: "Em andamento",
    className: "bg-blue-100 text-blue-800 border-blue-300",
  },
  COMPLETED: {
    label: "Concluída",
    className: "bg-green-100 text-green-800 border-green-300",
  },
  CANCELLED: {
    label: "Cancelada",
    className: "bg-red-500 text-white border-red-700",
  },
  CANCELED: {
    label: "Cancelada",
    className: "bg-red-500 text-white border-red-700",
  },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = statusMap[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800 border-gray-300",
  }
  const feedback = `Status da entrega: ${label}`
  const badgeContent =
    status === "CANCELLED" || status === "CANCELED" ? (
      <span
        className={
          className +
          " px-3 py-1 text-xs font-semibold border rounded-md inline-block transition-all duration-200"
        }
      >
        {label}
      </span>
    ) : (
      <Badge
        className={
          className +
          " px-3 py-1 text-xs font-semibold border transition-all duration-200"
        }
      >
        {label}
      </Badge>
    )
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
        <TooltipContent side="top" className="animate-fade-in">
          {feedback}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
