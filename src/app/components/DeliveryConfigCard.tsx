import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Package, Edit, Trash2, Clock, Car } from "lucide-react";
import React from "react";

interface DeliveryConfigCardProps {
  config: {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    pricePerKm: number;
    minPrice: number;
    maxPrice: number;
    estimatedTime: number;
    vehicleType: string;
    isActive: boolean;
  };
  vehicleTypes: { value: string; label: string; icon: string }[];
  onEdit: () => void;
  onDelete: () => void;
}

export function DeliveryConfigCard({
  config,
  vehicleTypes,
  onEdit,
  onDelete,
}: DeliveryConfigCardProps) {
  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 rounded-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden transform hover:-translate-y-2 shadow-lg">
      {/* Header com gradiente usando cores da aplicação */}
      <div className="bg-gradient-to-r from-[#003B73] via-[#00449a] to-[#5DADE2] p-4 sm:p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-[clamp(1rem,3vw,1.3rem)] font-bold truncate max-w-[120px] sm:max-w-xs">
                  {config.name}
                </CardTitle>
                <CardDescription className="text-blue-100 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-xs">
                  {config.description}
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={config.isActive ? "default" : "secondary"}
              className={`text-xs px-3 py-1 rounded-full ${
                config.isActive
                  ? "bg-[#00FFB3]/20 text-[#003B73] border-[#00FFB3]/30 font-semibold"
                  : "bg-gray-500/20 text-gray-100 border-gray-400/30"
              }`}
            >
              {config.isActive ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </div>
      </div>
      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Preços com design moderno */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-gradient-to-br from-[#00FFB3]/10 to-[#00E6A3]/20 p-3 sm:p-4 rounded-xl border border-[#00FFB3]/30">
            <Label className="text-xs sm:text-sm font-semibold text-[#003B73] mb-2 block">
              Preço Base
            </Label>
            <p className="text-[clamp(1.1rem,3vw,1.5rem)] font-bold text-[#00FFB3]">
              R$ {config.basePrice.toFixed(2)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#5DADE2]/10 to-[#4A90E2]/20 p-3 sm:p-4 rounded-xl border border-[#5DADE2]/30">
            <Label className="text-xs sm:text-sm font-semibold text-[#003B73] mb-2 block">
              Por KM
            </Label>
            <p className="text-[clamp(1.1rem,3vw,1.5rem)] font-bold text-[#5DADE2]">
              R$ {config.pricePerKm.toFixed(2)}
            </p>
          </div>
        </div>
        {/* Limites com design elegante */}
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-3 sm:p-4 rounded-xl border border-gray-200">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label className="text-xs sm:text-sm font-medium text-gray-600 mb-1 block">
                Preço Mínimo
              </Label>
              <p className="text-[clamp(0.95rem,2.5vw,1.1rem)] font-semibold text-gray-800">
                R$ {config.minPrice.toFixed(2)}
              </p>
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium text-gray-600 mb-1 block">
                Preço Máximo
              </Label>
              <p className="text-[clamp(0.95rem,2.5vw,1.1rem)] font-semibold text-gray-800">
                R$ {config.maxPrice.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        {/* Informações Adicionais */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm text-gray-600 gap-3">
          <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
            <Clock className="w-4 h-4 text-orange-600" />
            <span className="font-medium text-[clamp(0.95rem,2.5vw,1.1rem)]">
              {config.estimatedTime} min
            </span>
          </div>
          <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
            <Car className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-[clamp(0.95rem,2.5vw,1.1rem)]">
              {vehicleTypes.find((v) => v.value === config.vehicleType)?.label}
            </span>
          </div>
        </div>
        {/* Ações */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 min-w-[120px] bg-gradient-to-r from-[#003B73] to-[#5DADE2] text-white border-0 hover:from-[#00449a] hover:to-[#4A90E2] transition-all duration-300 hover:scale-105 py-3 sm:py-2 font-semibold text-[clamp(1rem,2.5vw,1.1rem)]"
            onClick={onEdit}
          >
            <Edit className="w-5 h-5 mr-2" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1 min-w-[120px] bg-gradient-to-r from-red-500 to-pink-500 border-0 hover:from-red-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 py-3 sm:py-2 font-semibold text-[clamp(1rem,2.5vw,1.1rem)]"
            onClick={onDelete}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
