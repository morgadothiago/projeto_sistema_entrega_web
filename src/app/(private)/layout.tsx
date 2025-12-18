"use client"
import React, { ReactNode, useEffect, useState } from "react"

import { SidebarProvider } from "@/components/ui/sidebar"
import { SideBar } from "../components/MenuSheet"
import { useRouter } from "next/navigation"
import { useAuth } from "../context"
import { getSession, signOut } from "next-auth/react"
import { User } from "../types/User"
import { toast } from "sonner"
import api from "../services/api"

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { setUser, setToken } = useAuth()
  const router = useRouter()
  const [isValidating, setIsValidating] = useState(true)

  useEffect(() => {
    const validateSession = async () => {
      try {
        const data = await getSession()

        if (!data || !data.user) {
          await signOut({ redirect: false })
          router.push("/signin")
          return
        }

        const sessionToken = (data as unknown as { token?: string })?.token

        if (!sessionToken) {
          toast.error("Token inválido. Faça login novamente.")
          await signOut({ redirect: false })
          router.push("/signin")
          return
        }

        // VALIDAÇÃO REAL COM O BACKEND
        try {
          // Tentar buscar tipos de veículos passando o token diretamente
          await api.getAllVehicleType(sessionToken)

          // Se chegou aqui sem erro 401, o token é válido
          setUser(data.user as unknown as User)
          setToken(sessionToken)
          setIsValidating(false)

        } catch (apiError: any) {
          // Erro na API - verificar se é 401 (não autorizado)
          const status = apiError?.response?.status || apiError?.status

          if (status === 401) {
            toast.error("Sua sessão expirou. Faça login novamente.")
            await signOut({ redirect: false })
            router.push("/signin")
            return
          }

          // Se não for 401, o token provavelmente é válido
          // (pode ser erro de rede, 500, etc)
          setUser(data.user as unknown as User)
          setToken(sessionToken)
          setIsValidating(false)
        }
      } catch (error) {
        toast.error("Erro de autenticação. Redirecionando...")
        await signOut({ redirect: false })
        router.push("/signin")
      }
    }

    validateSession()
  }, [router, setUser, setToken])

  // Mostrar loading enquanto valida
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <SidebarProvider>
        <SideBar />
        {children}
      </SidebarProvider>
    </div>
  )
}
