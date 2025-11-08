export interface IDebt {
  id: string
  description: string
  value: number
  dueDate: string
  status: "PENDING" | "PAID" | "OVERDUE"
  createdAt: string
  updatedAt: string
  userId: string
}

export interface ICreateDebt {
  description: string
  value: number
  dueDate: string
  userId: string
}

export interface IUpdateDebt {
  description?: string
  value?: number
  dueDate?: string
  status?: "PENDING" | "PAID"
}

export interface IDebtFilter {
  page?: number
  limit?: number
  status?: "PENDING" | "PAID" | "OVERDUE"
  userId?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface Billing {
  id: string
  key: string
  amount: number
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELED" | "FAILED"
  description: string
  createdAt: string
  dueDate: string
  receipts?: Receipt[]
  type: string
}

export interface Receipt {
  id: string
  amount: number
  date: string
  description: string
}
