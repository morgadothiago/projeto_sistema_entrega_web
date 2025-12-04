import React from "react"
import { Delivery } from "@/types/delivery"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Truck, CheckCircle, Clock, XCircle, MapPin } from "lucide-react"

interface NotificationCardProps {
    delivery: Delivery
}

export const NotificationCard: React.FC<NotificationCardProps> = ({ delivery }) => {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case "DELIVERED":
                return {
                    icon: CheckCircle,
                    label: "Entregue",
                    title: "Entrega Finalizada",
                    description: "Sua entrega foi realizada com sucesso.",
                    color: "text-green-600",
                    bgColor: "bg-green-100",
                    borderColor: "border-green-200",
                    gradient: "from-green-50 to-emerald-50"
                }
            case "IN_TRANSIT":
                return {
                    icon: Truck,
                    label: "Em Trânsito",
                    title: "Saiu para Entrega",
                    description: "Sua entrega está a caminho do destino.",
                    color: "text-blue-600",
                    bgColor: "bg-blue-100",
                    borderColor: "border-blue-200",
                    gradient: "from-blue-50 to-indigo-50"
                }
            case "PENDING":
                return {
                    icon: Clock,
                    label: "Pendente",
                    title: "Aguardando Coleta",
                    description: "Sua entrega está aguardando para ser iniciada.",
                    color: "text-yellow-600",
                    bgColor: "bg-yellow-100",
                    borderColor: "border-yellow-200",
                    gradient: "from-yellow-50 to-orange-50"
                }
            case "CANCELLED":
                return {
                    icon: XCircle,
                    label: "Cancelado",
                    title: "Entrega Cancelada",
                    description: "Esta entrega foi cancelada.",
                    color: "text-red-600",
                    bgColor: "bg-red-100",
                    borderColor: "border-red-200",
                    gradient: "from-red-50 to-rose-50"
                }
            default:
                return {
                    icon: Package,
                    label: status,
                    title: "Atualização de Status",
                    description: `Status atualizado para ${status}`,
                    color: "text-gray-600",
                    bgColor: "bg-gray-100",
                    borderColor: "border-gray-200",
                    gradient: "from-gray-50 to-slate-50"
                }
        }
    }

    const config = getStatusConfig(delivery.status)
    const StatusIcon = config.icon

    return (
        <Card className={`border-l-4 ${config.borderColor} hover:shadow-lg transition-all duration-300 group`}>
            <CardContent className="p-4 md:p-6">
                <div className="flex gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl ${config.bgColor} h-fit shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <StatusIcon className={`w-6 h-6 ${config.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <h3 className="font-bold text-gray-900 text-lg">
                                {config.title}
                            </h3>
                            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full w-fit">
                                Código: #{delivery.code}
                            </span>
                        </div>

                        <p className="text-gray-600 text-sm leading-relaxed">
                            {config.description}
                        </p>

                        <div className="pt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                <span className="font-medium text-gray-700">{delivery.Company?.name || "Empresa"}</span>
                            </div>

                            {delivery.completedAt && (
                                <>
                                    <span className="hidden md:block">•</span>
                                    <span className="text-xs">
                                        Finalizado em: {new Date(delivery.completedAt).toLocaleDateString()}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
