import * as yup from "yup";
export const schema = yup.object().shape({
  companyName: yup.string().required("Nome da empresa é obrigatório"),
  cnpj: yup
    .string()
    .required("CNPJ é obrigatório")
    .matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ inválido"),
  phone: yup
    .string()
    .required("Telefone é obrigatório")
    .matches(/^\(\d{2}\) \d{5}-\d{4}$/, "Telefone inválido"),
  address: yup.string().required("Endereço é obrigatório"),
  city: yup.string().required("Cidade é obrigatória"),
  businessType: yup.string().required("Tipo de negócio é obrigatório"),
  cep: yup
    .string()
    .required("CEP é obrigatório")
    .matches(/^\d{5}-\d{3}$/, "CEP inválido"),
  email: yup.string().required("Email é obrigatório").email("Email inválido"),
  password: yup
    .string()
    .required("Senha é obrigatória")
    .min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "As senhas devem corresponder")
    .required("Confirmação de senha é obrigatória"),
});
