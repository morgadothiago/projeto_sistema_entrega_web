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
import { IPaginateResponse } from "../types/Paginate"
import { BillingFilters, IBillingResponse, NewBilling } from "../types/Billing"
import { Billing } from "../types/Debt"
import { logger } from "@/lib/logger"
import { formatAuthToken } from "@/lib/auth-helpers"

interface IErrorResponse {
  message: string
  status: number
  data?: unknown
}

class ApiService {
  private api: AxiosInstance
  static instance: ApiService
  static token: string = ""

  constructor() {
    const baseURL =
      process.env.NEXT_PUBLIC_NEXTAUTH_API_HOST || "http://localhost:3000"

    logger.debug("API Service initialized", { baseURL })

    this.api = Axios.create({
      baseURL,
    })

    // Interceptador de resposta para tratar erros 401
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Limpar token
          this.cleanToken()
          // Redirecionar para login usando NextAuth
          if (typeof window !== "undefined") {
            // Importar signOut dinamicamente para evitar problemas de SSR
            import("next-auth/react").then(({ signOut }) => {
              signOut({
                callbackUrl: "/signin",
                redirect: true,
              })
            })
          }
        }
        return Promise.reject(error)
      }
    )
  }

  setToken(token: string) {
    if (token) ApiService.token = `Bearer ${token}`
  }

  cleanToken() {
    ApiService.token = ""
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

  async getAllVehicleType(
    page?: number,
    limit?: number,
    token?: string
  ): Promise<IPaginateResponse<VehicleType> | IErrorResponse> {
    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = formatAuthToken(token)
    }

    // Construir params apenas se page e limit forem fornecidos
    const params: Record<string, number> = {}
    if (page !== undefined) params.page = page
    if (limit !== undefined) params.limit = limit

    return this.api
      .get("/vehicle-types", {
        params: Object.keys(params).length > 0 ? params : undefined,
        headers,
      })
      .then(this.getResponse<IPaginateResponse<VehicleType>>)
      .catch(this.getError)
  }
  async getDeliveryDetail(code: string, token: string, socketId?: string) {
    const endpoint = `/gps/delivery/${code}`
    const params = socketId ? { socketId } : {}

    logger.api(endpoint, { code, socketId: socketId || 'none' })

    try {
      const response = await this.api.get(endpoint, {
        headers: { Authorization: formatAuthToken(token) },
        params,
      })
      return this.getResponse<unknown>(response)
    } catch (error) {
      logger.error('Error fetching delivery details', error)
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
    logger.api('/delivery/simulate', data)

    return this.api
      .post("/delivery/simulate", data, {
        headers: {
          Authorization: formatAuthToken(token),
          "Content-Type": "application/json",
        },
      })
      .then(this.getResponse<unknown>)
      .catch((error) => {
        logger.error("Error simulating delivery", {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
        })
        return this.getError(error as AxiosError)
      })
  }

  async getAlldelivery(token: string) {
    return this.api
      .get("/delivery", {
        headers: {
          Authorization: formatAuthToken(token),
          "Content-Type": "application/json",
        },
      })
      .then(this.getResponse<unknown>)
      .catch(this.getError)
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

  static getInstance() {
    return (ApiService.instance ??= new ApiService())
  }
}

export default ApiService.getInstance()
