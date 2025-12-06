import type { User } from "./User"

export interface AuthContextType {
  user: User | null
  token: string | null
  setUser: (data: User) => void
  setToken: (token: string) => void
  isAuthenticated: () => boolean
  loading: boolean // 👈 adiciona aqui
  logout: () => void
}
