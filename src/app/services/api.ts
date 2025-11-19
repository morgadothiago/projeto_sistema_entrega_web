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

interface IErrorResponse {
  message: string
  status: number
  data?: any
}

class ApiService {
  private api: AxiosInstance
  static instance: ApiService
  static token: string = ""

  constructor() {
    const baseURL =
      process.env.NEXT_PUBLIC_NEXTAUTH_API_HOST || "http://localhost:3000"

    // DEBUG: Verificar qual URL está sendo usada
    console.log("=== API SERVICE CONFIG ===")
    console.log(
      "NEXT_PUBLIC_NEXTAUTH_API_HOST:",
      process.env.NEXT_PUBLIC_NEXTAUTH_API_HOST
    )
    console.log("Base URL configurada:", baseURL)
    console.log("========================")

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
    const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`
    return this.api
      .get("/users", {
        params: filters,
        headers: {
          Authorization: authToken,
        },
      })
      .then(this.getResponse<IPaginateResponse<IUserPaginate>>)
      .catch(this.getError)
  }

  async getUser(id: string, token: string): Promise<User | IErrorResponse> {
    const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`
    return this.api
      .get(`/users/${id}`, {
        headers: { Authorization: authToken },
      })
      .then(this.getResponse<User>)
      .catch(this.getError)
  }

  async getAllVehicleType(
    page?: number,
    limit?: number,
    token?: string
  ): Promise<IPaginateResponse<VehicleType> | IErrorResponse> {
    const headers: any = {}
    if (token) {
      const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`
      headers.Authorization = authToken
    }

    // Construir params apenas se page e limit forem fornecidos
    const params: any = {}
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
    const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`
    const endpoint = `/gps/delivery/${code}`
    const fullURL = `${this.api.defaults.baseURL}${endpoint}`
    const params = socketId ? { socketId } : {}

    console.log("=== 🚀 REQUISIÇÃO COMPLETA ===")
    console.log("Base URL:", this.api.defaults.baseURL)
    console.log("Endpoint:", endpoint)
    console.log("Full URL:", fullURL)
    console.log("Método:", "GET")
    console.log("📦 Parâmetros enviados:")
    console.log("  - code:", code)
    console.log("  - socketId:", socketId || "❌ NÃO ENVIADO")
    console.log("  - params:", params)
    console.log(
      "  - token:",
      authToken
        ? "✅ Presente (" + authToken.substring(0, 30) + "...)"
        : "❌ FALTANDO"
    )
    console.log(
      "🔗 URL Final:",
      fullURL + (Object.keys(params).length > 0 ? "?socketId=" + socketId : "")
    )
    console.log("=============================")

    try {
      const response = await this.api.get(endpoint, {
        headers: { Authorization: authToken },
        params,
      })
      console.log("✅ getDeliveryDetail - SUCESSO:", response.data)
      return this.getResponse<any>(response)
    } catch (error: any) {
      return this.getError(error)
    }
  }

  async deleteUser(id: string, token: string): Promise<void | IErrorResponse> {
    const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`
    return this.api
      .delete(`/users/${id}`, {
        headers: {
          Authorization: authToken,
        },
      })
      .then(this.getResponse<void>)
      .catch(this.getError)
  }

  async deleteVehicleType(
    type: string,
    token: string
  ): Promise<void | IErrorResponse> {
    const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`
    return this.api
      .delete(`/vehicle-types/${type}`, {
        headers: {
          Authorization: authToken,
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
    const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`
    return this.api
      .patch(`/vehicle-types/${type}`, data, {
        headers: {
          Authorization: authToken,
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
    const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`
    return this.api
      .post("/vehicle-types", data, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      })
      .then(this.getResponse<void>)
      .catch(this.getError)
  }

  async getAndressCompony(token: string) {
    return this.api
      .get("/delivery/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(this.getResponse<any>)
      .catch(this.getError)
  }
  async AddNewDelivery(data: any, token: string) {
    const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`
    return this.api
      .post("/delivery", data, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      })
      .then(this.getResponse<any>)
      .catch(this.getError)
  }

  async simulateDelivery(data: any, token: string) {
    const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`
    console.log(
      "simulateDelivery - Dados enviados:",
      JSON.stringify(data, null, 2)
    )
    console.log("simulateDelivery - Token:", authToken.substring(0, 20) + "...")
    console.log(
      "simulateDelivery - URL:",
      `${this.api.defaults.baseURL}/delivery/simulate`
    )

    return this.api
      .post("/delivery/simulate", data, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      })
      .then(this.getResponse<any>)
      .catch((error) => {
        console.error("simulateDelivery - Erro completo:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        })
        return this.getError(error)
      })
  }

  async getAlldelivery(token: string) {
    const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`
    return this.api
      .get("/delivery", {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      })
      .then(this.getResponse<any>)
      .catch(this.getError)
  }

  async getBillings(
    token: string,
    filters: BillingFilters = { page: 1, limit: 100 }
  ) {
    const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`

    return this.api
      .get("/billing", {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
        params: filters, // <<<<< aqui entram os filtros
      })
      .then(this.getResponse<IBillingResponse>)
      .catch(this.getError)
  }

  async createNewBilling(data: NewBilling, token: string) {
    const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`
    return this.api
      .post("/billing", data, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      })
      .then(this.getResponse<IBillingResponse>)
      .catch(this.getError)
  }

  async upDateBilling(data: Billing, token: string) {
    const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`
    return this.api
      .patch(`/billing/${data.key}`, data, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      })
      .then(this.getResponse<IBillingResponse>)
      .catch(this.getError)
  }

  async createRecipetFile(key: string, file: File, token: string) {
    const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`

    const formData = new FormData()
    formData.append("file", file)

    return this.api
      .post(`/billing/${key}`, formData, {
        headers: {
          Authorization: authToken,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        return this.getResponse<IBillingResponse>(response)
      })
      .catch((error) => {
        return this.getError(error)
      })
  }

  static getInstance() {
    return (ApiService.instance ??= new ApiService())
  }
}

export default ApiService.getInstance()
