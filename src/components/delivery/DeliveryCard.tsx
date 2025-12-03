import React from "react"
import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Delivery } from "@/types/delivery"
import { Icon } from "./Icon"

interface DeliveryCardProps {
    delivery: Delivery
    onClick: () => void
}

export const DeliveryCard: React.FC<DeliveryCardProps> = ({
    delivery,
    onClick,
}) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "DELIVERED":
                return "bg-green-100 text-green-700 border-green-200"
            case "IN_TRANSIT":
                return "bg-blue-100 text-blue-700 border-blue-200"
            case "PENDING":
                return "bg-yellow-100 text-yellow-700 border-yellow-200"
            case "CANCELLED":
                return "bg-red-100 text-red-700 border-red-200"
            default:
                return "bg-gray-100 text-gray-700 border-gray-200"
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "DELIVERED":
                return "Entregue"
            case "IN_TRANSIT":
                return "Em Trânsito"
            case "PENDING":
                return "Pendente"
            case "CANCELLED":
                return "Cancelado"
            default:
                return status
        }
    }

    const getVehicleIcon = (vehicleType: string) => {
        if (vehicleType === "Bike") return "🏍️"
        if (vehicleType === "Car") return "🚗"
        if (vehicleType === "Truck") return "🚚"
        if (vehicleType === "Van") return "🚐"
        return "📦"
    }

    return (
        <Card
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer bg-white border-2 border-gray-100 hover:border-blue-200 rounded-2xl overflow-hidden"
            onClick={onClick}
        >
            <CardHeader className="p-6 pb-4">
                <div className="flex flex-col space-y-4">
                    {/* Header with status and vehicle type */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                                <Icon name="package" size="md" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 font-medium">
                                    Código
                                </span>
                                <span className="text-sm font-bold text-gray-900">
                                    {delivery.code}
                                </span>
                            </div>
                        </div>
                        <Badge className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.status)}`}>
                            {getStatusLabel(delivery.status)}
                        </Badge>
                    </div>

                    {/* Company info */}
                    <div className="space-y-2">
                        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {delivery.Company?.name || "N/A"}
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-sm">
                            {delivery.email}
                        </CardDescription>
                    </div>

                    {/* Additional info */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                            <span className="text-2xl">{getVehicleIcon(delivery.vehicleType)}</span>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500">Veículo</span>
                                <span className="text-sm font-semibold text-gray-700">
                                    {delivery.vehicleType}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                            <div className="p-1.5 rounded-full bg-green-100">
                                <Icon name="dollar" className="text-green-600" size="sm" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500">Preço</span>
                                <span className="text-sm font-semibold text-gray-700">
                                    R$ {parseFloat(delivery.price).toFixed(2).replace(".", ",")}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Phone and fragile indicator */}
                    {(delivery.telefone || delivery.isFragile) && (
                        <div className="flex items-center gap-2 flex-wrap">
                            {delivery.telefone && (
                                <span className="text-xs text-gray-500">
                                    📞 {delivery.telefone}
                                </span>
                            )}
                            {delivery.isFragile && (
                                <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                                    ⚠️ Frágil
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-6 pt-0">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-300 font-semibold"
                    onClick={(e) => {
                        e.stopPropagation()
                        onClick()
                    }}
                >
                    <Icon name="eye" className="mr-2" size="sm" />
                    Ver Detalhes
                </Button>
            </CardContent>
        </Card>
    )
}
