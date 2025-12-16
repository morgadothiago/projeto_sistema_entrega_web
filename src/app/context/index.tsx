"use client"
import React, { createContext, useContext, useEffect, useState } from "react"
import type { User } from "../types/User"
import type { AuthContextType } from "../types/AuthContextType"
import { getSession, signOut } from "next-auth/react"
import { logger } from "@/lib/logger"
import { toast } from "sonner"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true)
        const data = await getSession()

        // Verificar se houve erro ao renovar token
        if ((data as any)?.error === "RefreshAccessTokenError") {
          console.error("❌ RefreshAccessTokenError detectado - fazendo logout")
          toast.error("Sua sessão expirou. Faça login novamente.")
          await signOut({ redirect: false })
          if (typeof window !== "undefined") {
            window.location.href = "/signin"
          }
          return
        }

        // Se for erro de rate limit, não fazer logout imediatamente
        if ((data as any)?.error === "RateLimitError") {
          console.warn("⚠️ RateLimitError detectado - aguardando próxima tentativa")
          // Não fazer logout, deixar o sistema tentar novamente
          return
        }

        if (data) {
          const userData = (data as unknown as { user: User })?.user
          const sessionToken = (data as unknown as { token?: string })?.token

          if (userData && sessionToken) {
            console.log("✅ Sessão válida carregada")
            setUser(userData)
            setToken(sessionToken)
          } else {
            logger.warn("Token or user not found in session")
          }
        } else {
          logger.warn("Session not available")
        }
      } catch (error) {
        logger.error("Error fetching session", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()

    // REMOVIDO: Intervalo automático de verificação
    // O interceptador do Axios irá detectar tokens expirados automaticamente
    // e renovar via session quando necessário. Isso evita requisições desnecessárias.
  }, [])

  const isAuthenticated = (): boolean => {
    return !!token
  }

  const logout = () => {
    console.log("🚪 Logout executado")
    setUser(null)
    setToken(null)
  }

  const value = {
    user,
    setUser,
    token,
    setToken,
    loading,
    logout,
    isAuthenticated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
