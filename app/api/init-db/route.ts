import { type NextRequest, NextResponse } from "next/server"
import { createUser, createDepartment, getAllDepartments, findUser } from "@/lib/db-utils"

export async function POST(request: NextRequest) {
  try {
    // Check if admin user already exists
    const existingAdmin = await findUser({ username: "admin" })
    
    // Only create admin if it doesn't exist
    if (!existingAdmin) {
      await createUser({
        username: "admin",
        password: "admin123",
        role: "admin",
        name: "System Administrator",
      })
    }

    // Check if departments already exist
    const existingDepartments = await getAllDepartments()
    
    // Only create departments if none exist
    if (existingDepartments.length === 0) {
      const defaultDepartments = ["Department 1", "Department 2", "Department 3"]
      for (const dept of defaultDepartments) {
        await createDepartment({ name: dept })
      }
    }

    return NextResponse.json({ success: true, message: "Database initialized successfully" })
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
  }
}
