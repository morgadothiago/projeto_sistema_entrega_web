import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save } from "lucide-react";

interface DeliveryConfig {
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
  zones: unknown[];
}

export function DeliveryConfigForm({
  config,
  onSave,
  onCancel,
}: {
  config: DeliveryConfig | null;
  onSave: (config: DeliveryConfig) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<DeliveryConfig>>(
    config || {
      name: "",
      description: "",
      basePrice: 0,
      pricePerKm: 0,
      minPrice: 0,
      maxPrice: 0,
      estimatedTime: 60,
      vehicleType: "moto",
      isActive: true,
      zones: [],
    }
  );

  const vehicleTypes = [
    { value: "moto", label: "Moto", icon: "🏍️" },
    { value: "carro", label: "Carro", icon: "🚗" },
    { value: "bicicleta", label: "Bicicleta", icon: "🚲" },
    { value: "van", label: "Van", icon: "🚐" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.basePrice && formData.pricePerKm) {
      onSave(formData as DeliveryConfig);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="text-sm font-semibold text-[#2C3E50]"
          >
            Nome da Configuração
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Entrega Padrão"
            required
            className="text-sm border-gray-300 focus:border-[#003B73] focus:ring-[#003B73] rounded-xl transition-all duration-300"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="vehicleType"
            className="text-sm font-semibold text-[#2C3E50]"
          >
            Tipo de Veículo
          </Label>
          <Select
            value={formData.vehicleType}
            onValueChange={(value) =>
              setFormData({ ...formData, vehicleType: value })
            }
          >
            <SelectTrigger className="text-sm border-gray-300 focus:border-[#003B73] focus:ring-[#003B73] rounded-xl transition-all duration-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {vehicleTypes.map((type) => (
                <SelectItem
                  key={type.value}
                  value={type.value}
                  className="text-sm"
                >
                  <span className="mr-2">{type.icon}</span>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="description"
          className="text-sm font-semibold text-[#2C3E50]"
        >
          Descrição
        </Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Ex: Entrega em até 2 horas"
          className="text-sm border-gray-300 focus:border-[#003B73] focus:ring-[#003B73] rounded-xl transition-all duration-300"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="basePrice"
            className="text-sm font-semibold text-[#2C3E50]"
          >
            Preço Base (R$)
          </Label>
          <Input
            id="basePrice"
            type="number"
            step="0.01"
            value={formData.basePrice}
            onChange={(e) =>
              setFormData({
                ...formData,
                basePrice: parseFloat(e.target.value) || 0,
              })
            }
            required
            className="text-sm border-gray-300 focus:border-[#00FFB3] focus:ring-[#00FFB3] rounded-xl transition-all duration-300"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="pricePerKm"
            className="text-sm font-semibold text-[#2C3E50]"
          >
            Preço por KM (R$)
          </Label>
          <Input
            id="pricePerKm"
            type="number"
            step="0.01"
            value={formData.pricePerKm}
            onChange={(e) =>
              setFormData({
                ...formData,
                pricePerKm: parseFloat(e.target.value) || 0,
              })
            }
            required
            className="text-sm border-gray-300 focus:border-[#5DADE2] focus:ring-[#5DADE2] rounded-xl transition-all duration-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="minPrice"
            className="text-sm font-semibold text-[#2C3E50]"
          >
            Preço Mínimo (R$)
          </Label>
          <Input
            id="minPrice"
            type="number"
            step="0.01"
            value={formData.minPrice}
            onChange={(e) =>
              setFormData({
                ...formData,
                minPrice: parseFloat(e.target.value) || 0,
              })
            }
            required
            className="text-sm border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-xl transition-all duration-300"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="maxPrice"
            className="text-sm font-semibold text-[#2C3E50]"
          >
            Preço Máximo (R$)
          </Label>
          <Input
            id="maxPrice"
            type="number"
            step="0.01"
            value={formData.maxPrice}
            onChange={(e) =>
              setFormData({
                ...formData,
                maxPrice: parseFloat(e.target.value) || 0,
              })
            }
            required
            className="text-sm border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-xl transition-all duration-300"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="estimatedTime"
            className="text-sm font-semibold text-[#2C3E50]"
          >
            Tempo Estimado (min)
          </Label>
          <Input
            id="estimatedTime"
            type="number"
            value={formData.estimatedTime}
            onChange={(e) =>
              setFormData({
                ...formData,
                estimatedTime: parseInt(e.target.value) || 0,
              })
            }
            required
            className="text-sm border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all duration-300"
          />
        </div>
      </div>

      <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full sm:w-auto border-gray-300 text-[#2C3E50] hover:bg-gray-50 rounded-xl transition-all duration-300 py-3 sm:py-2 font-semibold"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto bg-gradient-to-r from-[#003B73] to-[#5DADE2] hover:from-[#00449a] hover:to-[#4A90E2] text-white border-0 rounded-xl transition-all duration-300 hover:scale-105 py-3 sm:py-2 font-semibold"
        >
          <Save className="w-4 h-4 mr-2" />
          Salvar
        </Button>
      </DialogFooter>
    </form>
  );
}
