"use client"

import React, { useState } from "react"
import { useForm, FormProvider, SubmitHandler } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import api from "../services/api"
import { useRouter } from "next/navigation"
import { BusinessDataStep } from "./BusinessDataStep"
import { AddressStep } from "./AddressStep"
import { AccessDataStep } from "./AccessDataStep"
import { unmaskInput } from "../utils/unmaskInput"
import type { ICreateUser } from "../types/User"
import { signupSchema, SignupFormData } from "../schema/signupSchema"

export default function SignUpPage() {
  const [step, setStep] = useState(1)
  const methods = useForm<SignupFormData>({
    resolver: yupResolver(signupSchema),
    mode: "onTouched",
    defaultValues: {
      companyName: "",
      cnpj: "",
      phone: "",
      businessType: "",
      zipCode: "",
      address: "",
      number: "",
      complement: "",
      city: "",
      state: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1)
  }

  const handleNext = async () => {
    // Validação por etapa
    if (step === 1) {
      const step1Fields = ["companyName", "cnpj", "phone", "businessType"] as const
      const isStep1Valid = await methods.trigger(step1Fields)

      if (!isStep1Valid) {
        const errors = methods.formState.errors
        let errorMessage = "Verifique os campos obrigatórios"

        // Mensagem mais específica baseada no erro
        if (errors.cnpj) {
          errorMessage = "CNPJ inválido ou não preenchido"
        } else if (errors.phone) {
          errorMessage = "Telefone inválido ou não preenchido"
        } else if (errors.companyName) {
          errorMessage = "Nome da empresa não preenchido"
        } else if (errors.businessType) {
          errorMessage = "Tipo de negócio não preenchido"
        }

        toast.error("Dados empresariais incompletos", {
          description: errorMessage,
        })
        return
      }

      setStep(2)
      return
    }

    if (step === 2) {
      const step2Fields = ["zipCode", "address", "number", "city", "state"] as const
      const isStep2Valid = await methods.trigger(step2Fields)

      if (!isStep2Valid) {
        const errors = methods.formState.errors
        let errorMessage = "Verifique os campos do endereço"

        // Mensagem mais específica baseada no erro
        if (errors.zipCode) {
          errorMessage = "CEP inválido ou não preenchido"
        } else if (errors.address) {
          errorMessage = "Endereço não preenchido"
        } else if (errors.number) {
          errorMessage = "Número do endereço não preenchido"
        } else if (errors.city) {
          errorMessage = "Cidade não preenchida"
        } else if (errors.state) {
          errorMessage = "Estado não preenchido ou inválido"
        }

        toast.error("Endereço incompleto", {
          description: errorMessage,
        })
        return
      }

      setStep(3)
      return
    }

    // Etapa 3: submeter o formulário
    methods.handleSubmit(onSubmit)()
  }

  const onSubmit: SubmitHandler<SignupFormData> = async (data) => {
    // Validar etapa 3
    const isStep3Valid = await methods.trigger(["email", "password", "confirmPassword"])

    if (!isStep3Valid) {
      const errors = methods.formState.errors
      let errorMessage = "Verifique os dados de acesso"

      // Mensagem mais específica baseada no erro
      if (errors.email) {
        errorMessage = errors.email.message || "Email inválido"
      } else if (errors.password) {
        errorMessage = errors.password.message || "Senha não atende aos requisitos"
      } else if (errors.confirmPassword) {
        errorMessage = "As senhas não correspondem"
      }

      toast.error("Dados de acesso inválidos", {
        description: errorMessage,
      })
      return
    }

    const unmaskedData: ICreateUser = {
      name: data.companyName,
      cnpj: unmaskInput(data.cnpj),
      phone: unmaskInput(data.phone),
      zipCode: unmaskInput(data.zipCode),
      address: data.address,
      number: data.number,
      complement: data.complement || "",
      city: data.city,
      state: data.state,
      email: data.email,
      password: data.password,
    }

    setIsLoading(true)

    try {
      const response = await api.newUser(unmaskedData)

      if (response && "status" in response) {
        if (response.status === 409) {
          const conflictMessage =
            typeof response.message === "string"
              ? response.message
              : "Este email ou CNPJ já está cadastrado"

          toast.warning("Cadastro duplicado", {
            description: conflictMessage,
          })
        } else {
          // Outros erros da API
          const errorMessage =
            typeof response.message === "string"
              ? response.message
              : "Erro ao processar cadastro"

          toast.error("Erro no cadastro", {
            description: errorMessage,
          })
        }

        setIsLoading(false)
        return
      }

      toast.success("Cadastro realizado com sucesso!", {
        description: "Você será redirecionado para fazer login",
      })

      setTimeout(() => {
        router.push("/signin")
      }, 1500)
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Erro ao conectar com o servidor. Verifique sua conexão."

      toast.error("Erro ao realizar cadastro", {
        description: errorMessage,
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center px-3 py-8">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#2563EB] mb-2">
              Cadastro de Empresa
            </h1>
            <p className="text-sm text-gray-600">
              Já tem uma conta?{" "}
              <a
                href="/signin"
                className="text-[#5DADE2] hover:text-[#2563EB] font-semibold transition-colors"
              >
                Fazer login
              </a>
            </p>
          </div>

          {/* Progress Bar */}
          <div className="relative mb-8">
            <div className="flex justify-between p-3 bg-gradient-to-r from-[#5DADE2] to-[#2563EB] rounded-xl gap-2">
              {["Dados Empresariais", "Endereço", "Dados de Acesso"].map(
                (label, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        step === index + 1
                          ? "bg-[#00E676] scale-110 shadow-lg"
                          : step > index + 1
                          ? "bg-[#00E676]"
                          : "bg-white/30"
                      }`}
                    >
                      <span
                        className={`text-base font-bold ${
                          step >= index + 1
                            ? "text-white"
                            : "text-white/60"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-white font-medium mt-2 text-xs text-center leading-tight">
                      {label}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          <FormProvider {...methods}>
            <form
              onSubmit={step === 3 ? methods.handleSubmit(onSubmit) : (e) => {
                e.preventDefault()
                handleNext()
              }}
              className="w-full"
            >
              <div className="mb-4">
                {step === 1 && <BusinessDataStep />}
                {step === 2 && <AddressStep />}
                {step === 3 && <AccessDataStep />}
              </div>

              <div className="flex justify-between mt-8 pt-6">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2"
                    onClick={handleBack}
                    disabled={isLoading}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Voltar
                  </Button>
                ) : (
                  <a
                    href="/signin"
                    className="inline-flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Voltar ao login
                  </a>
                )}
                <Button
                  type="submit"
                  className={`bg-[#00E676] hover:bg-[#00c853] text-white px-8 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Carregando...
                    </>
                  ) : (
                    <>
                      {step === 3 ? "Finalizar" : "Próximo"}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  )
}
