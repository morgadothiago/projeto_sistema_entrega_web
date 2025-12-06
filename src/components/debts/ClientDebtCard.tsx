import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Package, ChevronRight } from "lucide-react"

interface ClientDebtCardProps {
    clientName: string
    totalDebt: number
    deliveryCount: number
    onClick: () => void
}

export const ClientDebtCard: React.FC<ClientDebtCardProps> = ({
    clientName,
    totalDebt,
    deliveryCount,
    onClick,
}) => {
    return (
        <Card
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer bg-white border-2 border-gray-100 hover:border-blue-200 rounded-2xl overflow-hidden"
            onClick={onClick}
        >
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-600 transition-colors duration-300">
                            <User className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {clientName}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                    <Package className="w-3 h-3 mr-1" />
                                    {deliveryCount} {deliveryCount === 1 ? "entrega" : "entregas"}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm text-gray-500 font-medium">Total a Pagar</p>
                            <p className="text-xl font-bold text-gray-900">
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                }).format(totalDebt)}
                            </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
