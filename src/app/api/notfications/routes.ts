import { NextResponse } from "next/server"

let notifications = [
  { id: 1, title: "Entrega concluída", read: false },
  { id: 2, title: "Novo pedido recebido", read: false },
  { id: 3, title: "Pagamento aprovado", read: true },
]

export async function GET() {
  return NextResponse.json(notifications)
}
