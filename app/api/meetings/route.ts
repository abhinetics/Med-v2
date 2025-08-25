import { type NextRequest, NextResponse } from "next/server"
import { createMeeting, getMeetingsByDepartment, updateMeeting } from "@/lib/db-utils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get("department")

    if (!department) {
      return NextResponse.json({ error: "Department is required" }, { status: 400 })
    }

    const meetings = await getMeetingsByDepartment(department)
    return NextResponse.json(meetings)
  } catch (error) {
    console.error("Error fetching meetings:", error)
    return NextResponse.json({ error: "Failed to fetch meetings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const meetingData = await request.json()
    const result = await createMeeting(meetingData)
    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("Error creating meeting:", error)
    return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json()
    await updateMeeting(id, updateData)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating meeting:", error)
    return NextResponse.json({ error: "Failed to update meeting" }, { status: 500 })
  }
}
