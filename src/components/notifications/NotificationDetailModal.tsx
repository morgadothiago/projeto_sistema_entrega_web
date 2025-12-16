import React from "react"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Building2,
    Mail,
    FileText,
    CheckCircle2,
    XCircle,
    User,
    AlertCircle,
    MessageCircle
} from "lucide-react"
import { Notification, NotificationStatus, NotificationType } from "@/app/types/Notification"
import { User as UserType } from "@/app/types/User"

interface NotificationDetailModalProps {
    isOpen: boolean
    onClose: () => void
    notification: Notification | null
    token: string | null
    onApprove?: (id: number) => void
    onReject?: (id: number) => void
}

export const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
    isOpen,
    onClose,
    notification,
    onApprove,
    onReject,
}) => {
    if (!notification) return null

    // Helper para obter nome do sender
    const getSenderName = () => {
        if (notification.senderData?.company?.name) {
            return notification.senderData.company.name
        }
        if (notification.senderData?.deliveryMan?.name) {
            return notification.senderData.deliveryMan.name
        }
        return notification.userName || 'Usuário Desconhecido'
    }

    // Helper para obter email do sender
    const getSenderEmail = () => {
        return notification.senderData?.email || notification.userEmail || '-'
    }

    // Helper para obter role do sender
    const getSenderRole = () => {
        if (notification.senderData?.role) {
            return notification.senderData.role
        }
        return notification.userRole || 'COMPANY'
    }

    // Helper para obter telefone do sender
    const getSenderPhone = () => {
        if (notification.senderData?.company?.phone) {
            return notification.senderData.company.phone
        }
        if (notification.senderData?.deliveryMan?.phone) {
            return notification.senderData.deliveryMan.phone
        }
        return null
    }

    const formatDate = (date: string | undefined) => {
        if (!date) return '-'
        return new Date(date).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getWhatsAppLink = () => {
        const phone = getSenderPhone()
        if (!phone) return null

        // Remove caracteres não numéricos
        const cleanPhone = phone.replace(/\D/g, '')

        // Adiciona 55 se não tiver
        const fullPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone

        const name = getSenderName()
        const title = notification.title
        const message = `Olá ${name}, sobre a notificação: "${title}" - ${notification.message || notification.description}`

        return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`
    }

    const getStatusColor = (status: NotificationStatus) => {
        switch (status) {
            case NotificationStatus.PENDING:
                return "bg-amber-50 text-amber-700 border-amber-200"
            case NotificationStatus.APPROVED:
                return "bg-emerald-50 text-emerald-700 border-emerald-200"
            case NotificationStatus.REJECTED:
                return "bg-rose-50 text-rose-700 border-rose-200"
            default:
                return "bg-slate-50 text-slate-700 border-slate-200"
        }
    }

    const getStatusIcon = (status: NotificationStatus) => {
        switch (status) {
            case NotificationStatus.PENDING:
                return <AlertCircle className="w-4 h-4 mr-1.5" />
            case NotificationStatus.APPROVED:
                return <CheckCircle2 className="w-4 h-4 mr-1.5" />
            case NotificationStatus.REJECTED:
                return <XCircle className="w-4 h-4 mr-1.5" />
            default:
                return null
        }
    }

    const whatsappLink = getWhatsAppLink()
    const senderPhone = getSenderPhone()

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-white border shadow-2xl rounded-2xl gap-0">

                {/* Header Moderno */}
                <div className="bg-white px-6 pt-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-4">
                            <div className={`p-3 rounded-2xl shadow-sm border ${notification.type === NotificationType.PAYMENT
                                    ? 'bg-blue-50 border-blue-100'
                                    : 'bg-gray-50 border-gray-100'
                                }`}>
                                {notification.type === NotificationType.PAYMENT ? (
                                    <FileText className="w-6 h-6 text-blue-600" />
                                ) : (
                                    <Building2 className="w-6 h-6 text-gray-600" />
                                )}
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-gray-900 leading-tight mb-1">
                                    {notification.title}
                                </DialogTitle>
                                <DialogDescription className="text-gray-500 flex items-center gap-2 text-sm">
                                    #{notification.id} • {formatDate(notification.createdAt)}
                                </DialogDescription>
                            </div>
                        </div>

                        <Badge className={`px-3 py-1.5 text-xs font-semibold border rounded-full ${getStatusColor(notification.status)} shadow-sm`}>
                            {getStatusIcon(notification.status)}
                            {notification.status === NotificationStatus.PENDING && "Pendente"}
                            {notification.status === NotificationStatus.APPROVED && "Aprovado"}
                            {notification.status === NotificationStatus.REJECTED && "Rejeitado"}
                            {notification.status === NotificationStatus.READ && "Lido"}
                        </Badge>
                    </div>
                </div>

                <div className="px-6 py-2 space-y-6 bg-slate-50/50 border-t border-b min-h-[200px]">

                    {/* Grid Principal */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4 mb-4">

                        {/* Coluna da Mensagem (Esq) */}
                        <div className="md:col-span-12">
                            <div className="bg-white p-5 rounded-2xl border shadow-sm">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5" /> Detalhes da Solicitação
                                </h4>
                                <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                                    {notification.description || notification.message || notification.title}
                                </p>
                            </div>
                        </div>

                        {/* Coluna do Usuário (Central) */}
                        <div className="md:col-span-7">
                            <div className="bg-white p-5 rounded-2xl border shadow-sm h-full relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <User className="w-24 h-24" />
                                </div>

                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <User className="w-3.5 h-3.5" /> Dados do Solicitante
                                </h4>

                                <div className="flex items-start gap-4">
                                    <div className="bg-slate-100 p-3 rounded-full border border-slate-200">
                                        <User className="w-6 h-6 text-slate-500" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-base font-bold text-gray-900 leading-none">
                                            {getSenderName()}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                            <Mail className="w-3.5 h-3.5" />
                                            {getSenderEmail()}
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                                                {getSenderRole()}
                                            </span>

                                            {notification.senderData?.deliveryMan?.cpf && (
                                                <span className="text-[10px] font-medium px-2 py-1 rounded-md bg-slate-50 text-slate-500 border border-slate-100">
                                                    CPF: {notification.senderData.deliveryMan.cpf}
                                                </span>
                                            )}
                                            {notification.senderData?.company?.cnpj && (
                                                <span className="text-[10px] font-medium px-2 py-1 rounded-md bg-slate-50 text-slate-500 border border-slate-100">
                                                    CNPJ: {notification.senderData.company.cnpj}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Botão WhatsApp */}
                                {whatsappLink && (
                                    <div className="mt-5 pt-4 border-t border-gray-100">
                                        <Button
                                            variant="outline"
                                            className="w-full bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300 transition-all shadow-sm group/btn"
                                            onClick={() => window.open(whatsappLink, '_blank')}
                                        >
                                            <MessageCircle className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                                            Conversar no WhatsApp
                                            <span className="ml-auto text-xs opacity-60 font-normal">
                                                {senderPhone}
                                            </span>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Coluna Timeline e Metadata (Dir) */}
                        <div className="md:col-span-5 space-y-4">
                            <div className="bg-white p-5 rounded-2xl border shadow-sm">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                    Histórico
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 text-sm">
                                        <div className="mt-0.5 relative">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-50"></div>
                                            <div className="w-0.5 h-full bg-gray-100 absolute top-2 left-0.5 -ml-[1px]"></div>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Notificação Criada</p>
                                            <p className="text-xs text-gray-500">{formatDate(notification.createdAt)}</p>
                                        </div>
                                    </div>

                                    {notification.readAt && (
                                        <div className="flex items-start gap-3 text-sm">
                                            <div className="mt-0.5">
                                                <div className="w-2 h-2 rounded-full bg-green-500 ring-4 ring-green-50"></div>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Visualizada</p>
                                                <p className="text-xs text-gray-500">{formatDate(notification.readAt)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Metadata Mini */}
                            {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                                <div className="bg-gray-900 p-4 rounded-2xl shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                            Metadata
                                        </h4>
                                        <span className="text-[10px] text-gray-500">JSON</span>
                                    </div>
                                    <pre className="text-[10px] text-gray-300 overflow-x-auto font-mono custom-scrollbar">
                                        {JSON.stringify(notification.metadata, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>

                    </div>

                </div>

                <DialogFooter className="px-6 py-5 bg-white border-t gap-3 sm:gap-0">
                    <Button variant="ghost" onClick={onClose} className="mr-auto text-gray-500 hover:text-gray-900">
                        Fechar
                    </Button>

                    {notification.status === NotificationStatus.PENDING && (onApprove || onReject) && (
                        <div className="flex gap-3 w-full sm:w-auto">
                            {onReject && (
                                <Button
                                    onClick={() => {
                                        onReject(notification.id)
                                        onClose()
                                    }}
                                    variant="outline"
                                    className="flex-1 sm:flex-none border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300"
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Rejeitar
                                </Button>
                            )}
                            {onApprove && (
                                <Button
                                    onClick={() => {
                                        onApprove(notification.id)
                                        onClose()
                                    }}
                                    className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-100"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Aprovar Solicitação
                                </Button>
                            )}
                        </div>
                    )}
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}
