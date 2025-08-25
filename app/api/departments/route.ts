import { type NextRequest, NextResponse } from "next/server"
import { createDepartment, getAllDepartments } from "@/lib/db-utils"

export async function GET() {
  try {
    const departments = await getAllDepartments()
    return NextResponse.json(departments)
  } catch (error) {
    console.error("Error fetching departments:", error)
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  
  try {
    const { name } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Department name is required" }, { status: 400 })
    }

    const result = await createDepartment({ name: name.trim() })
    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("Error creating department:", error)
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 })
  }
}
