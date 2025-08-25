import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/db-utils"

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase()

    // Clear all collections except users (to keep admin)
    await db.collection("trainers").deleteMany({})
    await db.collection("trainees").deleteMany({})
    await db.collection("chapters").deleteMany({})
    await db.collection("notifications").deleteMany({})
    await db.collection("meetings").deleteMany({})
    await db.collection("traineeProgress").deleteMany({})
    await db.collection("attendance").deleteMany({})

    // Reset departments to default
    await db.collection("departments").deleteMany({})
    const defaultDepartments = ["Department 1", "Department 2", "Department 3"]
    for (const dept of defaultDepartments) {
      await db.collection("departments").insertOne({
        name: dept,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    return NextResponse.json({ success: true, message: "LMS reset successfully" })
  } catch (error) {
    console.error("Error resetting LMS:", error)
    return NextResponse.json({ error: "Failed to reset LMS" }, { status: 500 })
  }
}
