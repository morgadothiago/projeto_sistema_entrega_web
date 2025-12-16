import { NextResponse } from "next/server"
import { users } from "./data"
import { ERole, EStatus } from "@/app/types/User"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const role = searchParams.get("role") as ERole | null
    const status = searchParams.get("status") as EStatus | null
    const email = searchParams.get("email")

    let filtered = [...users]

    if (role) {
        filtered = filtered.filter(u => u.role === role)
    }

    if (status) {
        filtered = filtered.filter(u => u.status === status)
    }

    if (email) {
        filtered = filtered.filter(u => u.email.includes(email))
    }

    // Sort by name
    filtered.sort((a, b) => a.name.localeCompare(b.name))

    const total = filtered.length
    const totalPage = Math.ceil(total / limit)
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    return NextResponse.json({
        data: paginated,
        total,
        currentPage: page,
        totalPage
    })
}
