import { NextResponse } from "next/server"
import { headers } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3000"

export async function GET() {
  try {
    const headersList = await headers()
    const authorization = headersList.get("authorization")

    // Fazer proxy para o backend real
    const response = await fetch(`${API_URL}/notifications/unread-count`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        // Retornar zero quando não há notificações
        return NextResponse.json({
          unreadCount: 0,
          pendingCount: 0,
        })
      }

      const error = await response.text()
      return NextResponse.json(
        { error: error || "Erro ao buscar contador de notificações" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Erro ao buscar contador de notificações:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar contador" },
      { status: 500 }
    )
  }
}
