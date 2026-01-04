import { NextResponse } from "next/server"
import { headers } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3000"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const headersList = await headers()
    const authorization = headersList.get("authorization")

    // Construir query string com todos os parâmetros
    const queryParams = new URLSearchParams()
    searchParams.forEach((value, key) => {
      queryParams.append(key, value)
    })

    // Fazer proxy para o backend real
    const response = await fetch(`${API_URL}/users?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        // Retornar estrutura vazia quando não há usuários
        return NextResponse.json({
          data: [],
          total: 0,
          currentPage: 1,
          totalPage: 0,
        })
      }

      const error = await response.text()
      return NextResponse.json(
        { error: error || "Erro ao buscar usuários" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno ao buscar usuários" },
      { status: 500 }
    )
  }
}
