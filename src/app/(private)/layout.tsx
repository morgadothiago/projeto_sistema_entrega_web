"use client"
import React, { ReactNode, useEffect } from "react"

import { SidebarProvider } from "@/components/ui/sidebar"
import { SideBar } from "../components/MenuSheet"
import { redirect } from "next/navigation"
import { useAuth } from "../context"
import { getSession } from "next-auth/react"
import { User } from "../types/User"
import { toast } from "sonner"

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { setUser, setToken } = useAuth()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const data = await getSession()

        if (data) {
          setUser(data.user as unknown as User)
          const sessionToken = (data as unknown as { token: string }).token
          if (sessionToken) {
            setToken(sessionToken)
          }
        } else {
          redirect("/signin")
        }
      } catch (error) {
        redirect("/signin")
      }
    }

    // Verificar sessão apenas uma vez ao montar
    checkSession()

    return () => {}
  }, [])

  return (
    <div>
      <SidebarProvider>
        <SideBar />

        {children}
      </SidebarProvider>
    </div>
  )
}
