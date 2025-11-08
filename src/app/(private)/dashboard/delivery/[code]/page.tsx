"use client"

import { useAuth } from "@/app/context"
import api from "@/app/services/api"
import { Delivery, DeliveryRoutes } from "@/app/types/DeliveryTypes"
import { useParams } from "next/navigation"
import React, { useEffect, useState } from "react"
import { io } from "socket.io-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { toast } from "sonner"
import { StatusBadge } from "@/app/components/StatusBadge"
import { deliveryLabels } from "@/app/components/deliveryLabels"
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
import { signOut } from "next-auth/react"

export default function DeliveryDetailPage() {
  const { token } = useAuth()
  const { code } = useParams<{ code: string }>()
  const [deliveryDetails, setDeliveryDetails] = useState<Delivery | null>(null)
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState<any>(null)
  const [routes, setRoutes] = useState<[number, number][]>([])

  // Atualiza 'routes' sempre que 'deliveryDetails' mudar
  React.useEffect(() => {
    if (deliveryDetails?.Routes && deliveryDetails.Routes.length > 0) {
      setRoutes(
        deliveryDetails.Routes.map((r) => [
          Number(r.latitude),
          Number(r.longitude),
        ])
      )
    }
  }, [deliveryDetails])

  useEffect(() => {
    if (!token) {
      return
    }

    const initSocket = async () => {
      try {
        const socketInstance = io(
          process.env.NEXT_PUBLIC_SOCKET_URL as string,
          {
            transports: ["websocket"],
            auth: {
              token: `Bearer ${token}`,
            },
          }
        )

        socketInstance.on("connect", async () => {
          console.log("Socket connected")
          await fetchDeliveryDetail(socketInstance)
        })

        socketInstance.on("disconnect", () => {
          console.log("Socket disconnected")
        })

        socketInstance.on("update-location", (data) => {
          console.log("Location update received:", data)
          // Atualizar rota em tempo real se necessário
        })

        setSocket(socketInstance)
      } catch (error) {
        console.error("Socket connection error:", error)
        await fetchDeliveryDetail()
      }
    }

    const fetchDeliveryDetail = async (socketInstance?: any) => {
      try {
        setLoading(true)
        const response = await api.getDeliveryDetail(
          code,
          token as string,
          socketInstance?.id || "no-socket"
        )

        console.log(response)

        if ("error" in response) {
          toast.error("Erro ao carregar detalhes da entrega")
          return
        }

        setDeliveryDetails(response as Delivery)
        toast.success("Dados carregados com sucesso!", {
          description: "Detalhes da entrega atualizados",
          duration: 2000,
        })
      } catch (error) {
        console.error("Error fetching delivery details:", error)
        toast.error("Erro ao carregar detalhes da entrega")
      } finally {
        setLoading(false)
      }
    }

    initSocket()

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [token, code])

  const getStatusProgress = () => {
    if (!deliveryDetails?.status) return 0

    const statusMap = {
      PENDING: 25,
      IN_PROGRESS: 75,
      COMPLETED: 100,
      CANCELLED: 0,
    }

    return statusMap[deliveryDetails.status as keyof typeof statusMap] || 0
  }

  const getStatusColor = (status: string) => {
    const colorMap = {
      PENDING: "bg-yellow-500",
      IN_PROGRESS: "bg-blue-500",
      COMPLETED: "bg-green-500",
      CANCELLED: "bg-red-500",
    }
    return colorMap[status as keyof typeof colorMap] || "bg-gray-500"
  }

  if (loading) {
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
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Entrega não encontrada</h2>
          <p className="text-muted-foreground">
            Não foi possível carregar os detalhes desta entrega.
          </p>
        </div>
      </div>
    )
  }

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
                {getStatusProgress()}%
              </span>
            </div>
            <Progress value={getStatusProgress()} className="h-2" />
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
                    <p className="font-medium">{deliveryDetails.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Código</p>
                    <p className="font-medium">{deliveryDetails.code}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Preço</p>
                    <p className="font-medium">
                      R$ {Number(deliveryDetails.price).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Tipo de Veículo
                    </p>
                    <p className="font-medium">{deliveryDetails.vehicleType}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dimensões e Peso */}
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
                  <p className="font-semibold">{deliveryDetails.weight} kg</p>
                </div>

                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Ruler className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Altura</p>
                  <p className="font-semibold">{deliveryDetails.height} cm</p>
                </div>

                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Ruler className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Largura</p>
                  <p className="font-semibold">{deliveryDetails.width} cm</p>
                </div>

                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Ruler className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Comprimento</p>
                  <p className="font-semibold">{deliveryDetails.length} cm</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Cliente */}
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
                    {deliveryDetails.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <p className="font-medium">{deliveryDetails.telefone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
              {deliveryDetails.Routes && deliveryDetails.Routes.length > 0 ? (
                <div className="h-full w-full">
                  <LeafletMap
                    route={routes}
                    addressOrigem={{
                      latitude: deliveryDetails.OriginAddress.latitude,
                      longitude: deliveryDetails.OriginAddress.longitude,
                    }}
                    clientAddress={{
                      latitude: deliveryDetails.ClientAddress.latitude,
                      longitude: deliveryDetails.ClientAddress.longitude,
                    }}
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
                      className={`w-3 h-3 rounded-full ${
                        deliveryDetails.status === "IN_PROGRESS" ||
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
                      className={`w-3 h-3 rounded-full ${
                        deliveryDetails.status === "COMPLETED"
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
