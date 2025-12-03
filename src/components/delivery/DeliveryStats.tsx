import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Icon } from "./Icon"

interface DeliveryStatsProps {
    totalDeliveries: number
    inProgress: number
    completed: number
    totalRevenue: number
}

export const DeliveryStats: React.FC<DeliveryStatsProps> = ({
    totalDeliveries,
    inProgress,
    completed,
    totalRevenue,
}) => {
    const stats = [
        {
            title: "Total de Entregas",
            value: totalDeliveries,
            icon: "package" as const,
            gradient: "from-blue-500 to-indigo-600",
            bg: "from-blue-50 to-indigo-50",
            textColor: "text-blue-600",
        },
        {
            title: "Em Progresso",
            value: inProgress,
            icon: "truck" as const,
            gradient: "from-yellow-500 to-orange-600",
            bg: "from-yellow-50 to-orange-50",
            textColor: "text-yellow-600",
        },
        {
            title: "Concluídas",
            value: completed,
            icon: "check" as const,
            gradient: "from-green-500 to-emerald-600",
            bg: "from-green-50 to-emerald-50",
            textColor: "text-green-600",
        },
        {
            title: "Receita Total",
            value: new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
            }).format(totalRevenue),
            icon: "dollar" as const,
            gradient: "from-purple-500 to-pink-600",
            bg: "from-purple-50 to-pink-50",
            textColor: "text-purple-600",
        },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <Card
                    key={index}
                    className="group hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-200 rounded-2xl overflow-hidden"
                >
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600 mb-2">
                                    {stat.title}
                                </p>
                                <p className={`text-3xl font-bold ${stat.textColor}`}>
                                    {stat.value}
                                </p>
                            </div>
                            <div
                                className={`p-4 rounded-2xl bg-gradient-to-br ${stat.bg} group-hover:scale-110 transition-transform duration-300`}
                            >
                                <div
                                    className={`p-2 rounded-xl bg-gradient-to-br ${stat.gradient}`}
                                >
                                    <Icon name={stat.icon} className="text-white" size="lg" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
