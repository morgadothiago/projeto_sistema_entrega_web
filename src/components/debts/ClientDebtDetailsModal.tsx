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
import { MessageCircle, Package, DollarSign, X } from "lucide-react"

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

    const getWhatsAppLink = (deliveries: Delivery[]) => {
        // Tenta pegar o telefone da primeira entrega que tiver um
        const phone = deliveries.find((d) => d.telefone)?.telefone || ""
        const cleanPhone = phone.replace(/\D/g, "")

        if (!cleanPhone) return "#"

        const message = `Olá ${clientName}, segue o detalhamento das suas entregas pendentes. Total: ${new Intl.NumberFormat(
            "pt-BR",
            { style: "currency", currency: "BRL" }
        ).format(totalAmount)}`

        return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`
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

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-full">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Valor Total</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {new Intl.NumberFormat("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                    }).format(totalAmount)}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="flex-1 md:flex-none border-gray-300"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Fechar
                            </Button>
                            <Button
                                className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white"
                                asChild
                            >
                                <a
                                    href={getWhatsAppLink(deliveries)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Chamar no WhatsApp
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
