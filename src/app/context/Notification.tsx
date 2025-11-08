"use client"

import { createContext, useContext, useEffect, useState } from "react"

interface NotificationContextData {
  notifications: number
  setNotifications: (value: number) => void
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

  // 🔹 Mock: atualiza número de notificações a cada 7 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications((prev) => (prev >= 5 ? 0 : prev + 1))
    }, 7000)

    return () => clearInterval(interval)
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
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
