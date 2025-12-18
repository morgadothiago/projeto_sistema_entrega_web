import { NextResponse } from "next/server"
import { headers } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3000"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const headersList = await headers()
    const authorization = headersList.get("authorization")

    // Fazer proxy para o backend real
    const response = await fetch(`${API_URL}/notifications/${id}/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: error || "Erro ao aprovar notificação" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Erro ao aprovar notificação:", error)
    return NextResponse.json(
      { error: "Erro interno ao processar requisição" },
      { status: 500 }
    )
  }
}
