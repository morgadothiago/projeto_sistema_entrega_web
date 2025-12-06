import { NextResponse } from "next/server"
import { updateNotification, notifications } from "../../data"
import { NotificationStatus } from "@/app/types/Notification"

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = parseInt(params.id)
    const notification = notifications.find(n => n.id === id)

    if (!notification) {
        return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    if (notification.status !== NotificationStatus.PENDING) {
        return NextResponse.json({ error: "Notificação já processada" }, { status: 400 })
    }

    const updated = updateNotification(id, {
        status: NotificationStatus.APPROVED,
        isRead: true,
        actionedAt: new Date().toISOString(),
        actionedBy: 1 // Mock admin ID
    })

    return NextResponse.json({
        message: "Notificação aprovada com sucesso",
        notification: updated
    })
}
