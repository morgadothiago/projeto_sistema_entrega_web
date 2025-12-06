# 📬 Especificação da API de Notificações (Backend)

**Data**: 05/12/2025  
**Status**: Aguardando Implementação  
**Prioridade**: Alta

Este documento descreve **tudo** que o backend precisa implementar para que o sistema de notificações do frontend funcione corretamente, tanto para **Administradores** quanto para **Lojistas (Company)**.

---

## 1. 👮‍♂️ Notificações para ADMIN (Novo Sistema)

O Admin precisa de um sistema dedicado para receber alertas de pagamentos e solicitações.

### 📌 Tipos de Notificação
O frontend espera os seguintes tipos no campo `type`:
1.  `PAYMENT`: Quando um lojista envia um comprovante de PIX ou TED.
2.  `DELIVERY_REQUEST`: Quando um entregador solicita pagamento/saque.

### 🔌 Endpoints Necessários

#### 1.1 Listar Notificações
**GET** `/api/admin/notifications`
- **Objetivo**: Popular a página `/dashboard/admin/notification_admin` e o Dropdown do Header.
- **Filtros esperados (Query Params)**:
    - `page`, `limit`: Paginação.
    - `type`: `PAYMENT` ou `DELIVERY_REQUEST`.
    - `status`: `PENDING`, `APPROVED`, `REJECTED`.
- **Resposta JSON (Exemplo)**:
```json
{
  "data": [
    {
      "id": 1,
      "type": "PAYMENT",
      "title": "Pagamento PIX recebido",
      "description": "Loja XYZ - R$ 500,00",
      "amount": 500.00,
      "status": "PENDING",
      "isRead": false,
      "createdAt": "2025-12-05T20:00:00Z",
      "metadata": { "proofUrl": "..." } // Link do comprovante
    },
    {
      "id": 2,
      "type": "DELIVERY_REQUEST",
      "title": "Solicitação de Saque",
      "description": "Entregador João - R$ 320,50",
      "amount": 320.50,
      "status": "PENDING",
      "isRead": false,
      "createdAt": "2025-12-05T19:30:00Z"
    }
  ],
  "unreadCount": 5 // Importante para o badge do sino
}
```

#### 1.2 Aprovar Solicitação
**POST** `/api/admin/notifications/:id/approve`
- **Ação**:
    - Muda status para `APPROVED`.
    - Se for `PAYMENT`: Confirma o saldo na carteira do lojista.
    - Se for `DELIVERY_REQUEST`: Marca como pago/liberado para o entregador.
    - Marca notificação como lida (`isRead: true`).

#### 1.3 Rejeitar Solicitação
**POST** `/api/admin/notifications/:id/reject`
- **Ação**:
    - Muda status para `REJECTED`.
    - Opcional: Receber motivo da rejeição no body.
    - Marca notificação como lida (`isRead: true`).

#### 1.4 Marcar como Lida
**PATCH** `/api/admin/notifications/:id/read`
- **Ação**: Apenas remove o indicador de "não lida" (badge azul) sem aprovar/rejeitar.

---

## 2. 🏪 Notificações para COMPANY (Lojistas)

Para lojistas, o sistema de notificações no Header funciona monitorando o **status das entregas**.

### 🔌 Endpoints Utilizados
O frontend atualmente utiliza o endpoint existente:
**GET** `/api/deliveries` (ou equivalente que lista entregas da empresa)

### ⚠️ Requisitos para o Backend
Para que o sino do lojista funcione como implementado no frontend, o endpoint de listagem de entregas deve garantir o retorno dos seguintes status corretamente:

1.  `PENDING`: Entrega criada, aguardando entregador.
2.  `IN_TRANSIT` ou `IN_PROGRESS`: Entregador a caminho.
3.  `COMPLETED` ou `DELIVERED`: Entrega finalizada.

**Lógica do Frontend:**
O frontend filtra e exibe no sino as entregas que possuem qualquer um desses status:
```javascript
["PENDING", "IN_TRANSIT", "IN_PROGRESS", "COMPLETED", "DELIVERED"]
```

---

## 3. Resumo da Estrutura de Dados (TypeScript Interface)

Para garantir compatibilidade total, o objeto de notificação do Admin deve seguir esta interface:

```typescript
interface Notification {
  id: number;
  type: "PAYMENT" | "DELIVERY_REQUEST";
  title: string;       // Ex: "Pagamento PIX recebido"
  description: string; // Ex: "Loja XYZ - R$ 500,00"
  amount?: number;     // Valor monetário envolvido
  status: "PENDING" | "APPROVED" | "REJECTED";
  isRead: boolean;     // Controla o badge de não lido
  createdAt: string;   // Data ISO
  metadata?: any;      // Dados extras (ex: URL do comprovante)
}
```

---

## 4. Próximos Passos para o Backend

1.  Criar tabela `notifications` no banco de dados.
2.  Implementar os endpoints de Admin listados acima.
3.  Garantir que ações de Lojistas (enviar PIX) e Entregadores (pedir saque) **criem** registros nessa tabela de notificações automaticamente.
