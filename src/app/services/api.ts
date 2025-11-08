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
import type { VehicleType, VehicleTypePaginate } from "../types/VehicleType"
import { IPaginateResponse } from "../types/Paginate"
import { signOut } from "next-auth/react"
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
    this.api = Axios.create({
      baseURL: process.env.NEXT_PUBLIC_NEXTAUTH_API_HOST || "",
    })

    // Interceptador de resposta para tratar erros 401
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log("🔒 Token expirado - Redirecionando para login")
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

  async getInfo(token: string | null) {
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
    if (error.response) {
      console.log("Status:", error.response.status)
      console.log("Data:", error.response.data)
      if (error.response.data?.message) {
        console.log("Detalhes:", error.response.data.message)
      }
    }
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
    page: number = 1,
    limit: number = 10
  ): Promise<IPaginateResponse<VehicleType> | IErrorResponse> {
    return this.api
      .get("/vehicle-types", {
        params: { page, limit },
      })
      .then(this.getResponse<IPaginateResponse<VehicleType>>)
      .catch(this.getError)
  }
  async getDeliveryDetail(code: string, token: string, socketId?: string) {
    const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`
    return this.api
      .get(`/delivery/${code}`, {
        headers: { Authorization: authToken },
        params: socketId ? { socketId } : {},
      })
      .then(this.getResponse<any>)
      .catch(this.getError)
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
    return this.api
      .post("/delivery/simulate", data, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      })
      .then(this.getResponse<any>)
      .catch(this.getError)
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

    console.log("🔧 ApiService - Enviando FormData:", {
      key,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      formDataEntries: Array.from(formData.entries()),
    })

    return this.api
      .post(`/billing/${key}`, formData, {
        headers: {
          Authorization: authToken,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log("🔧 ApiService - Response recebido:", response.data)
        return this.getResponse<IBillingResponse>(response)
      })
      .catch((error) => {
        console.log("🔧 ApiService - Erro capturado:", error)
        return this.getError(error)
      })
  }

  static getInstance() {
    return (ApiService.instance ??= new ApiService())
  }
}

export default ApiService.getInstance()
