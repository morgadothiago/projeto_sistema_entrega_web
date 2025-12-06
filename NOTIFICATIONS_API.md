# 📬 Especificação da API de Notificações

**Data**: 05/12/2025  
**Versão**: 1.0  
**Para**: Backend Team

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Tipos de Notificação](#tipos-de-notificação)
3. [Estrutura de Dados](#estrutura-de-dados)
4. [Endpoints](#endpoints)
5. [Exemplos de Uso](#exemplos-de-uso)
6. [Regras de Negócio](#regras-de-negócio)

---

## 🎯 Visão Geral

Sistema de notificações para administradores receberem alertas de:
- **Pagamentos**: Quando lojistas fazem pagamentos via PIX ou TED
- **Solicitações de Entrega**: Quando entregadores solicitam pagamento por entregas realizadas

---

## 🏷️ Tipos de Notificação

### NotificationType (Enum)
```typescript
enum NotificationType {
  PAYMENT = "PAYMENT",                    // Pagamento de lojista
  DELIVERY_REQUEST = "DELIVERY_REQUEST",  // Solicitação de pagamento de entregador
  WITHDRAWAL_REQUEST = "WITHDRAWAL_REQUEST" // Solicitação de saque (futuro)
}
```

### NotificationStatus (Enum)
```typescript
enum NotificationStatus {
  PENDING = "PENDING",       // Aguardando ação do admin
  APPROVED = "APPROVED",     // Aprovado pelo admin
  REJECTED = "REJECTED",     // Rejeitado pelo admin
  READ = "READ"             // Apenas lida, sem ação
}
```

---

## 📦 Estrutura de Dados

### Notification (Model)

```typescript
interface Notification {
  id: number                          // ID único da notificação
  type: NotificationType              // Tipo da notificação
  status: NotificationStatus          // Status atual
  title: string                       // Título da notificação
  description: string                 // Descrição detalhada
  amount?: number                     // Valor monetário (opcional)
  paymentMethod?: "PIX" | "TED" | "CASH" // Método de pagamento (opcional)
  
  // Informações do usuário relacionado
  userId: number                      // ID do usuário (lojista ou entregador)
  userName: string                    // Nome do usuário
  userEmail: string                   // Email do usuário
  userRole: "COMPANY" | "DELIVERYMAN" // Tipo de usuário
  
  // Metadados
  relatedEntityId?: number            // ID da entidade relacionada (payment ID, delivery ID, etc)
  relatedEntityType?: string          // Tipo da entidade ("payment", "delivery", etc)
  metadata?: Record<string, any>      // Dados adicionais em JSON
  
  // Controle
  isRead: boolean                     // Se foi lida
  createdAt: string                   // Data de criação (ISO 8601)
  updatedAt: string                   // Data de atualização (ISO 8601)
  readAt?: string                     // Data de leitura (ISO 8601, opcional)
  actionedAt?: string                 // Data da ação (aprovação/rejeição)
  actionedBy?: number                 // ID do admin que realizou a ação
}
```

---

## 🔌 Endpoints

### 1. **GET** `/api/notifications` ou `/api/admin/notifications`
Buscar todas as notificações do admin

**Headers:**
```http
Authorization: Bearer {token}
```

**Query Parameters:**
```typescript
{
  page?: number          // Página (default: 1)
  limit?: number         // Itens por página (default: 10)
  type?: NotificationType // Filtrar por tipo
  status?: NotificationStatus // Filtrar por status
  isRead?: boolean       // Filtrar por lidas/não lidas
}
```

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "type": "PAYMENT",
      "status": "PENDING",
      "title": "Pagamento via PIX recebido",
      "description": "Loja XYZ fez um pagamento de R$ 500,00 via PIX aguardando confirmação",
      "amount": 500.00,
      "paymentMethod": "PIX",
      "userId": 123,
      "userName": "Loja XYZ",
      "userEmail": "loja@xyz.com",
      "userRole": "COMPANY",
      "relatedEntityId": 456,
      "relatedEntityType": "payment",
      "metadata": {
        "transactionId": "PIX-123456789",
        "pixKey": "loja@xyz.com"
      },
      "isRead": false,
      "createdAt": "2025-12-05T18:30:00.000Z",
      "updatedAt": "2025-12-05T18:30:00.000Z",
      "readAt": null,
      "actionedAt": null,
      "actionedBy": null
    }
  ],
  "total": 45,
  "currentPage": 1,
  "totalPages": 5,
  "unreadCount": 12,
  "pendingCount": 8
}
```

### 2. **GET** `/api/notifications/unread-count`
Contador de notificações não lidas (para badge)

### 3. **PATCH** `/api/notifications/:id/read`
Marcar notificação como lida

### 4. **POST** `/api/notifications/:id/approve`
Aprovar solicitação

### 5. **POST** `/api/notifications/:id/reject`
Rejeitar solicitação

---

**Arquivo completo com exemplos, schemas SQL e regras de negócio disponível em:**
`/Users/morgado/.gemini/antigravity/brain/4a90e2bc-b644-4684-a9b3-40162615cb66/notifications_api_spec.md`
