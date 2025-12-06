"use client"
import { useAuth } from "@/app/context"
import api from "@/app/services/api"
import type { VehicleType } from "@/app/types/VehicleType"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Car, DollarSign, Save, X } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function TypeVehiclePage() {
  const { token } = useAuth()
  const router = useRouter()
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    type: "",
    tarifaBase: "",
    valorKMAdicional: "",
    paradaAdicional: "",
    ajudanteAdicional: "",
  })

  useEffect(() => {
    if (!token) {
      toast.error("Você precisa estar logado para acessar esta página")
      router.push("/signin")
      return
    }
    loadVehicleTypes()
  }, [token, router])

  async function loadVehicleTypes() {
    try {
      setLoading(true)
      const response = await api.getAllVehicleType()

      if (response && "data" in response && Array.isArray(response.data)) {
        setVehicleTypes(response.data)
      }
    } catch (error) {
      console.error("Erro ao carregar veículos:", error)
      toast.error("Erro ao carregar tipos de veículos")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (!token) {
      toast.error("Você precisa estar logado")
      return
    }

    if (!formData.type || !formData.tarifaBase) {
      toast.error("Preencha os campos obrigatórios")
      return
    }

    try {
      const cleanToken = token.startsWith("Bearer ") ? token.replace("Bearer ", "") : token
      const vehicleData = {
        type: formData.type,
        tarifaBase: Number(formData.tarifaBase),
        valorKMAdicional: Number(formData.valorKMAdicional) || 0,
        paradaAdicional: Number(formData.paradaAdicional) || 0,
        ajudanteAdicional: Number(formData.ajudanteAdicional) || 0,
      }

      await api.createVehicleType(vehicleData, cleanToken)
      toast.success("Tipo de veículo criado com sucesso!")
      setIsModalOpen(false)
      setFormData({ type: "", tarifaBase: "", valorKMAdicional: "", paradaAdicional: "", ajudanteAdicional: "" })
      loadVehicleTypes()
    } catch (error: any) {
      console.error("Erro ao criar veículo:", error)
      toast.error(error.message || "Erro ao criar tipo de veículo")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tipos de Veículos</h1>
            <p className="text-gray-600">Gerencie os tipos de veículos do sistema</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="h-4 w-4 mr-2" />
            Novo Tipo
          </Button>
        </div>

        {vehicleTypes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum tipo de veículo cadastrado</h3>
              <p className="text-gray-500">Clique em "Novo Tipo" para adicionar o primeiro</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicleTypes.map((vehicle) => (
              <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Car className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{vehicle.type}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-gray-600">Tarifa Base:</span>
                      <span className="font-semibold">R$ {Number(vehicle.tarifaBase).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">KM Adicional:</span>
                      <span className="font-semibold">R$ {Number(vehicle.valorKMAdicional).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Novo Tipo de Veículo
              </DialogTitle>
              <DialogDescription>Preencha as informações do novo tipo de veículo</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Nome do Tipo *</Label>
                <Input
                  id="type"
                  placeholder="Ex: Carro, Moto, Van..."
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tarifaBase">Tarifa Base (R$) *</Label>
                <Input
                  id="tarifaBase"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.tarifaBase}
                  onChange={(e) => setFormData({ ...formData, tarifaBase: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="valorKMAdicional">Valor por KM (R$)</Label>
                <Input
                  id="valorKMAdicional"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.valorKMAdicional}
                  onChange={(e) => setFormData({ ...formData, valorKMAdicional: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="paradaAdicional">Parada Adicional (R$)</Label>
                <Input
                  id="paradaAdicional"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.paradaAdicional}
                  onChange={(e) => setFormData({ ...formData, paradaAdicional: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ajudanteAdicional">Ajudante Adicional (R$)</Label>
                <Input
                  id="ajudanteAdicional"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.ajudanteAdicional}
                  onChange={(e) => setFormData({ ...formData, ajudanteAdicional: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Criar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
