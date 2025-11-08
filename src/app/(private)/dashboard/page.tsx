"use client"

import { useAuth } from "@/app/context"
import { signOut } from "next-auth/react"
import { useEffect } from "react"

export default function Dashboard() {
  const { user, token } = useAuth()

  // useEffect(() => {
  //   if (!token) {
  //     signOut({
  //       callbackUrl: "/signin",
  //     })
  //   } else {
  //     console.log("Tem token valido", token)
  //   }
  // }, [token])

  console.log(token)

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bem-vindo, {user?.email}</p>
    </div>
  )
}
