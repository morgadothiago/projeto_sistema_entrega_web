import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"

interface BillingStatsProps {
  totalIncome: number
  totalExpense: number
  balance: number
}

export const BillingStats: React.FC<BillingStatsProps> = ({
  totalIncome,
  totalExpense,
  balance,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Receitas</p>
              <p className="text-2xl font-bold text-green-800">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalIncome)}
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Despesas</p>
              <p className="text-2xl font-bold text-red-800">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalExpense)}
              </p>
            </div>
            <div className="p-3 bg-red-200 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Saldo</p>
              <p
                className={`text-2xl font-bold ${
                  balance >= 0 ? "text-blue-800" : "text-red-800"
                }`}
              >
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(balance)}
              </p>
            </div>
            <div className="p-3 bg-blue-200 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
