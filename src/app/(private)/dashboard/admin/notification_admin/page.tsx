"use client"

import { useAuth } from "@/app/context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { signOut } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Bell,
  DollarSign,
  Truck,
  CheckCircle2,
  X,
  Eye,
  Filter,
  Clock,
  Banknote,
  CreditCard,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import api from "@/app/services/api"
import { Notification, NotificationType, NotificationStatus, NotificationResponse } from "@/app/types/Notification"
import { notiFicationApi } from "@/app/services/NotificationApi"
import { NotificationDetailModal } from "@/components/notifications/NotificationDetailModal"

export default function NotificationAdmin() {
  const { token, loading } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"all" | "payment" | "delivery">("all")
  const [isMounted, setIsMounted] = useState(false)

  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(3) // Limite de itens por página
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)

  // Modal de detalhes
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && !token) {
      signOut({ callbackUrl: "/signin" })
      return
    }

    if (token) {
      fetchNotifications()

      // Auto-refresh a cada 30 segundos para verificar novas notificações
      const interval = setInterval(() => {
        if (!document.hidden) {
          fetchNotifications()
        }
      }, 30000) // ✅ 30 segundos (antes era 60)
      return () => clearInterval(interval)
    }
  }, [token, loading])

  const fetchNotifications = async (page = currentPage) => {
    if (!token) return

    // Não mostrar loading no polling (apenas na primeira carga se lista vazia)
    if (notifications.length === 0) setIsLoading(true)

    try {
      const response = await notiFicationApi.get(`/notifications?page=${page}&limit=${itemsPerPage}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      // console.log('✅ Response completa:', response.data)

      // Processar resposta
      if (response.data && response.data.data) {
        const notificationsList = response.data.data
        const total = response.data.total || 0
        const totalPgs = response.data.totalPages || Math.ceil(total / itemsPerPage)

        if (Array.isArray(notificationsList)) {
          setNotifications(notificationsList)
          setTotalItems(total)
          setTotalPages(totalPgs)
          // console.log(`✅ ${notificationsList.length} de ${total} notificações carregadas (página ${page}/${totalPgs})`)
        } else {
          // console.error("❌ Notifications data is not an array:", notificationsList)
          setNotifications([])
          setTotalItems(0)
          setTotalPages(0)
        }
      } else {
        // console.log('⚠️ Nenhuma notificação encontrada')
        setNotifications([])
        setTotalItems(0)
        setTotalPages(0)
      }

    } catch (error) {
      // console.error("❌ Erro ao buscar notificações:", error)
      toast.error("Erro ao atualizar notificações")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      fetchNotifications(nextPage)
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1
      setCurrentPage(prevPage)
      fetchNotifications(prevPage)
    }
  }

  const handleGoToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      fetchNotifications(page)
    }
  }

  const handleApprove = async (id: number) => {
    if (!token) return

    toast.loading("Aprovando...", { id: `approve-${id}` })

    try {
      await api.approveNotification(id, token)

      // Atualizar estado local otimisticamente
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, status: NotificationStatus.APPROVED, isRead: true } : n)
      )

      toast.success("Aprovado com sucesso!", { id: `approve-${id}` })
    } catch (error) {
      // console.error("Erro ao aprovar:", error)
      toast.error("Erro ao aprovar solicitação", { id: `approve-${id}` })
    }
  }

  const handleReject = async (id: number) => {
    if (!token) return

    toast.loading("Rejeitando...", { id: `reject-${id}` })

    try {
      await api.rejectNotification(id, token)

      // Atualizar estado local otimisticamente
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, status: NotificationStatus.REJECTED, isRead: true } : n)
      )

      toast.success("Rejeitado", { id: `reject-${id}` })
    } catch (error) {
      // console.error("Erro ao rejeitar:", error)
      toast.error("Erro ao rejeitar solicitação", { id: `reject-${id}` })
    }
  }

  const handleMarkAsRead = async (id: number) => {
    if (!token) return

    try {
      await api.markNotificationAsRead(id, token)

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
    } catch (error) {
      // console.error("Erro ao marcar como lida:", error)
    }
  }

  const getFilteredNotifications = () => {
    if (activeTab === "payment") {
      return notifications.filter(n => n.type === NotificationType.PAYMENT)
    }
    if (activeTab === "delivery") {
      return notifications.filter(n => n.type === NotificationType.DELIVERY_REQUEST)
    }
    return notifications
  }

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)

    if (seconds < 60) return 'agora mesmo'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min atrás`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`
    return `${Math.floor(seconds / 86400)}d atrás`
  }

  const unreadCount = notifications.filter(n => !n.isRead).length
  const pendingCount = notifications.filter(n => n.status === NotificationStatus.PENDING).length

  if (!isMounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notificações</h1>
                <p className="text-gray-600 mt-1">
                  Gerencie pagamentos e solicitações
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-8 px-3">
                  {unreadCount} não lidas
                </Badge>
              )}
              {pendingCount > 0 && (
                <Badge className="h-8 px-3 bg-yellow-500 hover:bg-yellow-600">
                  {pendingCount} pendentes
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200">
            <TabsTrigger value="all" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Filter className="h-4 w-4 mr-2" />
              Todas ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="payment" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <DollarSign className="h-4 w-4 mr-2" />
              Pagamentos ({notifications.filter(n => n.type === NotificationType.PAYMENT).length})
            </TabsTrigger>
            <TabsTrigger value="delivery" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              <Truck className="h-4 w-4 mr-2" />
              Entregas ({notifications.filter(n => n.type === NotificationType.DELIVERY_REQUEST).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : getFilteredNotifications().length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Nenhuma notificação
                  </h3>
                  <p className="text-gray-500">
                    Você está em dia com todas as notificações
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {getFilteredNotifications().map((notification) => (
                  <Card
                    key={notification.id}
                    className={`transition-all duration-300 hover:shadow-lg border-l-4 ${notification.type === NotificationType.PAYMENT
                      ? "border-l-green-500 bg-green-50/30"
                      : "border-l-purple-500 bg-purple-50/30"
                      } ${!notification.isRead ? "ring-2 ring-blue-200" : ""}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                          className={`p-3 rounded-full flex-shrink-0 ${notification.type === NotificationType.PAYMENT
                            ? "bg-green-100"
                            : "bg-purple-100"
                            }`}
                        >
                          {notification.type === NotificationType.PAYMENT ? (
                            notification.paymentMethod === "PIX" ? (
                              <Banknote className="h-6 w-6 text-green-600" />
                            ) : (
                              <CreditCard className="h-6 w-6 text-green-600" />
                            )
                          ) : (
                            <Truck className="h-6 w-6 text-purple-600" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                {notification.title}
                                {!notification.isRead && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                )}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.description}
                              </p>
                            </div>
                            <Badge
                              variant={
                                notification.status === NotificationStatus.PENDING
                                  ? "destructive"
                                  : notification.status === NotificationStatus.APPROVED
                                    ? "default"
                                    : "secondary"
                              }
                              className={
                                notification.status === NotificationStatus.PENDING
                                  ? "bg-yellow-500"
                                  : notification.status === NotificationStatus.APPROVED
                                    ? "bg-green-500"
                                    : "bg-red-500"
                              }
                            >
                              {notification.status === NotificationStatus.PENDING && "Pendente"}
                              {notification.status === NotificationStatus.APPROVED && "Aprovado"}
                              {notification.status === NotificationStatus.REJECTED && "Rejeitado"}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {getTimeAgo(notification.createdAt)}
                            </span>
                            <span>•</span>
                            <span>{notification.userName}</span>
                            {notification.amount && (
                              <>
                                <span>•</span>
                                <span className="font-semibold text-green-600">
                                  R$ {notification.amount.toFixed(2)}
                                </span>
                              </>
                            )}
                            {notification.paymentMethod && (
                              <>
                                <span>•</span>
                                <Badge variant="outline">{notification.paymentMethod}</Badge>
                              </>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            {notification.status === NotificationStatus.PENDING && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(notification.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Aprovar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(notification.id)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Rejeitar
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedNotification(notification)
                                setIsDetailModalOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver detalhes
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Controles de Paginação */}
        {!isLoading && notifications.length > 0 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-600">
              Mostrando <span className="font-medium">{notifications.length}</span> de{" "}
              <span className="font-medium">{totalItems}</span> notificações
              {totalPages > 1 && (
                <span className="ml-2">
                  (Página <span className="font-medium">{currentPage}</span> de{" "}
                  <span className="font-medium">{totalPages}</span>)
                </span>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNumber
                    if (totalPages <= 5) {
                      pageNumber = i + 1
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i
                    } else {
                      pageNumber = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleGoToPage(pageNumber)}
                        className="w-9 h-9 p-0"
                      >
                        {pageNumber}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="gap-1"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      <NotificationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        notification={selectedNotification}
        token={token}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}
