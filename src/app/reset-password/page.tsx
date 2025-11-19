"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ArrowLeft, Mail, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import FundoBg from "../../../public/fundo.png"

interface ResetPasswordForm {
  email: string
}

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordForm>()

  const email = watch("email")

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsLoading(true)

    try {
      // Simular chamada de API (substitua pela sua lógica real)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // TODO: Implementar chamada real à API
      // const response = await api.resetPassword(data.email)

      setEmailSent(true)
      toast.success("Email enviado!", {
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
        duration: 5000,
        position: "top-right",
      })
    } catch (error) {
      toast.error("Erro ao enviar email", {
        description: "Não foi possível enviar o email de recuperação. Tente novamente.",
        duration: 4000,
        position: "top-right",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundImage: `url(${FundoBg.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Email Enviado!
            </h2>
            <p className="text-gray-600">
              Enviamos um link de recuperação para:
            </p>
            <p className="text-blue-600 font-semibold mt-2">{email}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Próximos passos:</strong>
            </p>
            <ol className="text-sm text-blue-700 text-left mt-2 space-y-1 list-decimal list-inside">
              <li>Verifique sua caixa de entrada</li>
              <li>Clique no link de recuperação</li>
              <li>Crie uma nova senha</li>
            </ol>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push("/signin")}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Voltar para Login
            </Button>
            <Button
              variant="outline"
              onClick={() => setEmailSent(false)}
              className="w-full"
            >
              Enviar para outro email
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Não recebeu o email? Verifique sua pasta de spam
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${FundoBg.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Esqueceu sua senha?
            </h1>
            <p className="text-gray-600">
              Sem problemas! Digite seu email e enviaremos instruções para
              redefinir sua senha.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className={`h-12 text-base ${
                  errors.email ? "border-red-500 focus:ring-red-500" : ""
                }`}
                {...register("email", {
                  required: "Email é obrigatório",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email inválido",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Link de Recuperação"
              )}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o login
            </Link>
          </div>

          {/* Help */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-700 font-medium mb-2">
              Precisa de ajuda?
            </p>
            <p className="text-xs text-gray-600">
              Entre em contato com nosso suporte em{" "}
              <a
                href="mailto:suporte@empresa.com"
                className="text-blue-600 hover:underline"
              >
                suporte@empresa.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
