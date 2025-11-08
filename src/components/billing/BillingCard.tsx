import React from "react"
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, TrendingUp, TrendingDown } from "lucide-react"
import { Billing } from "@/app/types/Debt"
import { EBillingStatus, EBillingType } from "@/app/types/Billing"
import { Icon } from "./Icon"
import { BillingToast } from "@/components/ui/custom-toast"

interface BillingCardProps {
  billing: Billing
  onEdit: (billing: Billing) => void
  onReceipt: (billing: Billing) => void
  onViewDetails: (billing: Billing) => void
}

export const BillingCard: React.FC<BillingCardProps> = ({
  billing,
  onEdit,
  onReceipt,
  onViewDetails,
}) => {
  return (
    <Card
      className="group hover:shadow-xl transition-all duration-300 cursor-pointer bg-white border-2 border-gray-100 hover:border-blue-200 rounded-2xl overflow-hidden"
      onClick={() => onViewDetails(billing)}
    >
      <CardHeader className="p-6 pb-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 justify-between w-full">
              <div
                className={`p-2 rounded-full ${
                  billing.type === EBillingType.INCOME
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {billing.type === EBillingType.INCOME ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    billing.status === "PAID"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : billing.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                      : "bg-red-100 text-red-700 border-red-200"
                  }`}
                >
                  {{
                    PAID: "Pago",
                    PENDING: "Pendente",
                    CANCELED: "Cancelado",
                    FAILED: "Falhou",
                  }[billing?.status as keyof typeof EBillingStatus] ||
                    "Desconhecido"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 ">
                <Badge
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    billing.type === EBillingType.INCOME
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-red-100 text-red-700 border-red-200"
                  }`}
                >
                  {billing.type === EBillingType.INCOME ? "ENTRADA" : "SAÍDA"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(billing?.amount || 0)}
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm leading-relaxed">
              {billing.description}
            </CardDescription>

            <CardContent className="text-gray-600 text-sm leading-relaxed">
              key: {billing.key}
            </CardContent>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        <div className="flex justify-between w-full flex-col gap-2">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full p-2 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(billing)
              }}
            >
              <Edit className="h-4 w-4" />
              <span className="">Editar</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-full p-2 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation()
                onReceipt(billing)
              }}
            >
              <Icon name="document" className="mr-2" />
              <span>Recibos</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
