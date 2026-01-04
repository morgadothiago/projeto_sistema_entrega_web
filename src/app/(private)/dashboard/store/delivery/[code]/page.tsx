"use client"

import { useAuth } from "@/app/context"
import api from "@/app/services/api"
import { Delivery, DeliveryRoutes } from "@/app/types/DeliveryTypes"
import { useParams } from "next/navigation"
import React, { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { io } from "socket.io-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { toast } from "sonner"
import { StatusBadge } from "@/app/components/StatusBadge"
import LeafletMap from "../../simulate/_LeafletMap"
import {
  Package,
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  Truck,
  Calendar,
  DollarSign,
  Weight,
  Ruler,
  Info,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { calculateDistanceBetweenPoints } from "@/lib/distance"

// Memoized components to prevent unnecessary re-renders
const DeliveryInfo = React.memo(({ delivery }: { delivery: Delivery }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Info className="h-5 w-5" />
        Informações da Entrega
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">ID</p>
            <p className="font-medium">{delivery.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Código</p>
            <p className="font-medium">{delivery.code}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Preço</p>
            <p className="font-medium">
              R$ {Number(delivery.price).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">
              Tipo de Veículo
            </p>
            <p className="font-medium">{delivery.vehicleType}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">
              Distância Estimada
            </p>
            <p className="font-medium">
              {delivery.OriginAddress &&
                delivery.ClientAddress &&
                !isNaN(Number(delivery.OriginAddress.latitude)) &&
                !isNaN(Number(delivery.ClientAddress.latitude))
                ? `${calculateDistanceBetweenPoints(
                  {
                    latitude: Number(delivery.OriginAddress.latitude),
                    longitude: Number(delivery.OriginAddress.longitude),
                  },
                  {
                    latitude: Number(delivery.ClientAddress.latitude),
                    longitude: Number(delivery.ClientAddress.longitude),
                  }
                ).toFixed(2)} km`
                : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
))
DeliveryInfo.displayName = "DeliveryInfo"

const DimensionsInfo = React.memo(({ delivery }: { delivery: Delivery }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Ruler className="h-5 w-5" />
        Dimensões e Peso
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <Weight className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Peso</p>
          <p className="font-semibold">{delivery.weight} kg</p>
        </div>

        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <Ruler className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Altura</p>
          <p className="font-semibold">{delivery.height} cm</p>
        </div>

        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <Ruler className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Largura</p>
          <p className="font-semibold">{delivery.width} cm</p>
        </div>

        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <Ruler className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Comprimento</p>
          <p className="font-semibold">{delivery.length} cm</p>
        </div>
      </div>
    </CardContent>
  </Card>
))
DimensionsInfo.displayName = "DimensionsInfo"

const ClientInfo = React.memo(({ delivery }: { delivery: Delivery }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <User className="h-5 w-5" />
        Informações do Cliente
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
        <Mail className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-xs text-muted-foreground">Email</p>
          <p className="font-medium text-sm break-all">
            {delivery.email}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
        <Phone className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-xs text-muted-foreground">Telefone</p>
          <p className="font-medium">{delivery.telefone}</p>
        </div>
      </div>
    </CardContent>
  </Card>
))
ClientInfo.displayName = "ClientInfo"

export default function DeliveryDetailPage() {
  const { token } = useAuth()
  const { code } = useParams<{ code: string }>()
  const [deliveryDetails, setDeliveryDetails] = useState<Delivery | null>(null)
  const [loading, setLoading] = useState(true)
  const socketRef = useRef<any>(null)
  const isMountedRef = useRef(true)

  // Log inicial para debug
  console.log("🎯 DeliveryDetailPage montado:", {
    code,
    hasToken: !!token,
    loading,
    hasDeliveryDetails: !!deliveryDetails,
  })

  // Memoize routes calculation
  const routes = useMemo(() => {
    if (deliveryDetails?.Routes && deliveryDetails.Routes.length > 0) {
      return deliveryDetails.Routes.map((r) => [
        Number(r.latitude),
        Number(r.longitude),
      ]) as [number, number][]
    }
    return []
  }, [deliveryDetails?.Routes])

  // Memoize fetchDeliveryDetail to prevent recreating on every render
  const fetchDeliveryDetail = useCallback(async (socketId?: string, isBackground = false) => {
    try {
      // Log para debug
      console.log("🔍 Buscando detalhes da entrega:", {
        code,
        hasToken: !!token,
        socketId: socketId || 'sem socket',
        isBackground,
        endpoint: `/gps/delivery/${code}`
      })

      if (!isBackground) {
        setLoading(true)
      }
      const realSocketId = socketId && socketId !== 'sem socket' ? socketId : undefined

      const response = await api.getDeliveryDetail(
        code,
        token as string,
        realSocketId
      )

      // Check if response is an error (API returns {status, message} for errors)
      if (response && typeof response === 'object' && "status" in response && "message" in response) {
        const errorResponse = response as any

        // Log detalhado do erro para debug
          code,
          status: errorResponse.status,
          message: errorResponse.message,
          data: errorResponse.data,
          socketId: socketId || 'sem socket',
          isBackground,
          endpoint: `/gps/delivery/${code}`,
        })

        if (errorResponse.status === 422) {
          console.warn("⚠️ Detalhes do erro 422:", errorResponse.data)
        }

        // Tentar fallback se for 422 ou 404
        if (errorResponse.status === 422 || errorResponse.status === 404) {
          console.log("🔄 Tentando buscar via lista (fallback)...")
          try {
            const allDeliveries = await api.getAlldelivery(token as string) as any
            const deliveriesList = Array.isArray(allDeliveries)
              ? allDeliveries
              : (allDeliveries?.data || [])

            const found = (deliveriesList as any[]).find(d => d.code === code)
            if (found) {
              console.log("✅ Entrega encontrada via lista, tentando buscar detalhes pelo ID:", found.id)

              const idToUse = String(found.id || found.code)
              const realSocketId = socketId && socketId !== 'sem socket' ? socketId : undefined

              const detailById = await api.getDeliveryDetail(
                idToUse,
                token as string,
                realSocketId
              )

              if (detailById && !(detailById as any).status) {
                console.log("✅ Detalhes obtidos com sucesso via ID fallback")
                let finalData = detailById as any
                if (finalData.data) finalData = finalData.data
                setDeliveryDetails(finalData as Delivery)
                setLoading(false)
                return
              } else {
                console.warn("⚠️ Não foi possível obter detalhes via ID fallback, usando dados da lista.")
                setDeliveryDetails(found as Delivery)
                setLoading(false)
                return
              }
            } else {
              console.warn("❌ Entrega não encontrada nem na lista completa.")
            }
          } catch (fallbackError) {
          }
        }

        if (!isBackground) {
          // Mensagens mais específicas baseadas no status
          const errorMessages: Record<number, string> = {
            404: "Entrega não encontrada no sistema",
            401: "Sessão expirada. Faça login novamente",
            403: "Sem permissão para visualizar esta entrega",
            422: "Erro de validação nos dados da entrega",
            500: "Erro no servidor. Tente novamente em instantes",
            502: "Servidor indisponível. Tente novamente",
            503: "Serviço temporariamente indisponível",
          }

          let description = errorResponse.message

          if (errorResponse.status === 422 && errorResponse.data) {
            // Se for erro de validação (comum em NestJS), extrair as mensagens
            const errorData = errorResponse.data as any
            if (Array.isArray(errorData)) {
              description = errorData.map(err =>
                typeof err === 'string' ? err : (err.message || JSON.stringify(err))
              ).join(', ')
            } else if (typeof errorData === 'object' && errorData.message) {
              description = Array.isArray(errorData.message)
                ? errorData.message.join(', ')
                : String(errorData.message)
            }
          } else if (Array.isArray(errorResponse.message)) {
            description = (errorResponse.message as any).join(', ')
          }

          toast.error(
            errorMessages[errorResponse.status] || "Erro ao carregar detalhes da entrega",
            {
              description: description,
              duration: 8000,
            }
          )
          setLoading(false)
        }
        return
      }

      let deliveryData = response as any

      // Handle nested data property if present (common in real APIs)
      if (deliveryData && typeof deliveryData === 'object' && 'data' in deliveryData) {
        console.log("📦 Detectada resposta aninhada, extraindo .data")
        deliveryData = deliveryData.data
      }

      if (!deliveryData || typeof deliveryData !== 'object' || !deliveryData.id) {
        if (!isBackground) {
          toast.error("Format de dados da entrega inválido")
          setLoading(false)
        }
        return
      }

      console.log("✅ Dados da entrega processados:", {
        code: deliveryData.code,
        id: deliveryData.id,
        status: deliveryData.status,
        hasOriginAddress: !!deliveryData.OriginAddress,
        hasClientAddress: !!deliveryData.ClientAddress,
        routesCount: deliveryData.Routes?.length || 0,
      })
      setDeliveryDetails(deliveryData as Delivery)
    } catch (error) {
      if (!isBackground) {
        toast.error("Erro ao carregar detalhes da entrega")
      }
    } finally {
      if (!isBackground) {
        setLoading(false)
      }
    }
  }, [code, token])

  // Memoize location update handler
  const handleLocationUpdate = useCallback((data: { latitude: number; longitude: number }) => {
    if (data && data.latitude && data.longitude) {
      setDeliveryDetails((prev) => {
        if (!prev) return prev

        const newRoute: DeliveryRoutes = {
          id: Date.now(),
          latitude: data.latitude,
          longitude: data.longitude,
          deliveryId: prev.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        return {
          ...prev,
          Routes: [...(prev.Routes || []), newRoute],
        }
      })
    }
  }, [])

  useEffect(() => {
    // Validações antes de iniciar
    if (!token) {
      console.warn("⚠️ Token não disponível")
      setLoading(false)
      return
    }

    if (!code) {
      console.warn("⚠️ Código da entrega não fornecido")
      setLoading(false)
      return
    }

    // Validar se o código não é inválido
    if (code === "0" || code === "undefined" || code === "null") {
      toast.error("Código de entrega inválido", {
        description: "O código da entrega não foi fornecido corretamente.",
        duration: 5000,
      })
      setLoading(false)
      return
    }

    console.log("✅ Iniciando busca com código válido:", code)

    // Polling effect - Reduzido para evitar 429
    const intervalId = setInterval(() => {
      if (!document.hidden && socketRef.current?.connected) {
        fetchDeliveryDetail(socketRef.current.id, true)
      } else if (!document.hidden) {
        fetchDeliveryDetail(undefined, true)
      }
    }, 300000) // 5 minutos (era 30s - reduzido para evitar rate limit)

    // Prevent multiple connections
    if (socketRef.current?.connected) {
      return () => clearInterval(intervalId)
    }

    const initSocket = async () => {
      try {
        let socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL

        if (!socketUrl) {
          // Tentar inferir do host da API se não estiver definido
          const apiHost = process.env.NEXT_PUBLIC_API_HOST || ""
          if (apiHost.includes("http")) {
            // Se o host é api.dominio.com, o socket costuma ser o mesmo host ou socket.dominio.com
            socketUrl = apiHost.replace("api.", "socket.")

            // Removendo path /v1 ou /api se existir
            socketUrl = socketUrl.replace(/\/v1$/, "").replace(/\/api$/, "")

            // Se não mudou nada, usa o próprio host da API como base
            if (socketUrl === apiHost) {
              socketUrl = apiHost.replace(/\/v1$/, "").replace(/\/api$/, "")
            }
          } else {
            socketUrl = "http://localhost:2000"
          }
        }

        console.log("🔌 Tentativa de conexão socket em:", socketUrl)

        socketRef.current = io(`${socketUrl}/gps`, {
          transports: ["websocket"],
          auth: {
            token: `Bearer ${token}`,
          },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        })

        socketRef.current.on("connect", async () => {
          await fetchDeliveryDetail(socketRef.current.id)
        })

        socketRef.current.on("update-location", handleLocationUpdate)

        socketRef.current.on("connect_error", () => {
          // Silent fail for socket connection in background, mostly handled by polling fallback
          if (!socketRef.current?.connected) {
            setLoading(false)
          }
        })
      } catch (error) {
        setLoading(false)
        toast.error("Erro ao inicializar rastreamento")
      }
    }

    initSocket()

    return () => {
      // Marcar componente como desmontado
      isMountedRef.current = false

      clearInterval(intervalId)
      if (socketRef.current) {
        socketRef.current.off("connect")
        socketRef.current.off("update-location")
        socketRef.current.off("connect_error")
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [token, code, fetchDeliveryDetail, handleLocationUpdate])

  // Marcar componente como montado
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Memoize status progress calculation
  const statusProgress = useMemo(() => {
    if (!deliveryDetails?.status) return 0

    const statusMap = {
      PENDING: 25,
      IN_PROGRESS: 75,
      COMPLETED: 100,
      CANCELLED: 0,
    }

    return statusMap[deliveryDetails.status as keyof typeof statusMap] || 0
  }, [deliveryDetails?.status])

  // Memoize getStatusColor function
  const getStatusColor = useCallback((status: string) => {
    const colorMap = {
      PENDING: "bg-yellow-500",
      IN_PROGRESS: "bg-blue-500",
      COMPLETED: "bg-green-500",
      CANCELLED: "bg-red-500",
    }
    return colorMap[status as keyof typeof colorMap] || "bg-gray-500"
  }, [])

  if (loading) {
    console.log("⏳ Renderizando loading skeleton")
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-64" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!deliveryDetails) {
    console.log("❌ Renderizando 'Entrega não encontrada' - deliveryDetails is null")
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Entrega não encontrada</h2>
          <p className="text-muted-foreground mb-4">
            Não foi possível carregar os detalhes desta entrega.
          </p>
          {code && (
            <div className="text-sm text-muted-foreground mb-4">
              <p>Código buscado: <span className="font-mono font-semibold">{code}</span></p>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
            >
              Voltar
            </Button>
            <Button
              onClick={() => window.location.href = "/dashboard/store/delivery"}
            >
              Ver todas as entregas
            </Button>
          </div>
        </div>
      </div>
    )
  }

  console.log("✨ Renderizando página de detalhes com sucesso:", {
    code: deliveryDetails.code,
    status: deliveryDetails.status,
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Detalhes da Entrega</h1>
            <p className="text-muted-foreground">Código: {code}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={deliveryDetails.status as any} />
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progresso da Entrega</span>
              <span className="text-sm text-muted-foreground">
                {statusProgress}%
              </span>
            </div>
            <Progress value={statusProgress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Criada</span>
              <span>Em andamento</span>
              <span>Concluída</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detalhes da Entrega */}
        <div className="space-y-6">
          {/* Informações Principais */}
          <DeliveryInfo delivery={deliveryDetails} />

          {/* Dimensões e Peso */}
          <DimensionsInfo delivery={deliveryDetails} />

          {/* Informações do Cliente */}
          <ClientInfo delivery={deliveryDetails} />

          {/* Rotas */}
          {deliveryDetails.Routes && deliveryDetails.Routes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Rotas da Entrega ({deliveryDetails.Routes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="rotas">
                    <AccordionTrigger>Ver todas as rotas</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {deliveryDetails.Routes.map((route, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-background rounded-lg border"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-3 h-3 rounded-full ${getStatusColor(
                                  deliveryDetails.status
                                )}`}
                              />
                              <span className="text-sm font-medium">
                                Ponto {idx + 1}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <div>
                                Lat: {Number(route.latitude).toFixed(6)}
                              </div>
                              <div>
                                Lng: {Number(route.longitude).toFixed(6)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Mapa e Status */}
        <div className="space-y-6">
          {/* Mapa */}
          <Card className="h-96">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Rota da Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-full">
              {deliveryDetails.OriginAddress &&
                deliveryDetails.ClientAddress &&
                typeof deliveryDetails.OriginAddress.latitude === 'number' &&
                typeof deliveryDetails.ClientAddress.latitude === 'number' ? (
                <div className="h-full w-full">
                  <LeafletMap
                    route={
                      routes.length > 0 && routes.every(r => typeof r[0] === 'number' && !isNaN(r[0]))
                        ? routes
                        : [
                          [
                            Number(deliveryDetails.OriginAddress.latitude),
                            Number(deliveryDetails.OriginAddress.longitude),
                          ],
                          [
                            Number(deliveryDetails.ClientAddress.latitude),
                            Number(deliveryDetails.ClientAddress.longitude),
                          ],
                        ]
                    }
                    addressOrigem={{
                      latitude: deliveryDetails.OriginAddress.latitude,
                      longitude: deliveryDetails.OriginAddress.longitude,
                    }}
                    clientAddress={{
                      latitude: deliveryDetails.ClientAddress.latitude,
                      longitude: deliveryDetails.ClientAddress.longitude,
                    }}
                    deliveryPosition={
                      deliveryDetails.Routes && deliveryDetails.Routes.length > 0
                        ? {
                          latitude: Number(
                            deliveryDetails.Routes[
                              deliveryDetails.Routes.length - 1
                            ].latitude
                          ),
                          longitude: Number(
                            deliveryDetails.Routes[
                              deliveryDetails.Routes.length - 1
                            ].longitude
                          ),
                        }
                        : undefined
                    }
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Rota não disponível</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Detalhado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Status da Entrega
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status Atual</span>
                  <StatusBadge status={deliveryDetails.status as any} />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm">Entrega criada</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      Hoje
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${deliveryDetails.status === "IN_PROGRESS" ||
                        deliveryDetails.status === "COMPLETED"
                        ? "bg-blue-500"
                        : "bg-gray-300"
                        }`}
                    />
                    <span className="text-sm">Em andamento</span>
                    {deliveryDetails.status === "IN_PROGRESS" && (
                      <Badge variant="secondary" className="ml-auto">
                        Ativo
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${deliveryDetails.status === "COMPLETED"
                        ? "bg-green-700"
                        : deliveryDetails.status === "CANCELLED"
                          ? "bg-red-500"
                          : "bg-gray-300"
                        }`}
                    />
                    <span className="text-sm">
                      {deliveryDetails.status === "COMPLETED"
                        ? "Concluída"
                        : deliveryDetails.status === "CANCELLED"
                          ? "Cancelada"
                          : "Concluída"}
                    </span>
                    {deliveryDetails.status === "COMPLETED" && (
                      <Badge variant="default" className="ml-auto bg-green-600">
                        Finalizada
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
