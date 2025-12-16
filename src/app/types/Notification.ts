export enum NotificationType {
    PAYMENT = "PAYMENT",
    DELIVERY_REQUEST = "DELIVERY_REQUEST",
    WITHDRAWAL_REQUEST = "WITHDRAWAL_REQUEST",
    ACTION = "ACTION"
}

export enum NotificationStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    READ = "READ"
}

export interface Notification {
    id: number
    type: NotificationType
    status: NotificationStatus
    title: string
    description: string
    amount?: number
    paymentMethod?: "PIX" | "TED" | "CASH"

    // User info
    userId: number
    userName: string
    userEmail: string
    userRole: "COMPANY" | "DELIVERYMAN"

    // Sender data (quem enviou a notificação)
    senderData?: {
        id: number
        email: string
        role: string
        company?: {
            name: string
            cnpj: string
            phone: string
        }
        deliveryMan?: {
            name: string
            cpf: string
            phone: string
        }
    } | null

    // Metadata
    relatedEntityId?: number
    relatedEntityType?: string
    metadata?: Record<string, any>

    // Control
    isRead: boolean
    createdAt: string
    updatedAt: string
    readAt?: string
    actionedAt?: string
    actionedBy?: number
}

export interface NotificationResponse {
    data: Notification[]
    total: number
    currentPage: number
    totalPages: number
    unreadCount: number
    pendingCount: number
}

export interface UnreadCountResponse {
    unreadCount: number
    pendingCount: number
}
