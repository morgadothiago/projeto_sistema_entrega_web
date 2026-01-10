"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/app/context"
import { Bell, LogOutIcon, Menu, User2, Settings, Package, Truck, Clock, CheckCircle, XCircle } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

import { signOut } from "next-auth/react"
import api from "@/app/services/api"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Delivery } from "@/types/delivery"
import { NotificationResponse, NotificationType } from "@/app/types/Notification"

import LogoMarca from "../../../../public/Logo.png"

interface ApiResponse {
  data?: Delivery[] | { data: Delivery[] }
}

type DeliveryApiResponse = Delivery[] | ApiResponse | unknown

export default function Header() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [notificationCount, setNotificationCount] = useState(0)
  const [recentNotifications, setRecentNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!token || !user?.role) return

    let cancelled = false

    const fetchNotifications = async () => {
      // Delay maior para evitar conflito com NotificationContext e rate limit
      await new Promise(resolve => setTimeout(resolve, 2000))

      if (cancelled) return

      try {
        // ADMIN: Buscar notificações de pagamentos e solicitações
        if (user?.role === "ADMIN") {
          const response = await api.getNotifications(token)

          // Verificar se é erro de autenticação
          if (response && typeof response === 'object' && 'status' in response) {
            const errorResponse = response as { status: number; message: string }
            if (errorResponse.status === 401) {
              console.warn("Token inválido ou expirado para notificações")
              return
            }
            if (errorResponse.status === 429) {
              console.warn("Rate limit atingido para notificações - aguardando próximo ciclo")
              return
            }
          }

          // Backend agora retorna estrutura paginada: { data: [...], total, page, ... }
          let notifications: any[] = []

          if (response && typeof response === 'object') {
            // Se response tem propriedade 'data' que é um array
            if ('data' in response && Array.isArray(response.data)) {
              notifications = response.data
            }
            // Se response já é o array diretamente
            else if (Array.isArray(response)) {
              notifications = response
            }
          }

          if (Array.isArray(notifications) && notifications.length > 0) {
            const unreadNotifications = notifications.filter(n => !n.isRead)
            setNotificationCount(unreadNotifications.length)
            setRecentNotifications(unreadNotifications.slice(0, 3))
          } else {
            setNotificationCount(0)
            setRecentNotifications([])
          }


        } else {
          // COMPANY/STORE: Buscar status de entregas (PENDING, IN_PROGRESS, COMPLETED)
          const response = await api.getAlldelivery(token) as DeliveryApiResponse
          let deliveries: Delivery[] = []

          if (Array.isArray(response)) {
            deliveries = response as Delivery[]
          } else if (response && typeof response === 'object' && 'data' in response) {
            const apiResponse = response as ApiResponse
            if (Array.isArray(apiResponse.data)) {
              deliveries = apiResponse.data
            } else if (apiResponse.data && typeof apiResponse.data === 'object' && 'data' in apiResponse.data) {
              const nestedData = apiResponse.data as { data: Delivery[] }
              if (Array.isArray(nestedData.data)) {
                deliveries = nestedData.data
              }
            }
          }

          // Filtrar entregas relevantes: PENDING, IN_PROGRESS (IN_TRANSIT), COMPLETED
          const relevantDeliveries = deliveries.filter(d =>
            ["PENDING", "IN_TRANSIT", "IN_PROGRESS", "COMPLETED", "DELIVERED"].includes(d.status)
          )

          setNotificationCount(relevantDeliveries.length)
          setRecentNotifications(relevantDeliveries.slice(0, 3))
        }

      } catch (error) {
      }
    }

    fetchNotifications()

    return () => {
      cancelled = true
    }

    // Polling removido: Notificações são gerenciadas pelo NotificationContext
    // Entregas serão atualizadas quando o usuário navegar para a página de entregas
  }, [token, user?.role])

  const handleLogOut = async () => {
    await signOut({ redirect: false })
    router.push("/signin")
  }

  const balanceValue = Number(user?.Balance?.amount || 0)
  const isNegative = balanceValue < 0

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "IN_TRANSIT": return <Truck className="w-4 h-4 text-blue-500" />
      case "PENDING": return <Clock className="w-4 h-4 text-yellow-500" />
      case "DELIVERED": return <CheckCircle className="w-4 h-4 text-green-500" />
      case "CANCELLED": return <XCircle className="w-4 h-4 text-red-500" />
      default: return <Package className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-2 sm:px-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger
            className="lg:hidden hover:bg-gray-100 transition-colors rounded-lg"
            size="lg"
            variant="ghost"
            aria-label="Abrir menu lateral"
          >
            <Menu className="h-5 w-5" />
          </SidebarTrigger>

          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <Image
                src={LogoMarca}
                alt={user?.Company?.name || "Logo da empresa"}
                width={40}
                height={40}
                priority
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user?.Company?.name?.charAt(0) || user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="hidden sm:flex flex-col">
              <span className="text-xs text-gray-500">Bem-vindo,</span>
              <span className="font-bold text-sm text-gray-800 truncate max-w-[150px]">
                {user?.Company?.name || user?.name || "Usuário"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border transition-colors ${isNegative
            ? 'bg-red-50 border-red-200'
            : 'bg-primary/5 border-primary/10'
            }`}>
            <span className="text-xs sm:text-sm font-medium text-gray-600 hidden md:flex">
              Saldo:
            </span>
            <span className={`font-bold text-sm sm:text-base ${isNegative ? 'text-red-600' : 'text-primary'
              }`}>
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL"
              }).format(balanceValue)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-gray-100 rounded-lg"
                  aria-label={`Notificações${notificationCount > 0 ? ` - ${notificationCount} não lidas` : ''}`}
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  {notificationCount > 0 && (
                    <Badge
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 hover:bg-red-600 text-white text-[10px] rounded-full animate-pulse"
                    >
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Notificações</h4>
                    {notificationCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {notificationCount} novas
                      </Badge>
                    )}
                  </div>

                  {notificationCount === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                      <Bell className="w-8 h-8 text-gray-300" />
                      <p className="text-sm text-gray-500">
                        Nenhuma notificação nova
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {user?.role === "ADMIN" ? (
                        // Admin notifications (payments & requests)
                        recentNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => router.push("/dashboard/admin/notification_admin")}
                          >
                            <div className={`p-2 rounded-full flex-shrink-0 mt-1 ${notification.type === NotificationType.PAYMENT ? "bg-green-100" : "bg-purple-100"
                              }`}>
                              {notification.type === NotificationType.PAYMENT ? (
                                <Package className="w-4 h-4 text-green-600" />
                              ) : (
                                <Truck className="w-4 h-4 text-purple-600" />
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {notification.description}
                              </p>
                              {notification.amount && (
                                <p className="text-xs font-semibold text-green-600">
                                  R$ {notification.amount.toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        // Company/Store notifications (deliveries)
                        recentNotifications.map((notification) => (
                          <div
                            key={notification.code}
                            className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => router.push(`/dashboard/store/delivery/${notification.code}`)}
                          >
                            <div className="mt-1">
                              {getStatusIcon(notification.status)}
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium text-gray-900">
                                Entrega #{notification.code}
                              </p>
                              <p className="text-xs text-gray-500">
                                Status: {
                                  notification.status === 'IN_TRANSIT' || notification.status === 'IN_PROGRESS' ? 'Em Trânsito' :
                                    notification.status === 'DELIVERED' || notification.status === 'COMPLETED' ? 'Entregue' :
                                      notification.status === 'PENDING' ? 'Pendente' :
                                        notification.status === 'CANCELLED' || notification.status === 'CANCELED' ? 'Cancelado' :
                                          notification.status
                                }
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      {notificationCount > 3 && (
                        <p className="text-xs text-center text-gray-500 pt-2">
                          E mais {notificationCount - 3} atualizações...
                        </p>
                      )}
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    className="w-full text-xs border-t pt-4 h-auto hover:bg-transparent hover:text-blue-600"
                    onClick={() => router.push(
                      user?.role === "ADMIN"
                        ? "/dashboard/admin/notification_admin"
                        : "/dashboard/store/notification"
                    )}
                  >
                    Ver todas as notificações
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="flex items-center rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 flex-shrink-0 p-0 w-10 h-10 justify-center transition-all"
                  aria-label="Menu do usuário"
                >
                  <User2 className="w-5 h-5 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 mt-2 rounded-xl shadow-xl border bg-white"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || user?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    {user?.role && (
                      <Badge variant="outline" className="w-fit text-xs mt-1">
                        {user.role === "ADMIN" ? "Administrador" : "Usuário"}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3 py-2 hover:bg-primary/10 cursor-pointer"
                  onClick={() => router.push("/dashboard/profile")}
                >
                  <User2 className="w-4 h-4 text-primary" />
                  <span>Meu Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3 py-2 hover:bg-primary/10 cursor-pointer"
                  onClick={() => router.push("/dashboard/settings")}
                >
                  <Settings className="w-4 h-4 text-primary" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-600"
                  onClick={handleLogOut}
                >
                  <LogOutIcon className="w-4 h-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
