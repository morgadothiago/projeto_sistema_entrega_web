import { DeliveryMan } from "./DeliveryMan"

export interface Delivery {
  id: number
  code: string
  height: number
  width: number
  length: number
  weight: number
  information: string
  isFragile: boolean
  price: string // ou number, dependendo de como você trata valores monetários
  companyId: number
  email: string
  telefone: string
  status: DeliveryStatus // ajuste conforme os status possíveis
  completedAt?: string
  deliveryManId?: number
  vehicleType: string // ajuste conforme os tipos disponíveis
  DeliveryMan?: DeliveryMan // pode ser um tipo mais detalhado se necessário
  Routes: DeliveryRoutes[] // idem acima, defina um tipo se houver estrutura conhecida
  ClientAddress: DeliveryRoutes
  OriginAddress: DeliveryRoutes
}
export enum DeliveryStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface DeliveryRoutes {
  longitude: number
  latitude: number
}
