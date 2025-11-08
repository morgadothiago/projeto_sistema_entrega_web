import React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

interface BillingHeaderProps {
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  children: React.ReactNode
}

export const BillingHeader: React.FC<BillingHeaderProps> = ({
  dialogOpen,
  setDialogOpen,
  children,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-2xl">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Faturamentos</h1>
            <p className="text-blue-100 text-lg max-w-2xl">
              Gerencie todos os seus faturamentos, receitas e despesas de forma
              inteligente
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-3 bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 shadow-lg">
                <Plus className="w-5 h-5" />
                Novo Faturamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  Criar Novo Faturamento
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Preencha os dados para criar um novo faturamento.
                </DialogDescription>
              </DialogHeader>
              {children}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
