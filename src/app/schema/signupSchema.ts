import * as yup from "yup"
import {
  isValidCNPJ,
  isValidCEPFormat,
  isValidPhoneFormat,
  isStrongPassword,
  getPasswordStrengthMessage,
} from "../utils/validators"

export const signupSchema = yup.object().shape({
  // Dados Empresariais
  companyName: yup
    .string()
    .required("Nome da empresa é obrigatório")
    .min(3, "Nome da empresa deve ter no mínimo 3 caracteres")
    .max(100, "Nome da empresa deve ter no máximo 100 caracteres"),

  cnpj: yup
    .string()
    .required("CNPJ é obrigatório")
    .test("valid-cnpj", "CNPJ inválido", (value) => {
      if (!value) return false
      return isValidCNPJ(value)
    }),

  phone: yup
    .string()
    .required("Telefone é obrigatório")
    .test("valid-phone", "Telefone inválido", (value) => {
      if (!value) return false
      return isValidPhoneFormat(value)
    }),

  businessType: yup
    .string()
    .required("Tipo de negócio é obrigatório")
    .min(3, "Tipo de negócio deve ter no mínimo 3 caracteres"),

  // Endereço
  zipCode: yup
    .string()
    .required("CEP é obrigatório")
    .test("valid-cep", "CEP inválido", (value) => {
      if (!value) return false
      return isValidCEPFormat(value)
    }),

  address: yup
    .string()
    .required("Endereço é obrigatório")
    .min(5, "Endereço deve ter no mínimo 5 caracteres"),

  number: yup
    .string()
    .required("Número é obrigatório")
    .matches(/^\d+$/, "Número deve conter apenas dígitos"),

  complement: yup.string().optional().default(""),

  city: yup.string().required("Cidade é obrigatória"),

  state: yup.string().required("Estado é obrigatório").length(2, "Estado deve ter 2 caracteres"),

  // Dados de Acesso
  email: yup
    .string()
    .required("Email é obrigatório")
    .email("Email inválido")
    .lowercase("Email deve estar em letras minúsculas"),

  password: yup
    .string()
    .required("Senha é obrigatória")
    .test("strong-password", function (value) {
      if (!value) return false
      if (!isStrongPassword(value)) {
        return this.createError({
          message: getPasswordStrengthMessage(value),
        })
      }
      return true
    }),

  confirmPassword: yup
    .string()
    .required("Confirmação de senha é obrigatória")
    .oneOf([yup.ref("password")], "As senhas não correspondem"),
})

export type SignupFormData = yup.InferType<typeof signupSchema>
