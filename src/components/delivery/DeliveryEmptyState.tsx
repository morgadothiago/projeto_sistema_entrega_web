import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icon } from "./Icon"

interface DeliveryEmptyStateProps {
    onCreateFirst: () => void
}

export const DeliveryEmptyState: React.FC<DeliveryEmptyStateProps> = ({
    onCreateFirst,
}) => {
    return (
        <Card className="rounded-2xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-blue-50">
            <CardContent className="p-12 text-center">
                <div className="max-w-md mx-auto space-y-6">
                    {/* Icon */}
                    <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                        <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
                            <Icon name="package" className="text-white" size="lg" />
                        </div>
                    </div>

                    {/* Text */}
                    <div className="space-y-3">
                        <h3 className="text-2xl font-bold text-gray-900">
                            Nenhuma entrega encontrada
                        </h3>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            Comece criando sua primeira entrega para acompanhar e gerenciar
                            seus envios de forma eficiente.
                        </p>
                    </div>

                    {/* Button */}
                    <Button
                        onClick={onCreateFirst}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        size="lg"
                    >
                        <Icon name="plus" className="mr-2" size="md" />
                        Criar Primeira Entrega
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
