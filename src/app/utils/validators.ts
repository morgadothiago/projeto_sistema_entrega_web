/**
 * Valida se um CNPJ é válido (apenas formato, não valida dígitos verificadores)
 */
export function isValidCNPJFormat(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/\D/g, "")
  return cleanCNPJ.length === 14
}

/**
 * Valida CNPJ com dígitos verificadores
 */
export function isValidCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/\D/g, "")

  if (cleanCNPJ.length !== 14) return false

  // Elimina CNPJs inválidos conhecidos
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false

  // Valida DVs
  let length = cleanCNPJ.length - 2
  let numbers = cleanCNPJ.substring(0, length)
  const digits = cleanCNPJ.substring(length)
  let sum = 0
  let pos = length - 7

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--
    if (pos < 2) pos = 9
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(0))) return false

  length = length + 1
  numbers = cleanCNPJ.substring(0, length)
  sum = 0
  pos = length - 7

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--
    if (pos < 2) pos = 9
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(1))) return false

  return true
}

/**
 * Valida se um CEP é válido (apenas formato)
 */
export function isValidCEPFormat(cep: string): boolean {
  const cleanCEP = cep.replace(/\D/g, "")
  return cleanCEP.length === 8
}

/**
 * Valida se um telefone brasileiro é válido (formato)
 */
export function isValidPhoneFormat(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, "")
  return cleanPhone.length === 10 || cleanPhone.length === 11
}

/**
 * Valida se um email é válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida senha forte:
 * - Mínimo 8 caracteres
 * - Pelo menos uma letra maiúscula
 * - Pelo menos uma letra minúscula
 * - Pelo menos um número
 */
export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false

  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)

  return hasUpperCase && hasLowerCase && hasNumber
}

/**
 * Retorna uma mensagem descritiva sobre os requisitos da senha
 */
export function getPasswordStrengthMessage(password: string): string {
  const issues: string[] = []

  if (password.length < 8) {
    issues.push("mínimo 8 caracteres")
  }

  if (!/[A-Z]/.test(password)) {
    issues.push("uma letra maiúscula")
  }

  if (!/[a-z]/.test(password)) {
    issues.push("uma letra minúscula")
  }

  if (!/\d/.test(password)) {
    issues.push("um número")
  }

  if (issues.length === 0) return "Senha forte"

  return `A senha deve conter: ${issues.join(", ")}`
}
