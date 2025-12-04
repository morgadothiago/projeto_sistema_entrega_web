import React from "react"
import { Bell } from "lucide-react"

export const NotificationHeader = () => {
    return (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                <div>
                    <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                        Notificações
                    </h1>
                    <p className="text-blue-100 text-sm md:text-lg">
                        Acompanhe o status das suas entregas em tempo real
                    </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 md:p-4 hidden md:block">
                    <Bell className="w-8 h-8 md:w-12 md:h-12 text-white" />
                </div>
            </div>
        </div>
    )
}
