import React from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "./Icon"

interface DeliveryHeaderProps {
    onNewDelivery: () => void
}

export const DeliveryHeader: React.FC<DeliveryHeaderProps> = ({
    onNewDelivery,
}) => {
    return (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Lista de Entregas
                    </h1>
                    <p className="text-blue-100 text-lg">
                        Gerencie e acompanhe todas as suas entregas
                    </p>
                </div>
                <Button
                    onClick={onNewDelivery}
                    className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-6 rounded-xl text-base font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                    size="lg"
                >
                    <Icon name="plus" className="mr-2" size="md" />
                    Nova Entrega
                </Button>
            </div>
        </div>
    )
}
