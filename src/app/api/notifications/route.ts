import { NextResponse } from "next/server"
import { notifications } from "./data"
import { NotificationType, NotificationStatus } from "@/app/types/Notification"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const type = searchParams.get("type") as NotificationType | null
  const status = searchParams.get("status") as NotificationStatus | null
  const isRead = searchParams.get("isRead")

  let filtered = [...notifications]

  if (type) {
    filtered = filtered.filter(n => n.type === type)
  }

  if (status) {
    filtered = filtered.filter(n => n.status === status)
  }

  if (isRead !== null) {
    const isReadBool = isRead === "true"
    filtered = filtered.filter(n => n.isRead === isReadBool)
  }

  // Sort by date desc
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const total = filtered.length
  const totalPages = Math.ceil(total / limit)
  const start = (page - 1) * limit
  const paginated = filtered.slice(start, start + limit)

  const unreadCount = notifications.filter(n => !n.isRead).length
  const pendingCount = notifications.filter(n => n.status === NotificationStatus.PENDING).length

  return NextResponse.json({
    data: paginated,
    total,
    currentPage: page,
    totalPages,
    unreadCount,
    pendingCount
  })
}
