// Variantes de tema global
export const themeVariants = {
  input: {
    green:
      "h-12 text-base border-2 border-green-200 focus:border-green-400 focus:ring-2 focus:ring-green-100",
    blue: "h-12 text-base border-2 border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
    greenNumber:
      "pl-10 h-12 text-lg font-medium border-2 border-green-200 focus:border-green-400 focus:ring-2 focus:ring-green-100",
    blueNumber:
      "pl-10 h-12 text-lg font-medium border-2 border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
  },
  card: {
    green: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200",
    blue: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200",
  },
  button: {
    green: "text-green-600 hover:text-green-800 hover:bg-green-100",
    blue: "text-blue-600 hover:text-blue-800 hover:bg-blue-100",
    greenPrimary:
      "px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed",
    bluePrimary:
      "px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed",
  },
}

// Configurações de toast
export const toastConfig = {
  success: {
    position: "top-right" as const,
    duration: 5000,
    style: {
      background: "#4CAF50",
      color: "white",
      border: "2px solid #45a049",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "600",
      boxShadow: "0 10px 25px rgba(76, 175, 80, 0.3)",
    },
    richColors: true,
    icon: "✅",
  },
  error: {
    position: "top-left" as const,
    duration: 5000,
    style: {
      background: "#ef4444",
      color: "white",
      border: "2px solid #dc2626",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "600",
      boxShadow: "0 10px 25px rgba(239, 68, 68, 0.3)",
    },
    richColors: true,
    icon: "❌",
  },
  warning: {
    position: "top-right" as const,
    duration: 4000,
    style: {
      background: "#f59e0b",
      color: "white",
      border: "2px solid #d97706",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "600",
      boxShadow: "0 10px 25px rgba(245, 158, 11, 0.3)",
    },
    richColors: true,
    icon: "⚠️",
  },
  info: {
    position: "top-right" as const,
    duration: 4000,
    style: {
      background: "#3b82f6",
      color: "white",
      border: "2px solid #2563eb",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "600",
      boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
    },
    richColors: true,
    icon: "ℹ️",
  },
}
