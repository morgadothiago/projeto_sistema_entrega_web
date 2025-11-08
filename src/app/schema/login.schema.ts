import * as yup from "yup";

export const loginValidation = yup.object().shape({
  email: yup.string()
    .required("Email é obrigatório")
    .email("Email inválido"),
  password: yup.string()
    .required("Senha é obrigatória")
    .min(6, "A senha deve ter pelo menos 6 caracteres"),
})