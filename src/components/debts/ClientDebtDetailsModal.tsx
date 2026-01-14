import React, { useMemo } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Delivery } from "@/types/delivery"
import { VehicleType } from "@/app/types/VehicleType"
import { MessageCircle, Package, DollarSign, X, Percent, Truck } from "lucide-react"
import Link from "next/link"
import api from "@/app/services/api"
import { useAuth } from "@/app/context"
import { toast } from "sonner"

interface ClientDebtDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    clientName: string
    deliveries: Delivery[]
    vehicleTypes: VehicleType[]
}

export const ClientDebtDetailsModal: React.FC<ClientDebtDetailsModalProps> = ({
    isOpen,
    onClose,
    clientName,
    deliveries,
    vehicleTypes,
}) => {
    const { token } = useAuth()
    // Taxa da plataforma (configurável - altere este valor conforme necessário)
    const TAXA_PLATAFORMA = 0 // TODO: Configurar taxa da plataforma

    // Comissão do entregador (para implementação futura)
    const COMISSAO_ENTREGADOR_PERCENTUAL = 0 // TODO: Configurar comissão do entregador

    const totalAmount = useMemo(() => {
        return deliveries.reduce((acc, delivery) => {
            const price = parseFloat(delivery.price)
            return isNaN(price) ? acc : acc + price
        }, 0)
    }, [deliveries])

    const getServiceFee = (vehicleTypeName: string) => {
        const type = vehicleTypes.find(
            (v) => v.type.toLowerCase() === vehicleTypeName.toLowerCase()
        )
        return type ? type.tarifaBase : 0
    }

    // Calcula total das taxas de serviço
    const totalServiceFees = useMemo(() => {
        return deliveries.reduce((acc, delivery) => {
            return acc + getServiceFee(delivery.vehicleType)
        }, 0)
    }, [deliveries, vehicleTypes])

    // Calcula comissão total do entregador (futuro)
    const totalComissaoEntregador = useMemo(() => {
        return (totalAmount * COMISSAO_ENTREGADOR_PERCENTUAL) / 100
    }, [totalAmount])

    // Valor total com taxa da plataforma
    const valorTotalComTaxa = totalAmount + TAXA_PLATAFORMA

    const handleSendNotificationToAdmin = async (deliveries: Delivery[]) => {
        try {
            // Prepara a mensagem com detalhes das entregas
            const deliveryCodes = deliveries.map(d => d.code).join(", ")
            const message = `Solicitação de boleto de pagamento - Cliente: ${clientName}, Total: ${new Intl.NumberFormat(
                "pt-BR",
                { style: "currency", currency: "BRL" }
            ).format(totalAmount)}, Entregas: ${deliveryCodes}`

            // Envia notificação para os admins
            await api.requestPaymentSlip({
                message: message,
                billingKey: undefined // Pode adicionar billing key se tiver
            }, token || undefined)

            toast.success("Solicitação enviada aos administradores!")
            onClose() // Fecha o modal após enviar
        } catch (error) {
            toast.error("Erro ao enviar notificação")
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        {clientName}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Detalhamento de entregas e valores pendentes
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-6">
                    <div className="rounded-xl border border-gray-200 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="font-semibold">Entrega</TableHead>
                                    <TableHead className="font-semibold text-center">Status</TableHead>
                                    <TableHead className="font-semibold text-right">Taxa de Serviço</TableHead>
                                    <TableHead className="font-semibold text-right">Valor Entrega</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deliveries.map((delivery) => {
                                    const serviceFee = getServiceFee(delivery.vehicleType)
                                    const price = parseFloat(delivery.price)

                                    return (
                                        <TableRow key={delivery.code} className="hover:bg-gray-50">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">
                                                        {delivery.code}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {delivery.vehicleType}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        delivery.status === "DELIVERED"
                                                            ? "bg-green-50 text-green-700 border-green-200"
                                                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                                    }
                                                >
                                                    {delivery.status === "DELIVERED"
                                                        ? "Entregue"
                                                        : delivery.status === "PENDING"
                                                            ? "Pendente"
                                                            : delivery.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-gray-600">
                                                {new Intl.NumberFormat("pt-BR", {
                                                    style: "currency",
                                                    currency: "BRL",
                                                }).format(serviceFee)}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-gray-900">
                                                {new Intl.NumberFormat("pt-BR", {
                                                    style: "currency",
                                                    currency: "BRL",
                                                }).format(price)}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Resumo de Valores */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            Resumo de Valores
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Valor das Entregas */}
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                <span className="text-sm text-gray-600">Valor das Entregas</span>
                                <span className="font-semibold text-gray-900">
                                    {new Intl.NumberFormat("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                    }).format(totalAmount)}
                                </span>
                            </div>

                            {/* Taxa de Serviço Total */}
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                    <Percent className="w-4 h-4" />
                                    Taxa de Serviço (Total)
                                </span>
                                <span className="font-semibold text-blue-600">
                                    {new Intl.NumberFormat("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                    }).format(totalServiceFees)}
                                </span>
                            </div>

                            {/* Taxa da Plataforma */}
                            {TAXA_PLATAFORMA > 0 && (
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                    <span className="text-sm text-gray-600">Taxa da Plataforma</span>
                                    <span className="font-semibold text-orange-600">
                                        {new Intl.NumberFormat("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        }).format(TAXA_PLATAFORMA)}
                                    </span>
                                </div>
                            )}

                            {/* Comissão do Entregador (futuro) */}
                            {COMISSAO_ENTREGADOR_PERCENTUAL > 0 && (
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                    <span className="text-sm text-gray-600 flex items-center gap-1">
                                        <Truck className="w-4 h-4" />
                                        Comissão Entregador ({COMISSAO_ENTREGADOR_PERCENTUAL}%)
                                    </span>
                                    <span className="font-semibold text-purple-600">
                                        {new Intl.NumberFormat("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        }).format(totalComissaoEntregador)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Valor Total Final */}
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                </div>
                                <span className="font-medium text-gray-700">Valor Total a Pagar</span>
                            </div>
                            <span className="text-2xl font-bold text-green-700">
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                }).format(valorTotalComTaxa)}
                            </span>
                        </div>

                        {/* Informação sobre taxas */}
                        <p className="text-xs text-gray-500 italic">
                            * A taxa de serviço é calculada com base no tipo de veículo utilizado em cada entrega.
                        </p>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-3 w-full justify-end">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="border-gray-300"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Fechar
                        </Button>
                        <Button
                            onClick={() => handleSendNotificationToAdmin(deliveries)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Solicitar Boleto ao Admin
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
