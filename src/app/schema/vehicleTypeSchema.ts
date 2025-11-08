import * as yup from "yup"

export const vehicleTypeSchema = yup.object({
  type: yup.string().required("O nome é obrigatório"),
  tarifaBase: yup.number().required().min(0, "Valor inválido"),
  valorKMAdicional: yup.number().required().min(0, "Valor inválido"),
  paradaAdicional: yup.number().required().min(0, "Valor inválido"),
  ajudanteAdicional: yup.number().required().min(0, "Valor inválido"),
})
