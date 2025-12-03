import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, Smartphone, Building2, Copy, Check, QrCode } from "lucide-react"
import { toast } from "sonner"

interface PaymentModalProps {
    isOpen: boolean
    onClose: () => void
    totalAmount: number
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    totalAmount,
}) => {
    const [paymentMethod, setPaymentMethod] = useState<"pix" | "transfer" | null>(null)
    const [pixOption, setPixOption] = useState<"qrcode" | "key" | null>(null)
    const [copiedKey, setCopiedKey] = useState(false)

    // Chave PIX de exemplo (substitua pela chave real)
    const pixKey = "contato@sistemaentregas.com.br"

    // QR Code de exemplo (substitua por um QR code real gerado dinamicamente)
    const qrCodeData = "00020126580014br.gov.bcb.pix0136contato@sistemaentregas.com.br52040000530398654041.005802BR5925Sistema de Entregas LTDA6009SAO PAULO62070503***6304"

    const handleCopyPixKey = () => {
        navigator.clipboard.writeText(pixKey)
        setCopiedKey(true)
        toast.success("Chave PIX copiada!", {
            description: "Cole no seu app de pagamento",
        })
        setTimeout(() => setCopiedKey(false), 3000)
    }

    const resetModal = () => {
        setPaymentMethod(null)
        setPixOption(null)
        setCopiedKey(false)
    }

    const handleClose = () => {
        resetModal()
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Efetuar Pagamento
                    </DialogTitle>
                    <DialogDescription className="text-lg">
                        Total a pagar: {" "}
                        <span className="font-bold text-green-600 text-2xl">
                            {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            }).format(totalAmount)}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Escolha do método de pagamento */}
                    {!paymentMethod && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Escolha o método de pagamento
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* PIX */}
                                <Card
                                    className="cursor-pointer border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 group"
                                    onClick={() => setPaymentMethod("pix")}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex flex-col items-center text-center space-y-3">
                                            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl group-hover:scale-110 transition-transform">
                                                <Smartphone className="w-10 h-10 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold text-gray-900">PIX</h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Pagamento instantâneo
                                                </p>
                                                <Badge className="mt-2 bg-green-100 text-green-700 border-green-300">
                                                    Recomendado
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Transferência */}
                                <Card
                                    className="cursor-pointer border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 group"
                                    onClick={() => setPaymentMethod("transfer")}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex flex-col items-center text-center space-y-3">
                                            <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl group-hover:scale-110 transition-transform">
                                                <Building2 className="w-10 h-10 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold text-gray-900">
                                                    Transferência
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    TED/DOC bancária
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* PIX - Escolha de QR Code ou Chave */}
                    {paymentMethod === "pix" && !pixOption && (
                        <div className="space-y-4">
                            <Button
                                variant="ghost"
                                onClick={() => setPaymentMethod(null)}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                ← Voltar
                            </Button>

                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Como deseja pagar com PIX?
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* QR Code */}
                                <Card
                                    className="cursor-pointer border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all duration-300"
                                    onClick={() => setPixOption("qrcode")}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex flex-col items-center text-center space-y-3">
                                            <div className="p-4 bg-purple-100 rounded-2xl">
                                                <QrCode className="w-10 h-10 text-purple-600" />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold text-gray-900">
                                                    QR Code
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Escaneie com seu celular
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Chave PIX */}
                                <Card
                                    className="cursor-pointer border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all duration-300"
                                    onClick={() => setPixOption("key")}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex flex-col items-center text-center space-y-3">
                                            <div className="p-4 bg-blue-100 rounded-2xl">
                                                <Copy className="w-10 h-10 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold text-gray-900">
                                                    Chave PIX
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Copie e cole no app
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* PIX - QR Code */}
                    {paymentMethod === "pix" && pixOption === "qrcode" && (
                        <div className="space-y-4">
                            <Button
                                variant="ghost"
                                onClick={() => setPixOption(null)}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                ← Voltar
                            </Button>

                            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8">
                                <div className="flex flex-col items-center space-y-4">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Escaneie o QR Code
                                    </h3>

                                    {/* Placeholder para QR Code - substitua por um QR code real */}
                                    <div className="bg-white p-6 rounded-2xl shadow-xl">
                                        <div className="w-64 h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                                            <div className="text-center">
                                                <QrCode className="w-32 h-32 text-gray-400 mx-auto mb-4" />
                                                <p className="text-sm text-gray-500">
                                                    QR Code para pagamento PIX
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 text-center max-w-md">
                                        Abra o app do seu banco e escaneie este QR Code para efetuar o pagamento de{" "}
                                        <span className="font-bold text-green-600">
                                            {new Intl.NumberFormat("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            }).format(totalAmount)}
                                        </span>
                                    </p>

                                    <Button
                                        variant="outline"
                                        onClick={() => setPixOption("key")}
                                        className="mt-4"
                                    >
                                        Preferir usar chave PIX →
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PIX - Chave */}
                    {paymentMethod === "pix" && pixOption === "key" && (
                        <div className="space-y-4">
                            <Button
                                variant="ghost"
                                onClick={() => setPixOption(null)}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                ← Voltar
                            </Button>

                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-gray-900 text-center">
                                        Chave PIX
                                    </h3>

                                    <div className="bg-white rounded-xl p-6 border-2 border-blue-200">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 mb-1">
                                                    Tipo: E-mail
                                                </p>
                                                <p className="text-lg font-mono font-bold text-gray-900 break-all">
                                                    {pixKey}
                                                </p>
                                            </div>
                                            <Button
                                                onClick={handleCopyPixKey}
                                                className={`flex-shrink-0 ${copiedKey
                                                        ? "bg-green-600 hover:bg-green-700"
                                                        : "bg-blue-600 hover:bg-blue-700"
                                                    } text-white transition-all`}
                                            >
                                                {copiedKey ? (
                                                    <>
                                                        <Check className="w-4 h-4 mr-2" />
                                                        Copiado!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-4 h-4 mr-2" />
                                                        Copiar
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="bg-blue-100 border border-blue-300 rounded-xl p-4">
                                        <h4 className="font-semibold text-blue-900 mb-2">
                                            Como pagar:
                                        </h4>
                                        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                                            <li>Copie a chave PIX acima</li>
                                            <li>Abra o app do seu banco</li>
                                            <li>Vá em PIX → Pagar</li>
                                            <li>Cole a chave e confirme o valor</li>
                                            <li>
                                                Valor a pagar:{" "}
                                                <span className="font-bold">
                                                    {new Intl.NumberFormat("pt-BR", {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    }).format(totalAmount)}
                                                </span>
                                            </li>
                                        </ol>
                                    </div>

                                    <Button
                                        variant="outline"
                                        onClick={() => setPixOption("qrcode")}
                                        className="w-full"
                                    >
                                        Preferir usar QR Code →
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Transferência Bancária */}
                    {paymentMethod === "transfer" && (
                        <div className="space-y-4">
                            <Button
                                variant="ghost"
                                onClick={() => setPaymentMethod(null)}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                ← Voltar
                            </Button>

                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                                    Dados para Transferência
                                </h3>

                                <div className="space-y-3 bg-white rounded-xl p-6 border-2 border-blue-200">
                                    <div className="grid grid-cols-3 gap-2 pb-2 border-b">
                                        <span className="text-sm font-semibold text-gray-700">
                                            Banco:
                                        </span>
                                        <span className="col-span-2 text-sm text-gray-900">
                                            Banco do Brasil (001)
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 pb-2 border-b">
                                        <span className="text-sm font-semibold text-gray-700">
                                            Agência:
                                        </span>
                                        <span className="col-span-2 text-sm text-gray-900">
                                            1234-5
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 pb-2 border-b">
                                        <span className="text-sm font-semibold text-gray-700">
                                            Conta:
                                        </span>
                                        <span className="col-span-2 text-sm text-gray-900">
                                            12345678-9 (Conta Corrente)
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 pb-2 border-b">
                                        <span className="text-sm font-semibold text-gray-700">
                                            CNPJ:
                                        </span>
                                        <span className="col-span-2 text-sm text-gray-900">
                                            12.345.678/0001-90
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <span className="text-sm font-semibold text-gray-700">
                                            Favorecido:
                                        </span>
                                        <span className="col-span-2 text-sm text-gray-900">
                                            Sistema de Entregas LTDA
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 bg-yellow-100 border border-yellow-300 rounded-xl p-4">
                                    <p className="text-sm text-yellow-900">
                                        <span className="font-semibold">⚠️ Valor a transferir:</span>{" "}
                                        {new Intl.NumberFormat("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        }).format(totalAmount)}
                                    </p>
                                    <p className="text-xs text-yellow-800 mt-2">
                                        Após realizar a transferência, envie o comprovante para:{" "}
                                        <span className="font-semibold">
                                            financeiro@sistemaentregas.com.br
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Botão Fechar */}
                    <div className="flex justify-end pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            className="px-6"
                        >
                            Fechar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
