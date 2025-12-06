import { NextResponse } from "next/server"
import { updateNotification } from "../../data"

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = parseInt(params.id)
    const updated = updateNotification(id, {
        isRead: true,
        readAt: new Date().toISOString()
    })

    if (!updated) {
        return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json({
        message: "Notificação marcada como lida",
        notification: updated
    })
}
