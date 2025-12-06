import { NextResponse } from "next/server"
import { notifications } from "../data"
import { NotificationStatus } from "@/app/types/Notification"

export async function GET() {
    const unreadCount = notifications.filter(n => !n.isRead).length
    const pendingCount = notifications.filter(n => n.status === NotificationStatus.PENDING).length

    return NextResponse.json({
        unreadCount,
        pendingCount
    })
}
