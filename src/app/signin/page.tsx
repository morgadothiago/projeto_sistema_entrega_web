/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { Plus, Loader } from "lucide-react"
import Link from "next/link"
import React, { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { SignInFormData } from "../types/SingInType"
import { TextInput } from "../components/TextInput"
import { ActionState, loginRequester } from "../actions/login"
import { loginValidation } from "../schema/login.schema"
import bannerLogin from "../../../public/banner_login.png"
import FundoBg from "../../../public/fundo.png"
import { useRouter } from "next/navigation"

export default function SignInPage() {
  const router = useRouter()
  const [actionState, action, isPending] = useActionState<
    ActionState,
    FormData
  >(loginRequester, {
    message: "",
    error: "",
    success: false,
  })

  const {
    register,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<SignInFormData>()

  React.useEffect(() => {
    Object.keys(loginValidation.fields).forEach((key) => {
      setError(key as keyof SignInFormData, {
        type: "manual",
        message: "",
      })
    })

    if (actionState.error) {
      let message = "Erro ao realizar login!"

      if (typeof actionState.error !== "string") {
        message = actionState.error.message
        const name = actionState.error.path as keyof SignInFormData

        setError(name, {
          type: "manual",
          message: actionState.error.message,
        })

        setFocus(name, { shouldSelect: true })
      }

      toast.error("Credenciais inválidas", {
        description: message,
      })

      return
    }

    if (actionState.success) {
      toast.success("Login realizado com sucesso!", {
        description: "Você está sendo redirecionado para a página inicial",
      })

      // Redirecionar usando router.push no cliente
      setTimeout(() => {
        router.push("/dashboard")
      }, 500)
    }
  }, [actionState, router])

  return (
    <div className="flex flex-col lg:flex-row overflow-hidden min-h-screen">
      {/* Banner Lateral - Desktop */}
      <div
        className="hidden lg:flex w-[598px] min-h-screen flex-col justify-between items-center relative overflow-hidden p-10"
        style={{
          backgroundImage: `url(${bannerLogin.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay para melhor legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />

        {/* Conteúdo do banner */}
        <div className="relative z-10 text-white text-center max-w-md mt-20">
          <h1 className="text-4xl font-bold mb-4"></h1>
          <p className="text-lg text-white/90">

          </p>
        </div>

        {/* Botão de cadastro */}
        <div className="relative z-10 w-full px-10 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
            <p className="text-white mb-4 text-sm">Ainda não tem uma conta?</p>
            <Link
              href="/signup"
              className="flex gap-2.5 py-3 items-center justify-center bg-gradient-to-r from-cyan-400 to-blue-600 shadow-lg hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-cyan-300/60 rounded-xl px-8 text-white font-bold text-lg transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Cadastrar-se
            </Link>
          </div>
        </div>
      </div>

      {/* Formulário de Login */}
      <div
        className="flex items-center justify-center w-full min-h-screen p-4 lg:p-10"
        style={{
          backgroundImage: `url(${FundoBg.src})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="w-full max-w-md">
          <form
            className="flex flex-col w-full p-8 bg-white rounded-2xl shadow-2xl gap-6 border border-gray-100"
            action={action}
          >
            {/* Header do Form */}
            <div className="text-center mb-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Login</h2>
              <p className="text-gray-600">Entre com suas credenciais</p>
            </div>

            {/* Campos */}
            <div className="space-y-4">
              <TextInput
                labelName="Email"
                error={errors.email}
                placeholder="seu@email.com"
                className="w-full"
                classNameInput="h-12"
                defaultValue={actionState.payload?.get?.("email") as string}
                {...register("email")}
              />

              <TextInput
                labelName="Senha"
                error={errors.password}
                placeholder="••••••••"
                type="password"
                className="w-full"
                classNameInput="h-12"
                defaultValue={actionState.payload?.get?.("password") as string}
                {...register("password")}
              />
            </div>

            {/* Esqueceu a senha */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {/* TODO: Implementar "Lembrar-me" quando necessário */}
              </div>
              <Link
                href="/reset-password"
                className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors duration-200"
              >
                Esqueceu a senha?
              </Link>
            </div>

            {/* Botão de Login */}
            <Button
              className="w-full bg-gradient-to-r h-12 from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 ease-in-out text-white font-semibold text-lg shadow-lg transform hover:scale-105"
              type="submit"
              disabled={isPending}
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <Loader className="animate-spin h-5 w-5" />
                  Entrando...
                </div>
              ) : (
                "Entrar"
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-2 lg:hidden">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">ou</span>
              </div>
            </div>

            {/* Cadastro Mobile */}
            <div className="text-center lg:hidden ">
              <p className="text-gray-600 mb-3">Ainda não tem uma conta?</p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                Criar conta gratuita
              </Link>
            </div>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Ao fazer login, você concorda com nossos{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Termos de Uso
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
