"use client"

import { useAuth } from "@/app/context"
import { signOut } from "next-auth/react"
import { useEffect } from "react"

export default function Dashboard() {
  const { user, token, loading } = useAuth()

  useEffect(() => {
    if (!loading && !token) {
      console.log("Dashboard - Sem token, redirecionando...")
      signOut({ callbackUrl: "/signin" })
    }
  }, [token, loading])

  if (loading || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bem-vindo, {user?.email}</p>
    </div>
  )
}
