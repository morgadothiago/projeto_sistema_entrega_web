"use client"

import { createContext, useContext, useEffect, useState } from "react"
import api from "../services/api"
import { useAuth } from "."

interface NotificationContextData {
  notifications: number
  setNotifications: (value: number) => void
  isLoading: boolean
  error: string | null
  refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextData | undefined>(
  undefined
)

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [notifications, setNotifications] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuth()

  const fetchNotifications = async () => {
    if (!token) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await api.getUnreadNotificationsCount(token)

      // Verificar se é uma resposta de erro
      if (response && typeof response === 'object' && 'status' in response && 'message' in response) {
        const errorResponse = response as { status: number; message: string }

        // Se for 404, definir contador como 0 (sem notificações)
        if (errorResponse.status === 404) {
          setNotifications(0)
          return
        }

        // Se for 401, token inválido - silenciar erro
        if (errorResponse.status === 401) {
          console.warn("Token inválido ou expirado para contador de notificações")
          setNotifications(0)
          return
        }

        // Se for 429, rate limit - silenciar erro
        if (errorResponse.status === 429) {
          console.warn("Rate limit atingido para contador - aguardando próximo ciclo")
          return // Manter contador atual
        }

        setError(errorResponse.message || "Erro ao buscar notificações")
        setNotifications(0)
        return
      }

      // Processar resposta de sucesso
      if (response && typeof response === 'object' && 'unreadCount' in response) {
        const countResponse = response as { unreadCount: number }
        setNotifications(countResponse.unreadCount || 0)
      } else {
        setNotifications(0)
      }
    } catch (err) {
      console.error("Erro ao buscar contador de notificações:", err)
      setError("Erro ao buscar notificações")
      setNotifications(0)
    } finally {
      setIsLoading(false)
    }
  }

  // Buscar notificações quando o token estiver disponível
  useEffect(() => {
    if (token) {
      fetchNotifications()
    }
  }, [token])

  // Polling: atualizar contador a cada 5 minutos para evitar rate limit
  useEffect(() => {
    if (!token) return

    const interval = setInterval(() => {
      fetchNotifications()
    }, 300000) // 5 minutos (reduzido de 30s para evitar 429)

    return () => clearInterval(interval)
  }, [token])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        isLoading,
        error,
        refreshNotifications: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context)
    throw new Error("useNotification must be used inside NotificationProvider")
  return context
}
