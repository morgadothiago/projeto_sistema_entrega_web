"use client"

import { useAuth } from "@/app/context"
import { signOut } from "next-auth/react"
import { useEffect } from "react"

export default function DeliveryListPage() {
  const { token, loading } = useAuth()

  useEffect(() => {
    if (!loading && !token) {
      signOut({ redirect: true, callbackUrl: "/signin" })
      return
    }
  }, [token, loading])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold">Hello World - Lista de Entregas</h1>
    </div>
  )
}
