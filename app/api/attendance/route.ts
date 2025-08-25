import { type NextRequest, NextResponse } from "next/server"
import { saveAttendanceRecord, getAttendanceRecords } from "@/lib/db-utils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get("department")

    if (!department) {
      return NextResponse.json({ error: "Department is required" }, { status: 400 })
    }

    const records = await getAttendanceRecords(department)
    return NextResponse.json(records)
  } catch (error) {
    console.error("Error fetching attendance records:", error)
    return NextResponse.json({ error: "Failed to fetch attendance records" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const attendanceData = await request.json()
    const result = await saveAttendanceRecord(attendanceData)
    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("Error saving attendance record:", error)
    return NextResponse.json({ error: "Failed to save attendance record" }, { status: 500 })
  }
}
