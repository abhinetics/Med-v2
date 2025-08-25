import { type NextRequest, NextResponse } from "next/server"
import { createNotification, getNotificationsByDepartment } from "@/lib/db-utils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get("department")

    if (!department) {
      return NextResponse.json({ error: "Department is required" }, { status: 400 })
    }

    const notifications = await getNotificationsByDepartment(department)
    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const notificationData = await request.json()
    const result = await createNotification({
      ...notificationData,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
      read: false,
    })
    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}
