"use client"

import React, { useState } from "react"
import { useForm, FormProvider, SubmitHandler } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import api from "../services/api"
import { useRouter } from "next/navigation"
import { BusinessDataStep } from "./BusinessDataStep"
import { AddressStep } from "./AddressStep"
import { AccessDataStep } from "./AccessDataStep"
import { unmaskInput } from "../util/unmaskInput"
import type { ICreateUser } from "../types/User"
import FundoBg from "../../../public/fundo.png"

type FormData = {
  companyName: string
  cnpj: string
  email: string
  password: string
  address: string
  number: string
  complement: string
  city: string
  state: string
  zipCode: string
  phone: string
}

export default function SignUpPage() {
  const [step, setStep] = useState(1)
  const methods = useForm<FormData>()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1)
  }

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (step < 3) {
      setStep((prev) => prev + 1)
      return
    }

    // Último passo: enviar dados
    const unmaskedData: ICreateUser = {
      name: data.companyName,
      ...data,
      zipCode: unmaskInput(data.zipCode),
      phone: unmaskInput(data.phone),
      cnpj: unmaskInput(data.cnpj),
    }

    setIsLoading(true)

    try {
      const response = await api.newUser(unmaskedData)

      if (response && "status" in response) {
        if (response.status === 409) {
          toast.warning(response.message, {
            duration: 3000,
            position: "top-right",
            richColors: true,
          })
        }

        return
      }

      toast.success("Cadastro realizado com sucesso!", {
        duration: 3000,
        position: "top-right",
        richColors: true,
      })

      setIsLoading(false)

      setTimeout(() => {
        router.push("/signin")
      }, 1500)
    } catch (error) {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-1xl mx-auto ">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100 max-h-[95vh] overflow-auto">
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Cadastro de Empresa
            </h1>
            <p className="text-sm text-gray-600">
              Preencha os dados abaixo para criar sua conta
            </p>
          </div>

          <div className="relative mb-6">
            <div className="flex justify-between p-3 sm:p-4 bg-gradient-to-r from-[#5DADE2] to-[#003873] rounded-xl shadow-lg gap-2">
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
                          ? "bg-[#00E676]/80"
                          : "bg-white/20"
                      }`}
                    >
                      <span
                        className={`text-lg font-bold ${
                          step === index + 1 || step > index + 1
                            ? "text-white"
                            : "text-white/80"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-white font-medium mt-2 text-xs text-center">
                      {label}
                    </span>
                  </div>
                )
              )}
            </div>
            <div
              className="absolute bottom-0 left-0 right-0 h-1 bg-[#00E676] transition-all duration-300 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="w-full">
              <div className="space-y-6">
                {step === 1 && <BusinessDataStep />}
                {step === 2 && <AddressStep />}
                {step === 3 && <AccessDataStep />}
              </div>

              <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm"
                    onClick={handleBack}
                    disabled={isLoading}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
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
                )}
                <Button
                  type="submit"
                  className={`bg-[#00E676] hover:bg-[#00c853] text-white px-6 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  ) : step === 3 ? (
                    <>
                      Finalizar
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
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
                  ) : (
                    <>
                      Próximo
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
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
