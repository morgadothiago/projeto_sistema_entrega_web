import { Notification, NotificationStatus, NotificationType } from "@/app/types/Notification";

// In-memory storage for MVP/Demo purposes
// In a real production app, this would be a database connection
export let notifications: Notification[] = [
    {
        id: 1,
        type: NotificationType.PAYMENT,
        status: NotificationStatus.PENDING,
        title: "Pagamento via PIX recebido",
        description: "Loja XYZ fez um pagamento de R$ 500,00 via PIX aguardando confirmação",
        amount: 500,
        paymentMethod: "PIX",
        userId: 123,
        userName: "Loja XYZ",
        userEmail: "loja@xyz.com",
        userRole: "COMPANY",
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 2,
        type: NotificationType.DELIVERY_REQUEST,
        status: NotificationStatus.PENDING,
        title: "Solicitação de pagamento de entrega",
        description: "Entregador João solicitou pagamento de R$ 320,50 referente a 5 entregas",
        amount: 320.50,
        userId: 456,
        userName: "João Silva",
        userEmail: "joao@delivery.com",
        userRole: "DELIVERYMAN",
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 3,
        type: NotificationType.PAYMENT,
        status: NotificationStatus.PENDING,
        title: "TED recebido",
        description: "Loja ABC transferiu R$ 1.200,00 via TED",
        amount: 1200,
        paymentMethod: "TED",
        userId: 789,
        userName: "Loja ABC",
        userEmail: "abc@loja.com",
        userRole: "COMPANY",
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 4,
        type: NotificationType.DELIVERY_REQUEST,
        status: NotificationStatus.APPROVED,
        title: "Solicitação aprovada",
        description: "Pagamento de R$ 180,00 para Maria foi aprovado",
        amount: 180,
        userId: 101,
        userName: "Maria Santos",
        userEmail: "maria@delivery.com",
        userRole: "DELIVERYMAN",
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        updatedAt: new Date().toISOString()
    }
];

export const updateNotification = (id: number, updates: Partial<Notification>) => {
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
        notifications[index] = { ...notifications[index], ...updates, updatedAt: new Date().toISOString() };
        return notifications[index];
    }
    return null;
};

// ==================================================================================
// CONEXÃO COM API EXTERNA (COMENTADO PARA FUTURA IMPLEMENTAÇÃO)
// ==================================================================================
/*
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_NEXTAUTH_API_HOST || "http://localhost:3000";

// Instância do Axios para chamadas Server-Side (Proxy)
const externalApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const fetchNotificationsFromApi = async (token: string, page = 1, limit = 10) => {
    try {
        const response = await externalApi.get(`/admin/notifications?page=${page}&limit=${limit}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar notificações da API externa:", error);
        throw error;
    }
};

export const updateNotificationInApi = async (id: number, action: 'approve' | 'reject' | 'read', token: string) => {
    try {
        const endpoint = action === 'read' 
            ? `/admin/notifications/${id}/read` 
            : `/admin/notifications/${id}/${action}`;
            
        const method = action === 'read' ? 'patch' : 'post';
        
        const response = await externalApi[method](endpoint, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar notificação (${action}) na API externa:`, error);
        throw error;
    }
};
*/
