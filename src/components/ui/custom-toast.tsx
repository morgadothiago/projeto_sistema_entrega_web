import { toast } from "sonner"
import { toastConfig } from "@/app/theme/global"

interface CustomToastProps {
  message: string
  type: "success" | "error" | "warning" | "info"
  duration?: number
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
}

export const customToast = {
  success: (message: string, options?: Partial<CustomToastProps>) => {
    return toast.success(message, {
      ...toastConfig.success,
      ...options,
    })
  },

  error: (message: string, options?: Partial<CustomToastProps>) => {
    return toast.error(message, {
      ...toastConfig.error,
      ...options,
    })
  },

  warning: (message: string, options?: Partial<CustomToastProps>) => {
    return toast.warning(message, {
      ...toastConfig.warning,
      ...options,
    })
  },

  info: (message: string, options?: Partial<CustomToastProps>) => {
    return toast.info(message, {
      ...toastConfig.info,
      ...options,
    })
  },

  // Método genérico para usar qualquer tipo
  show: (
    message: string,
    type: CustomToastProps["type"],
    options?: Partial<CustomToastProps>
  ) => {
    switch (type) {
      case "success":
        return customToast.success(message, options)
      case "error":
        return customToast.error(message, options)
      case "warning":
        return customToast.warning(message, options)
      case "info":
        return customToast.info(message, options)
      default:
        return customToast.info(message, options)
    }
  },
}

// Hook personalizado para usar o toast
export const useCustomToast = () => {
  return customToast
}

// Componente de toast com métodos específicos para diferentes contextos
export const BillingToast = {
  // Toasts específicos para faturamentos
  loaded: () => customToast.success("Faturamentos carregados com sucesso"),

  created: () => customToast.success("Faturamento criado com sucesso"),

  updated: () => customToast.success("Faturamento atualizado com sucesso"),

  deleted: () => customToast.success("Faturamento excluído com sucesso"),

  error: (message: string) => customToast.error(message),

  validationError: (field: string) =>
    customToast.error(`Erro de validação: ${field} é obrigatório`),

  networkError: () =>
    customToast.error(
      "Erro de conexão. Verifique sua internet e tente novamente"
    ),

  unauthorized: () =>
    customToast.error("Sessão expirada. Faça login novamente"),
}

// Componente de toast para recibos
export const ReceiptToast = {
  created: () => customToast.success("Recibo criado com sucesso"),

  updated: () => customToast.success("Recibo atualizado com sucesso"),

  deleted: () => customToast.success("Recibo excluído com sucesso"),

  fileRequired: () =>
    customToast.warning("Selecione um arquivo para criar o recibo"),

  descriptionRequired: () =>
    customToast.warning("Digite uma descrição para o recibo"),

  uploadError: () => customToast.error("Erro ao fazer upload do arquivo"),

  invalidFileType: () => customToast.error("Tipo de arquivo não suportado"),
}

// Componente de toast para autenticação
export const AuthToast = {
  loginSuccess: () => customToast.success("Login realizado com sucesso"),

  logoutSuccess: () => customToast.info("Logout realizado com sucesso"),

  loginError: () =>
    customToast.error("Erro ao fazer login. Verifique suas credenciais"),

  sessionExpired: () =>
    customToast.warning("Sessão expirada. Faça login novamente"),

  passwordChanged: () => customToast.success("Senha alterada com sucesso"),

  accountCreated: () => customToast.success("Conta criada com sucesso"),
}

// Componente de toast para validações
export const ValidationToast = {
  required: (field: string) => customToast.warning(`${field} é obrigatório`),

  invalidEmail: () => customToast.warning("Email inválido"),

  invalidPassword: () =>
    customToast.warning("Senha deve ter pelo menos 6 caracteres"),

  passwordsNotMatch: () => customToast.warning("Senhas não coincidem"),

  invalidAmount: () => customToast.warning("Valor deve ser maior que zero"),

  invalidDate: () => customToast.warning("Data inválida"),
}

export default customToast
