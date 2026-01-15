/* eslint-disable @typescript-eslint/no-explicit-any */
import Axios, {
  type AxiosInstance,
  type AxiosResponse,
  type AxiosError,
} from "axios"
import type { ILoginResponse } from "../types/SingInType"
import type {
  ICreateUser,
  IFilterUser,
  IUserPaginate,
  User,
} from "../types/User"
import type { VehicleType } from "../types/VehicleType"
import {
  NotificationResponse,
  UnreadCountResponse,
  NotificationType,
  NotificationStatus,
} from "../types/Notification"
import { IPaginateResponse } from "../types/Paginate"
import { BillingFilters, IBillingResponse, NewBilling } from "../types/Billing"
import { Billing } from "../types/Debt"

import { formatAuthToken } from "@/lib/auth-helpers"

interface IErrorResponse {
  message: string
  status: number
  data?: unknown
}

export interface IDeliverySummaryResponse {
  totalDeliveries: number
  totalDelivered: number
  totalPending: number
  totalCancelled: number
  deliveries?: Array<{
    id: number
    code: string
    status: string
    price: string
    createdAt?: string
    completedAt?: string
    clientName?: string
    companyName?: string
    Company?: {
      name: string
    }
    ClientAddress?: any
    OriginAddress?: any
    email?: string
    vehicleType?: string
    telefone?: string
    companyId?: number
  }>
}

class ApiService {
  private api: AxiosInstance
  static instance: ApiService
  private isRefreshing = false // Flag para controlar renovação em andamento
  private failedQueue: Array<{
    resolve: (value?: any) => void
    reject: (reason?: any) => void
  }> = []

  constructor() {
    const baseURL = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3000"

    this.api = Axios.create({
      baseURL,
    })


    // Interceptador    // Response interceptor para tratar erros
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any
        const url = originalRequest.url || ""

        // Se for 401 e não for uma tentativa de retry e NÃO for login
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !url.includes("/auth/login")
        ) {
          // Se já estamos renovando, adicionar à fila
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject })
            })
              .then((token) => {
                originalRequest.headers["Authorization"] = `Bearer ${token}`
                return this.api(originalRequest)
              })
              .catch((err) => {
                return Promise.reject(err)
              })
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            // Importar dynamicamente para evitar circular dependency
            const { getSession, signOut } = await import("next-auth/react")
            const session = await getSession()

            // Verificar se houve erro ao renovar
            if ((session as any)?.error === "RefreshAccessTokenError") {
              this.isRefreshing = false
              this.failedQueue = []

              if (typeof window !== "undefined") {
                import("sonner").then(({ toast }) => {
                  toast.error("Sua sessão expirou. Faça login novamente.")
                })
                await signOut({ redirect: false })
                window.location.href = "/signin"
              }
              return Promise.reject(error)
            }

            // Se temos novo token, tentar novamente
            if ((session as any)?.token) {
              const newToken = (session as any).token

              // Processar fila de requisições que falharam
              this.failedQueue.forEach((prom) => {
                prom.resolve(newToken)
              })
              this.failedQueue = []
              this.isRefreshing = false

              // Atualizar header com novo token
              originalRequest.headers["Authorization"] = `Bearer ${newToken}`

              // Retry request original
              return this.api(originalRequest)
            }
          } catch (refreshError) {
            this.isRefreshing = false
            this.failedQueue.forEach((prom) => {
              prom.reject(refreshError)
            })
            this.failedQueue = []

            if (typeof window !== "undefined") {
              const { signOut } = await import("next-auth/react")
              import("sonner").then(({ toast }) => {
                toast.error("Sessão expirada. Redirecionando...")
              })
              await signOut({ redirect: false })
              window.location.href = "/signin"
            }
            return Promise.reject(refreshError)
          }
        }

        // Tratamento específico para erro 429 (Too Many Requests)
        if (error.response?.status === 429) {
          // Backoff exponencial: 2s, 4s, 8s
          const retryCount = originalRequest._rateLimitRetryCount || 0
          const delay = Math.min(2000 * Math.pow(2, retryCount), 10000) // Max 10s

          // Aguardar com backoff exponencial
          await new Promise((resolve) => setTimeout(resolve, delay))

          // Permitir até 3 tentativas
          if (retryCount < 3) {
            originalRequest._rateLimitRetryCount = retryCount + 1
            return this.api(originalRequest)
          }

          // Após 3 tentativas, mostrar erro ao usuário
          if (typeof window !== "undefined") {
            import("sonner").then(({ toast }) => {
              toast.error(
                "Sistema sobrecarregado. Tente novamente em alguns minutos."
              )
            })
          }
        }

        // Tratamento específico para erro 404 (Not Found / Sem dados)
        if (error.response?.status === 404) {
          const url = originalRequest.url || ""

          // Lista de endpoints que devem retornar dados vazios em vez de erro
          const listEndpoints = [
            "/delivery",
            "/billing",
            "/notifications",
            "/vehicle-types",
            "/users",
          ]

          // Verifica se é um endpoint de listagem
          const isListEndpoint = listEndpoints.some((endpoint) =>
            url.includes(endpoint)
          )

          if (isListEndpoint && typeof window !== "undefined") {
            // Mostra toast informativo em vez de erro (exceto para /delivery que é tratado na página)
            if (!url.includes("/delivery")) {
              import("sonner").then(({ toast }) => {
                toast.info("Não há dados cadastrados", {
                  position: "top-right",
                  duration: 3000,
                })
              })
            }

            // Retorna estrutura baseada na URL
            let emptyData: any = { data: [] }

            if (url.includes("/notifications")) {
              emptyData = {
                notifications: [],
                total: 0,
                currentPage: 1,
                totalPages: 0,
              }
            } else if (url.includes("/users")) {
              emptyData = {
                data: [],
                total: 0,
                currentPage: 1,
                totalPage: 0,
              }
            } else if (url.includes("/delivery")) {
              // Verifica se é listagem ou detalhe
              if (url.includes("/gps/delivery/")) {
                return Promise.reject(error) // Detalhe ainda deve falhar ou ser tratado na página
              }
              emptyData = { data: [] }
            }

            return Promise.resolve({
              data: emptyData,
              status: 200,
              statusText: "OK",
              headers: {},
              config: originalRequest,
            } as AxiosResponse)
          }
        }

        // Outros erros
        if (error.response?.status) {
          const status = error.response.status
          const message = error.response.data

          import("sonner").then(({ toast }) => {
            if (status >= 500 && typeof window !== "undefined") {
              toast.error("Erro no servidor. Tente novamente mais tarde.", {
                position: "top-right",
              })
            }
          })
        }

        return Promise.reject(error)
      }
    )
  }

  async getInfo() {
    this.api.get("")
  }

  async login(
    email: string,
    password: string
  ): Promise<ILoginResponse | IErrorResponse> {
    return this.api
      .post("/auth/login", { email, password })
      .then(this.getResponse<ILoginResponse>)
      .catch(this.getError)
  }

  async newUser(data: ICreateUser): Promise<void | IErrorResponse> {
    const response = await this.api
      .post("/auth/signup/company", data)
      .then(this.getResponse<void>)
      .catch(this.getError)

    return response
  }

  private getResponse<T>(response: AxiosResponse): T {
    return response.data
  }

  private async getError(error: AxiosError<any>): Promise<IErrorResponse> {
    return {
      status: error.response?.status ?? 500,
      message: error.response?.data?.message ?? error.message,
      data: error.response?.data,
    }
  }

  // Helper para criar resposta vazia de listagem paginada
  private createEmptyPaginatedResponse<T>(): IPaginateResponse<T> {
    return {
      data: [] as T[],
      total: 0,
      currentPage: 1,
      totalPage: 0,
    }
  }

  // Helper para verificar se resposta é de erro
  private isErrorResponse(response: any): response is IErrorResponse {
    return (
      response &&
      typeof response === "object" &&
      "status" in response &&
      "message" in response
    )
  }

  async getUsers(
    filters: IFilterUser,
    token: string
  ): Promise<IPaginateResponse<IUserPaginate> | IErrorResponse> {
    return this.api
      .get("/users", {
        params: filters,
        headers: {
          Authorization: formatAuthToken(token),
        },
      })
      .then(this.getResponse<IPaginateResponse<IUserPaginate>>)
      .catch(this.getError)
  }

  async getUser(id: string, token: string): Promise<User | IErrorResponse> {
    return this.api
      .get(`/users/${id}`, {
        headers: { Authorization: formatAuthToken(token) },
      })
      .then(this.getResponse<User>)
      .catch(this.getError)
  }

  private vehicleTypePromise: Promise<IPaginateResponse<VehicleType>> | null =
    null
  private lastVehicleTypeFetch: number = 0
  private cachedVehicleTypeData: IPaginateResponse<VehicleType> | null = null

  async getAllVehicleType(
    token?: string
  ): Promise<IPaginateResponse<VehicleType> | IErrorResponse> {
    const now = Date.now()

    // Se já existe uma requisição em andamento, retorna a mesma promise
    if (this.vehicleTypePromise) {
      return this.vehicleTypePromise
    }

    // Se temos dados em cache com menos de 60 segundos, retorna o cache
    if (this.cachedVehicleTypeData && now - this.lastVehicleTypeFetch < 60000) {
      return Promise.resolve(this.cachedVehicleTypeData)
    }

    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = formatAuthToken(token)
    }

    this.vehicleTypePromise = this.api
      .get("/vehicle-types", { headers })
      .then(this.getResponse<IPaginateResponse<VehicleType>>)
      .then((data) => {
        this.cachedVehicleTypeData = data
        this.lastVehicleTypeFetch = Date.now()
        return data
      })
      .catch(this.getError)
      .finally(() => {
        this.vehicleTypePromise = null
      }) as Promise<IPaginateResponse<VehicleType>>

    return this.vehicleTypePromise
  }

  invalidateVehicleTypeCache() {
    this.cachedVehicleTypeData = null
    this.lastVehicleTypeFetch = 0
  }

  async getDeliveryDetail(code: string, token: string) {
    // Using /delivery/{code} instead of /gps/delivery/{code}
    // The /gps endpoint requires socketId for WebSocket functionality
    const endpoint = `/gps/delivery/${code}`

    try {
      const response = await this.api.get(endpoint, {
        headers: { Authorization: formatAuthToken(token) },
      })
      return this.getResponse<unknown>(response)
    } catch (error) {
      return this.getError(error as AxiosError)
    }
  }

  async deleteUser(id: string, token: string): Promise<void | IErrorResponse> {
    return this.api
      .delete(`/users/${id}`, {
        headers: {
          Authorization: formatAuthToken(token),
        },
      })
      .then(this.getResponse<void>)
      .catch(this.getError)
  }

  async deleteVehicleType(
    type: string,
    token: string
  ): Promise<void | IErrorResponse> {
    this.invalidateVehicleTypeCache()
    return this.api
      .delete(`/vehicle-types/${type}`, {
        headers: {
          Authorization: formatAuthToken(token),
        },
      })
      .then(this.getResponse<void>)
      .catch(this.getError)
  }

  async updateVehicleType(
    type: string,
    data: Partial<VehicleType>,
    token: string
  ): Promise<void | IErrorResponse> {
    this.invalidateVehicleTypeCache()
    return this.api
      .patch(`/vehicle-types/${type}`, data, {
        headers: {
          Authorization: formatAuthToken(token),
          "Content-Type": "application/json",
        },
      })
      .then(this.getResponse<void>)
      .catch(this.getError)
  }

  async createVehicleType(
    data: Partial<VehicleType>,
    token: string
  ): Promise<void | IErrorResponse> {
    this.invalidateVehicleTypeCache()
    return this.api
      .post("/vehicle-types", data, {
        headers: {
          Authorization: formatAuthToken(token),
          "Content-Type": "application/json",
        },
      })
      .then(this.getResponse<void>)
      .catch(this.getError)
  }

  async getAddressCompany(token: string) {
    return this.api
      .get("/delivery/me", {
        headers: { Authorization: formatAuthToken(token) },
      })
      .then(this.getResponse<unknown>)
      .catch(this.getError)
  }
  async AddNewDelivery(data: unknown, token: string) {
    this.invalidateDeliveryCache() // Invalida cache ao criar nova entrega
    return this.api
      .post("/delivery", data, {
        headers: {
          Authorization: formatAuthToken(token),
          "Content-Type": "application/json",
        },
      })
      .then(this.getResponse<unknown>)
      .catch(this.getError)
  }

  async simulateDelivery(data: unknown, token: string) {
    // logger.api('/delivery/simulate', data)

    return this.api
      .post("/delivery/simulate", data, {
        headers: {
          Authorization: formatAuthToken(token),
          "Content-Type": "application/json",
        },
      })
      .then(this.getResponse<unknown>)
      .catch((error) => {
        // logger.error("Error simulating delivery", {
        //   status: error.response?.status,
        //   message: error.response?.data?.message || error.message,
        // })
        return this.getError(error as AxiosError)
      })
  }

  private deliveryPromise: Promise<unknown> | null = null
  private lastDeliveryFetch: number = 0
  private cachedDeliveryData: unknown = null

  async getAlldelivery(token: string) {
    const now = Date.now()

    // Se já existe uma requisição em andamento, retorna a mesma promise
    if (this.deliveryPromise) {
      return this.deliveryPromise
    }

    // Se temos dados em cache com menos de 20 segundos, retorna o cache
    if (this.cachedDeliveryData && now - this.lastDeliveryFetch < 20000) {
      return Promise.resolve(this.cachedDeliveryData)
    }

    this.deliveryPromise = this.api
      .get("/delivery", {
        headers: {
          Authorization: formatAuthToken(token),
          "Content-Type": "application/json",
        },
      })
      .then(this.getResponse<unknown>)
      .then((data) => {
        this.cachedDeliveryData = data
        this.lastDeliveryFetch = Date.now()
        return data
      })
      .catch(this.getError)
      .finally(() => {
        this.deliveryPromise = null
      })

    return this.deliveryPromise
  }

  // Método para invalidar o cache quando houver novas entregas
  invalidateDeliveryCache() {
    this.cachedDeliveryData = null
    this.lastDeliveryFetch = 0
  }

  async getBillings(
    token: string,
    filters: BillingFilters = { page: 1, limit: 100 }
  ) {
    return this.api
      .get("/billing", {
        headers: {
          Authorization: formatAuthToken(token),
          "Content-Type": "application/json",
        },
        params: filters,
      })
      .then(this.getResponse<IBillingResponse>)
      .catch(this.getError)
  }

  async createNewBilling(data: NewBilling, token: string) {
    return this.api
      .post("/billing", data, {
        headers: {
          Authorization: formatAuthToken(token),
          "Content-Type": "application/json",
        },
      })
      .then(this.getResponse<IBillingResponse>)
      .catch(this.getError)
  }

  async upDateBilling(data: Billing, token: string) {
    return this.api
      .patch(`/billing/${data.key}`, data, {
        headers: {
          Authorization: formatAuthToken(token),
          "Content-Type": "application/json",
        },
      })
      .then(this.getResponse<IBillingResponse>)
      .catch(this.getError)
  }

  async createReceiptFile(key: string, file: File, token: string) {
    const formData = new FormData()
    formData.append("file", file)

    return this.api
      .post(`/billing/${key}`, formData, {
        headers: {
          Authorization: formatAuthToken(token),
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        return this.getResponse<IBillingResponse>(response)
      })
      .catch((error) => {
        return this.getError(error as AxiosError)
      })
  }

  async getSummary(token: string) {
    return this.api
      .get("/delivery", {
        headers: {
          Authorization: formatAuthToken(token),
          "Content-Type": "application/json",
        },
      })
      .then(this.getResponse<IDeliverySummaryResponse>)
      .catch(this.getError)
  }

  async getCompanies(token: string) {
    return this.api
      .get("/users", {
        params: { role: "COMPANY" },
        headers: {
          Authorization: formatAuthToken(token),
          "Content-Type": "application/json",
        },
      })
      .then(this.getResponse<unknown>)
      .catch(this.getError)
  }

  async getDeliverymen(token: string) {
    return this.api
      .get("/users", {
        params: { role: "DELIVERY" },
        headers: {
          Authorization: formatAuthToken(token),
          "Content-Type": "application/json",
        },
      })
      .then(this.getResponse<unknown>)
      .catch(this.getError)
  }

  async updateCompanyStatus(
    companyId: number | string,
    status: string,
    information: string,
    token: string
  ): Promise<void | IErrorResponse> {
    return this.api
      .patch(
        `/company/${companyId}/status`,
        { status, information },
        {
          headers: {
            Authorization: formatAuthToken(token),
            "Content-Type": "application/json",
          },
        }
      )
      .then(this.getResponse<void>)
      .catch(this.getError)
  }

  async updateUserStatus(
    id: number | string,
    status: string,
    token: string
  ): Promise<void | IErrorResponse> {
    return this.api
      .patch(
        `/users/${id}/status`,
        { status },
        {
          headers: {
            Authorization: formatAuthToken(token),
            "Content-Type": "application/json",
          },
        }
      )
      .then(this.getResponse<void>)
      .catch(this.getError)
  }

  static getInstance() {
    return (ApiService.instance ??= new ApiService())
  }

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  // Usando backend real NestJS em http://localhost:3000/notifications

  async getNotifications(
    token?: string,
    page = 1,
    limit = 10
  ): Promise<NotificationResponse | IErrorResponse> {
    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = formatAuthToken(token)
    }

    return this.api
      .get(`/notifications`, {
        headers,
        params: { page, limit },
      })
      .then(this.getResponse<NotificationResponse>)
      .catch(this.getError)
  }

  async getUnreadNotificationsCount(
    token?: string
  ): Promise<UnreadCountResponse | IErrorResponse> {
    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = formatAuthToken(token)
    }

    // logger.debug('getUnreadNotificationsCount called', { token: token ? '***' : 'none' })

    return this.api
      .get("/notifications/unread-count", { headers })
      .then(this.getResponse<UnreadCountResponse>)
      .catch(this.getError)
  }

  async markNotificationAsRead(
    id: number,
    token?: string
  ): Promise<any | IErrorResponse> {
    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = formatAuthToken(token)
    }

    // logger.debug('markNotificationAsRead called', { id, token: token ? '***' : 'none' })

    return this.api
      .patch(`/notifications/${id}/read`, {}, { headers })
      .then(this.getResponse)
      .catch(this.getError)
  }

  async approveNotification(
    id: number,
    token?: string
  ): Promise<any | IErrorResponse> {
    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = formatAuthToken(token)
    }

    // logger.debug('approveNotification called', { id, token: token ? '***' : 'none' })

    return this.api
      .post(`/notifications/${id}/approve`, {}, { headers })
      .then(this.getResponse)
      .catch(this.getError)
  }

  async rejectNotification(
    id: number,
    token?: string
  ): Promise<any | IErrorResponse> {
    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = formatAuthToken(token)
    }

    // logger.debug('rejectNotification called', { id, token: token ? '***' : 'none' })

    return this.api
      .post(`/notifications/${id}/reject`, {}, { headers })
      .then(this.getResponse)
      .catch(this.getError)
  }

  /**
   * Solicita boleto de pagamento ao administrador
   * @param data - Dados da solicitação (billingKey e message opcionais)
   * @param token - Token de autenticação
   */
  async requestPaymentSlip(
    data: { billingKey?: string; message?: string },
    token?: string
  ): Promise<void | IErrorResponse> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (token) {
      headers.Authorization = formatAuthToken(token)
    }

    // logger.debug('requestPaymentSlip called', { token: token ? '***' : 'none' })

    return this.api
      .post("/notifications/payment-slip-request", data, { headers })
      .then(this.getResponse<void>)
      .catch(this.getError)
  }
}

export default ApiService.getInstance()
