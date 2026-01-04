import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"

const API_URL = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3000"

// Schema de validação
const PaymentSlipRequestSchema = z.object({
  billingKey: z.string().optional(),
  message: z.string().max(500).optional(),
})

export async function POST(request: Request) {
  try {
    const headersList = await headers()
    const authorization = headersList.get("authorization")
    const rawBody = await request.json()

    // Validar body
    const validationResult = PaymentSlipRequestSchema.safeParse(rawBody)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const body = validationResult.data

    // Fazer proxy para o backend real
    const response = await fetch(`${API_URL}/notifications/payment-slip-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: error || "Erro ao solicitar boleto de pagamento" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno ao processar requisição" },
      { status: 500 }
    )
  }
}
