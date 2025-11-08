"use client"

import React, { useEffect, useState } from "react"
import {
  FaTruck,
  FaCalculator,
  FaUser,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaBoxOpen,
} from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import api from "@/app/services/api"
import { signOut, useSession } from "next-auth/react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet"
import MapSimulate from "./MapSimulate"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import {
  Sparkles,
  DollarSign,
  MapPin,
  Clock,
  Car,
  Zap,
  Send,
} from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { redirect } from "next/dist/server/api-utils"
import { useAuth } from "@/app/context"
import { useRouter } from "next/navigation"

const initialForm = {
  clientAddress: { city: "", state: "", street: "", number: "", zipCode: "" },
  address: { city: "", state: "", street: "", number: "", zipCode: "" },
  useAddressCompany: false,
  vehicleType: "",
  height: "",
  width: "",
  length: "",
  information: "",
  email: "",
  telefone: "",
  weight: "",
  isFragile: false,
}

export default function Page() {
  const { data: session } = useSession()
  const [form, setForm] = useState(initialForm)
  const [simulating, setSimulating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [vehicleTypes, setVehicleTypes] = useState<
    { id: number; type: string }[]
  >([])
  const { token } = useAuth()
  const router = useRouter()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [simulationResult, setSimulationResult] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (!token) {
      signOut()
      router.push("/signin")
      return
    }

    setMounted(true)
  }, [token])

  useEffect(() => {
    async function fetchVehicleTypes() {
      const result = await api.getAllVehicleType()
      if (result && "data" in result && Array.isArray(result.data)) {
        setVehicleTypes(result.data)
      }
    }
    fetchVehicleTypes()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type, dataset, checked } = e.target as HTMLInputElement
    if (dataset.group) {
      const group = dataset.group as "clientAddress" | "address"
      setForm({
        ...form,
        [group]: {
          ...form[group],
          [name]: value,
        },
      })
    } else {
      setForm({ ...form, [name]: type === "checkbox" ? checked : value })
    }
  }

  const submitToAPI = async (data: any) => {
    setSubmitting(true)
    try {
      const token = (session as any)?.token
      if (!token) throw new Error("Token de autenticação não encontrado.")
      const result = await api.AddNewDelivery(data, token)
      if (result && result.status && result.status !== 200) {
        toast.error(
          Array.isArray(result.message)
            ? result.message.map((m: any) => m.message).join(" | ")
            : result.message || "Erro ao processar solicitação.",
          {
            duration: 5000,
            position: "top-right",
            className:
              "bg-red-50 text-red-900 border-l-4 border-red-500 shadow-lg",
          }
        )

        return false
      }
      toast.success("Entrega cadastrada com sucesso!", {
        duration: 4000,
        position: "top-right",
        className:
          "bg-green-50 text-green-900 border-l-4 border-green-500 shadow-lg",
      })

      console.log("resultado", result)

      return true
    } catch (error: any) {
      toast.error(
        Array.isArray(error?.message)
          ? error.message.map((m: any) => m.message).join(" | ")
          : error?.message ||
              "Erro de conexão. Verifique sua internet e tente novamente.",
        {
          duration: 5000,
          position: "top-right",
          className:
            "bg-red-50 text-red-900 border-l-4 border-red-500 shadow-lg",
        }
      )
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const validateForm = () => {
    // Checa campos de endereço do cliente
    const addressKeys: (keyof typeof form.clientAddress)[] = [
      "city",
      "state",
      "street",
      "number",
      "zipCode",
    ]
    for (const key of addressKeys) {
      if (!form.clientAddress[key]) {
        toast.error(`Preencha o campo "${key}" do endereço do cliente.`, {
          position: "top-right",
          className:
            "bg-red-50 text-red-900 border-l-4 border-red-500 shadow-lg",
        })
        return false
      }
    }
    // Checa campos de endereço de origem (apenas se não usar endereço da empresa)
    if (!form.useAddressCompany) {
      for (const key of addressKeys) {
        if (!form.address[key]) {
          toast.error(`Preencha o campo "${key}" do endereço de origem.`, {
            position: "top-right",
            className:
              "bg-red-50 text-red-900 border-l-4 border-red-500 shadow-lg",
          })
          return false
        }
      }
    }
    // Checa tipo de veículo
    if (!form.vehicleType) {
      toast.error("Selecione o tipo de veículo.", {
        position: "top-right",
        className: "bg-red-50 text-red-900 border-l-4 border-red-500 shadow-lg",
      })
      return false
    }
    // Checa dimensões e peso
    const numberKeys: (keyof typeof form)[] = [
      "height",
      "width",
      "length",
      "weight",
    ]
    for (const key of numberKeys) {
      if (!form[key] || isNaN(Number(form[key])) || Number(form[key]) <= 0) {
        toast.error(
          `Preencha corretamente o campo "${key}" (valor positivo).`,
          {
            position: "top-right",
            className:
              "bg-red-50 text-red-900 border-l-4 border-red-500 shadow-lg",
          }
        )
        return false
      }
    }
    // Checa e-mail
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      toast.error("Preencha um e-mail válido.", {
        position: "top-right",
        className: "bg-red-50 text-red-900 border-l-4 border-red-500 shadow-lg",
      })
      return false
    }
    // Checa telefone
    if (
      !form.telefone ||
      !/^\(?\d{2}\)? ?9?\d{4}-?\d{4}$/.test(form.telefone.replace(/\D/g, ""))
    ) {
      toast.error(
        "Preencha um telefone válido no formato brasileiro. Ex: (11) 91234-5678",
        {
          position: "top-right",
          className:
            "bg-red-50 text-red-900 border-l-4 border-red-500 shadow-lg",
        }
      )
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    // Formatar telefone para padrão BR
    const telefoneLimpo = form.telefone.replace(/\D/g, "")
    let telefoneFormatado = form.telefone
    if (telefoneLimpo.length === 11) {
      telefoneFormatado = `(${telefoneLimpo.slice(0, 2)}) ${telefoneLimpo.slice(
        2,
        7
      )}-${telefoneLimpo.slice(7)}`
    }
    const payload = {
      clientAddress: form.clientAddress,
      address: form.address,
      useAddressCompany: form.useAddressCompany,
      vehicleType: form.vehicleType,
      height: Number(form.height),
      width: Number(form.width),
      length: Number(form.length),
      information: form.information,
      email: String(form.email),
      telefone: telefoneFormatado,
      weight: Number(form.weight),
      isFragile: form.isFragile || false,
    }
    await submitToAPI(payload)
  }

  const handleSimulate = async () => {
    if (!validateForm()) return
    setSimulating(true)
    setSimulationResult(null)
    try {
      const token = (session as any)?.token
      if (!token) throw new Error("Token de autenticação não encontrado.")
      const payload = {
        clientAddress: form.clientAddress,
        address: form.address,
        useAddressCompany: form.useAddressCompany,
        vehicleType: form.vehicleType,
      }
      const result = await api.simulateDelivery(payload, token)

      if (result && result.status && result.status !== 200) {
        toast.error(
          Array.isArray(result.message)
            ? result.message.map((m: any) => m.message).join(" | ")
            : result.message || "Erro ao simular entrega.",
          {
            duration: 5000,
            position: "top-right",
            className:
              "bg-red-50 text-red-900 border-l-4 border-red-500 shadow-lg",
          }
        )
        setSimulating(false)
        return
      }
      setSimulationResult(result)
      setSheetOpen(true)
    } catch (error: any) {
      toast.error(
        Array.isArray(error?.message)
          ? error.message.map((m: any) => m.message).join(" | ")
          : error?.message || "Erro de conexão ao simular.",
        {
          duration: 5000,
          position: "top-right",
          className:
            "bg-red-50 text-red-900 border-l-4 border-red-500 shadow-lg",
        }
      )
    } finally {
      setSimulating(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl -z-10" />

      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-4 mb-6 p-4 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur opacity-75" />
                <div className="relative p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl">
                  <FaTruck className="text-white text-3xl" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Cadastro de Entrega
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Sistema inteligente de logística
                </p>
              </div>
            </div>
            <p className="text-slate-600 text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
              Simule custos, calcule rotas e cadastre entregas de forma rápida e
              intuitiva com nossa plataforma moderna
            </p>
          </div>
          <form
            className="space-y-8"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            {/* Seção Cliente */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
                    <div className="relative p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                      <FaUser className="text-white text-xl" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800 mb-1">
                      Endereço do Cliente
                    </CardTitle>
                    <p className="text-sm text-slate-500">
                      Informações do destinatário da entrega
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="client-city"
                      className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
                    >
                      🏢 Cidade
                    </Label>
                    <Input
                      id="client-city"
                      name="city"
                      data-group="clientAddress"
                      value={form.clientAddress.city}
                      onChange={handleChange}
                      placeholder="Ex: São Paulo"
                      className="h-12 border-2 border-slate-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200 bg-white/50"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="client-state"
                      className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
                    >
                      🗺️ Estado
                    </Label>
                    <Input
                      id="client-state"
                      name="state"
                      data-group="clientAddress"
                      value={form.clientAddress.state}
                      onChange={handleChange}
                      placeholder="Ex: SP"
                      className="h-12 border-2 border-slate-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200 bg-white/50"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="client-zipcode"
                      className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
                    >
                      📮 CEP
                    </Label>
                    <Input
                      id="client-zipcode"
                      name="zipCode"
                      data-group="clientAddress"
                      value={form.clientAddress.zipCode}
                      onChange={handleChange}
                      placeholder="00000-000"
                      className="h-12 border-2 border-slate-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200 bg-white/50"
                      required
                    />
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <Label
                      htmlFor="client-street"
                      className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
                    >
                      🛣️ Rua
                    </Label>
                    <Input
                      id="client-street"
                      name="street"
                      data-group="clientAddress"
                      value={form.clientAddress.street}
                      onChange={handleChange}
                      placeholder="Nome da rua"
                      className="h-12 border-2 border-slate-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200 bg-white/50"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="client-number"
                      className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
                    >
                      🏠 Número
                    </Label>
                    <Input
                      id="client-number"
                      name="number"
                      data-group="clientAddress"
                      value={form.clientAddress.number}
                      onChange={handleChange}
                      placeholder="123"
                      className="h-12 border-2 border-slate-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200 bg-white/50"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Seção Entrega */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="pb-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
                      <div className="relative p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-lg">
                        <FaMapMarkerAlt className="text-white text-xl" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-800 mb-1">
                        Endereço de Origem
                      </CardTitle>
                      <p className="text-sm text-slate-500">
                        Local de coleta da mercadoria
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-200">
                    <Checkbox
                      id="useAddressCompany"
                      checked={form.useAddressCompany}
                      onCheckedChange={(checked) =>
                        setForm({ ...form, useAddressCompany: !!checked })
                      }
                      className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                    />
                    <Label
                      htmlFor="useAddressCompany"
                      className="text-sm font-semibold text-slate-700 cursor-pointer whitespace-nowrap"
                    >
                      Usar endereço da empresa
                    </Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {form.useAddressCompany ? (
                  <div className="relative p-8 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-2xl border border-emerald-200 text-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5" />
                    <div className="relative">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl mb-4 shadow-lg">
                        <FaMapMarkerAlt className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-emerald-800 mb-2">
                        Endereço da Empresa Ativo
                      </h3>
                      <p className="text-emerald-600 text-sm leading-relaxed max-w-sm mx-auto">
                        Os campos de origem foram preenchidos automaticamente
                        com o endereço cadastrado da empresa
                      </p>
                      <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 rounded-full">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs font-medium text-emerald-700">
                          Configurado automaticamente
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="delivery-city"
                        className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
                      >
                        🏢 Cidade
                      </Label>
                      <Input
                        id="delivery-city"
                        name="city"
                        data-group="address"
                        value={form.address.city}
                        onChange={handleChange}
                        placeholder="Ex: Rio de Janeiro"
                        className="h-12 border-2 border-slate-200 hover:border-emerald-300 focus:border-emerald-500 transition-all duration-200 bg-white/50"
                        required={!form.useAddressCompany}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label
                        htmlFor="delivery-state"
                        className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
                      >
                        🗺️ Estado
                      </Label>
                      <Input
                        id="delivery-state"
                        name="state"
                        data-group="address"
                        value={form.address.state}
                        onChange={handleChange}
                        placeholder="Ex: RJ"
                        className="h-12 border-2 border-slate-200 hover:border-emerald-300 focus:border-emerald-500 transition-all duration-200 bg-white/50"
                        required={!form.useAddressCompany}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label
                        htmlFor="delivery-zipcode"
                        className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
                      >
                        📮 CEP
                      </Label>
                      <Input
                        id="delivery-zipcode"
                        name="zipCode"
                        data-group="address"
                        value={form.address.zipCode}
                        onChange={handleChange}
                        placeholder="00000-000"
                        className="h-12 border-2 border-slate-200 hover:border-emerald-300 focus:border-emerald-500 transition-all duration-200 bg-white/50"
                        required={!form.useAddressCompany}
                      />
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <Label
                        htmlFor="delivery-street"
                        className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
                      >
                        🛣️ Rua
                      </Label>
                      <Input
                        id="delivery-street"
                        name="street"
                        data-group="address"
                        value={form.address.street}
                        onChange={handleChange}
                        placeholder="Nome da rua"
                        className="h-12 border-2 border-slate-200 hover:border-emerald-300 focus:border-emerald-500 transition-all duration-200 bg-white/50"
                        required={!form.useAddressCompany}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label
                        htmlFor="delivery-number"
                        className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
                      >
                        🏠 Número
                      </Label>
                      <Input
                        id="delivery-number"
                        name="number"
                        data-group="address"
                        value={form.address.number}
                        onChange={handleChange}
                        placeholder="456"
                        className="h-12 border-2 border-slate-200 hover:border-emerald-300 focus:border-emerald-500 transition-all duration-200 bg-white/50"
                        required={!form.useAddressCompany}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Seção Detalhes */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="pb-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-xl">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
                    <div className="relative p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                      <FaBoxOpen className="text-white text-xl" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800 mb-1">
                      Detalhes da Entrega
                    </CardTitle>
                    <p className="text-sm text-slate-500">
                      Especificações do produto e contato
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-6">
                  {/* Tipo de Veículo */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <FaTruck className="h-4 w-4 text-blue-600" />
                      </div>
                      <Label
                        htmlFor="vehicle-type"
                        className="text-sm font-semibold text-slate-800"
                      >
                        Tipo de Veículo
                      </Label>
                    </div>
                    <Select
                      value={form.vehicleType}
                      onValueChange={(value) =>
                        setForm({ ...form, vehicleType: value })
                      }
                    >
                      <SelectTrigger className="h-12 border-2 border-slate-200 hover:border-blue-300 focus:border-blue-500 transition-colors">
                        <SelectValue placeholder="🚚 Selecione o tipo de veículo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicleTypes.map((v) => (
                          <SelectItem
                            key={v.id}
                            value={v.type}
                            className="py-3"
                          >
                            <div className="flex items-center gap-2">
                              <FaTruck className="h-4 w-4 text-slate-500" />
                              <span>{v.type}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dimensões do Produto */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        <FaBoxOpen className="h-4 w-4 text-purple-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        Dimensões e Peso
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="weight"
                          className="text-xs font-medium text-slate-600 uppercase tracking-wide"
                        >
                          ⚖️ Peso
                        </Label>
                        <div className="relative">
                          <Input
                            id="weight"
                            type="number"
                            name="weight"
                            value={form.weight}
                            onChange={handleChange}
                            placeholder="5.5"
                            min={0}
                            step={0.1}
                            className="h-12 pl-3 pr-8 border-2 border-slate-200 hover:border-purple-300 focus:border-purple-500 transition-colors"
                            required
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                            kg
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="height"
                          className="text-xs font-medium text-slate-600 uppercase tracking-wide"
                        >
                          📄 Altura
                        </Label>
                        <div className="relative">
                          <Input
                            id="height"
                            type="number"
                            name="height"
                            value={form.height}
                            onChange={handleChange}
                            placeholder="50"
                            min={0}
                            className="h-12 pl-3 pr-8 border-2 border-slate-200 hover:border-purple-300 focus:border-purple-500 transition-colors"
                            required
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                            cm
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="width"
                          className="text-xs font-medium text-slate-600 uppercase tracking-wide"
                        >
                          ↔️ Largura
                        </Label>
                        <div className="relative">
                          <Input
                            id="width"
                            type="number"
                            name="width"
                            value={form.width}
                            onChange={handleChange}
                            placeholder="30"
                            min={0}
                            className="h-12 pl-3 pr-8 border-2 border-slate-200 hover:border-purple-300 focus:border-purple-500 transition-colors"
                            required
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                            cm
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="length"
                          className="text-xs font-medium text-slate-600 uppercase tracking-wide"
                        >
                          ↕️ Comprimento
                        </Label>
                        <div className="relative">
                          <Input
                            id="length"
                            type="number"
                            name="length"
                            value={form.length}
                            onChange={handleChange}
                            placeholder="40"
                            min={0}
                            className="h-12 pl-3 pr-8 border-2 border-slate-200 hover:border-purple-300 focus:border-purple-500 transition-colors"
                            required
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                            cm
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contato */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-100 rounded-lg">
                        <FaPhone className="h-4 w-4 text-indigo-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        Informações de Contato
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="telefone"
                          className="text-xs font-medium text-slate-600 uppercase tracking-wide"
                        >
                          📞 Telefone
                        </Label>
                        <Input
                          id="telefone"
                          type="text"
                          name="telefone"
                          value={form.telefone}
                          onChange={handleChange}
                          placeholder="(11) 99999-9999"
                          className="h-12 border-2 border-slate-200 hover:border-indigo-300 focus:border-indigo-500 transition-colors"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-xs font-medium text-slate-600 uppercase tracking-wide"
                        >
                          ✉️ E-mail
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="email@exemplo.com"
                          className="h-12 border-2 border-slate-200 hover:border-indigo-300 focus:border-indigo-500 transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Opções Especiais */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-amber-100 rounded-lg">
                        <span className="text-amber-600 text-sm">⚙️</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        Opções Especiais
                      </h3>
                    </div>

                    <div className="relative p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 hover:border-amber-300 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="isFragile"
                          checked={form.isFragile}
                          onCheckedChange={(checked) =>
                            setForm({ ...form, isFragile: !!checked })
                          }
                          className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                        />
                        <Label
                          htmlFor="isFragile"
                          className="text-amber-800 font-semibold cursor-pointer flex items-center gap-2"
                        >
                          <span className="text-lg">📦</span>
                          <span>Produto Frágil</span>
                        </Label>
                      </div>
                      <p className="text-xs text-amber-600 mt-2 ml-7">
                        Cuidados especiais serão tomados durante o transporte
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="information"
                        className="text-xs font-medium text-slate-600 uppercase tracking-wide"
                      >
                        📝 Observações
                      </Label>
                      <Textarea
                        id="information"
                        name="information"
                        value={form.information}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Descreva detalhes importantes sobre a entrega, instruções especiais, horários preferenciais..."
                        className="resize-none border-2 border-slate-200 hover:border-slate-300 focus:border-slate-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Botões */}
            <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto pt-8">
              <Button
                variant="outline"
                className="group relative w-full h-16 text-lg font-bold border-2 border-blue-200 text-blue-700 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 overflow-hidden"
                type="button"
                onClick={handleSimulate}
                disabled={simulating}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                <div className="relative flex items-center justify-center">
                  {simulating ? (
                    <>
                      <div className="animate-spin h-6 w-6 mr-3 border-2 border-blue-300 border-t-blue-600 rounded-full" />
                      <span className="animate-pulse text-lg">
                        Simulando...
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="p-2 bg-blue-100 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="text-lg">Simular Entrega</span>
                    </>
                  )}
                </div>
              </Button>

              <Button
                className="group relative w-full h-16 text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                type="submit"
                disabled={submitting}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <div className="relative flex items-center justify-center">
                  {submitting ? (
                    <>
                      <div className="animate-spin h-6 w-6 mr-3 border-2 border-white/30 border-t-white rounded-full" />
                      <span className="animate-pulse text-lg">Enviando...</span>
                    </>
                  ) : (
                    <>
                      <div className="p-2 bg-white/20 rounded-lg mr-3 group-hover:bg-white/30 transition-colors">
                        <FaTruck className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-lg">Cadastrar Entrega</span>
                    </>
                  )}
                </div>
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="max-w-lg w-full p-0 bg-white border-0 shadow-2xl"
        >
          <SheetTitle asChild>
            <VisuallyHidden>Resultado da Simulação de Entrega</VisuallyHidden>
          </SheetTitle>
          <div className="h-full flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Simulação de Entrega</h2>
                  <p className="text-blue-100 text-sm">
                    Resultado detalhado da simulação
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {simulationResult ? (
                <>
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      R$ {simulationResult.price?.toFixed(2)}
                    </div>
                    <p className="text-sm text-green-700 font-medium">
                      Preço estimado
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-700">
                          DISTÂNCIA
                        </span>
                      </div>
                      <div className="text-xl font-bold text-blue-800">
                        {simulationResult.location?.distance?.toFixed(1)} km
                      </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span className="text-xs font-medium text-orange-700">
                          DURAÇÃO
                        </span>
                      </div>
                      <div className="text-xl font-bold text-orange-800">
                        {simulationResult.location?.duration} min
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-3">
                      <Car className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-xs font-medium text-purple-700 mb-1">
                          VEÍCULO
                        </p>
                        <p className="font-semibold text-purple-800">
                          {form.vehicleType || "Não especificado"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {simulationResult.location?.geometry && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                      <div className="h-48 w-full">
                        <MapSimulate
                          route={decodePolyline(
                            simulationResult.location.geometry
                          )}
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-slate-400 mb-2">
                    <Sparkles className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-slate-500">Nenhum resultado para exibir</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-200 bg-slate-50">
              <SheetClose asChild>
                <Button className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg">
                  Fechar
                </Button>
              </SheetClose>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

// Função utilitária para decodificar polyline (adicionar no final do arquivo)
function decodePolyline(encoded: string): [number, number][] {
  let index = 0,
    lat = 0,
    lng = 0,
    coordinates = [] as [number, number][]
  while (index < encoded.length) {
    let b,
      shift = 0,
      result = 0
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlat = result & 1 ? ~(result >> 1) : result >> 1
    lat += dlat
    shift = 0
    result = 0
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlng = result & 1 ? ~(result >> 1) : result >> 1
    lng += dlng
    coordinates.push([lat / 1e5, lng / 1e5])
  }
  return coordinates
}
