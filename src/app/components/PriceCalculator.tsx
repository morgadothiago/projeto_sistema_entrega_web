import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, Sparkles } from "lucide-react";

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

function calculatePrice(
  config: DeliveryConfig,
  distance: number,
  zoneMultiplier: number = 1.0
) {
  const basePrice = config.basePrice;
  const distancePrice = distance * config.pricePerKm;
  const totalPrice = (basePrice + distancePrice) * zoneMultiplier;
  return Math.max(config.minPrice, Math.min(config.maxPrice, totalPrice));
}

export function PriceCalculator({ configs }: { configs: DeliveryConfig[] }) {
  const [distance, setDistance] = useState(5);
  const [selectedZone, setSelectedZone] = useState("1.0");
  const [selectedConfig, setSelectedConfig] = useState<string>("");

  const zones = [
    {
      value: "1.0",
      label: "Zona Central (1.0x)",
      color: "from-[#00FFB3] to-[#00E6A3]",
    },
    {
      value: "1.1",
      label: "Zona Sul (1.1x)",
      color: "from-[#5DADE2] to-[#4A90E2]",
    },
    {
      value: "1.2",
      label: "Zona Norte (1.2x)",
      color: "from-[#003B73] to-[#00449a]",
    },
    {
      value: "1.3",
      label: "Zona Leste (1.3x)",
      color: "from-orange-500 to-red-500",
    },
  ];

  const selectedDeliveryConfig = configs.find((c) => c.id === selectedConfig);
  const calculatedPrice = selectedDeliveryConfig
    ? calculatePrice(selectedDeliveryConfig, distance, parseFloat(selectedZone))
    : 0;

  return (
    <Card className="rounded-2xl border-0 bg-white/90 backdrop-blur-sm shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-[#00FFB3] via-[#00E6A3] to-[#00D4A3] p-6 text-[#003B73]">
        <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <Calculator className="w-6 h-6" />
          </div>
          Calculadora de Preços
        </CardTitle>
        <CardDescription className="text-[#003B73]/80 text-sm sm:text-base mt-2">
          Simule preços de entrega baseados na distância e zona
        </CardDescription>
      </div>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="config"
              className="text-sm font-semibold text-[#2C3E50]"
            >
              Tipo de Entrega
            </Label>
            <Select value={selectedConfig} onValueChange={setSelectedConfig}>
              <SelectTrigger className="text-sm border-gray-300 focus:border-[#003B73] focus:ring-[#003B73] rounded-xl transition-all duration-300">
                <SelectValue placeholder="Selecione uma configuração" />
              </SelectTrigger>
              <SelectContent>
                {configs
                  .filter((c) => c.isActive)
                  .map((config) => (
                    <SelectItem
                      key={config.id}
                      value={config.id}
                      className="text-sm"
                    >
                      {config.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="distance"
              className="text-sm font-semibold text-[#2C3E50]"
            >
              Distância (KM)
            </Label>
            <Input
              id="distance"
              type="number"
              value={distance}
              onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.1"
              className="text-sm border-gray-300 focus:border-[#00FFB3] focus:ring-[#00FFB3] rounded-xl transition-all duration-300"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="zone"
              className="text-sm font-semibold text-[#2C3E50]"
            >
              Zona de Entrega
            </Label>
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="text-sm border-gray-300 focus:border-[#5DADE2] focus:ring-[#5DADE2] rounded-xl transition-all duration-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {zones.map((zone) => (
                  <SelectItem
                    key={zone.value}
                    value={zone.value}
                    className="text-sm"
                  >
                    {zone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {selectedDeliveryConfig && (
          <div className="bg-gradient-to-br from-[#00FFB3]/10 via-[#00E6A3]/15 to-[#00D4A3]/20 p-6 rounded-2xl border border-[#00FFB3]/30 shadow-lg">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#003B73] to-[#5DADE2] bg-clip-text text-transparent">
                  R$ {calculatedPrice.toFixed(2)}
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-5 h-5 text-[#00FFB3] animate-pulse" />
                </div>
              </div>
              <p className="text-sm sm:text-base text-[#2C3E50] font-medium">
                Preço calculado para {distance}km
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/50 p-3 rounded-xl border border-[#00FFB3]/30">
                  <span className="text-[#2C3E50] font-medium">
                    Preço Base:
                  </span>
                  <div className="font-bold text-[#00FFB3] text-lg">
                    R$ {selectedDeliveryConfig.basePrice.toFixed(2)}
                  </div>
                </div>
                <div className="bg-white/50 p-3 rounded-xl border border-[#5DADE2]/30">
                  <span className="text-[#2C3E50] font-medium">
                    Custo por KM:
                  </span>
                  <div className="font-bold text-[#5DADE2] text-lg">
                    R${" "}
                    {(distance * selectedDeliveryConfig.pricePerKm).toFixed(2)}
                  </div>
                </div>
                <div className="bg-white/50 p-3 rounded-xl border border-[#003B73]/30">
                  <span className="text-[#2C3E50] font-medium">
                    Multiplicador:
                  </span>
                  <div className="font-bold text-[#003B73] text-lg">
                    {selectedZone}x
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
