import React from "react"
import { Input } from "@/components/ui/input"
import { Icon } from "./Icon"

interface DeliverySearchProps {
    value: string
    onChange: (value: string) => void
}

export const DeliverySearch: React.FC<DeliverySearchProps> = ({
    value,
    onChange,
}) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-4">
            <div className="relative">
                <Icon
                    name="search"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size="md"
                />
                <Input
                    type="text"
                    placeholder="Buscar por código, empresa ou email..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="pl-12 pr-4 py-6 text-base rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
            </div>
        </div>
    )
}
