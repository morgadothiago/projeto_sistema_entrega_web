import { Billing } from "./Debt"

export interface ICreateBilling {
  type: string
  status: string
  description: string
  amount: number
}

export interface GetBillingsResponse {
  data: Billing[]
  total: number
  currentPage: number
}

export interface NewBilling {
  idUser: number
  amount: number
  description: string
  status: "PENDING" | "PAID" | "CANCELED" | "FAILED"
}
export interface IBillingResponse {
  data: Billing[]
  total: number
}

// ------------------------------------------------------------
export enum EBillingStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  CANCELED = "CANCELED",
  FAILED = "FAILED",
}
export enum EBillingType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export interface updateBilling {
  amount: number
  description: string
  status: EBillingStatus
}

export interface FilteredBillings {
  idUser?: number
  amount: number
  type: EBillingType
  status: EBillingStatus
  description: string
  page?: number
  limit?: number
}

export interface BillingFilters {
  page?: number
  limit?: number
  type?: EBillingType
  status?: EBillingStatus
  amount?: number
  description?: string
}
