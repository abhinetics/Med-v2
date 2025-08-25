import { type NextRequest, NextResponse } from "next/server"
import { findUser, findTrainee } from "@/lib/db-utils"

export async function POST(request: NextRequest) {
  try {
    const { role, username, password, department } = await request.json()

    if (role === "admin") {
      // Check admin credentials from database
      const admin = await findUser({ username, role: "admin" })
      if (!admin || admin.password !== password) {
        return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 })
      }

      return NextResponse.json({
        success: true,
        user: {
          id: admin._id,
          username: admin.username,
          role: "admin",
        },
      })
    }

    if (role === "trainer") {
      // Check trainer credentials from database
      const trainer = await findUser({ username, role: "trainer" })
      if (!trainer || trainer.password !== password) {
        return NextResponse.json({ error: "Invalid trainer credentials" }, { status: 401 })
      }

      return NextResponse.json({
        success: true,
        user: {
          id: trainer._id,
          username: trainer.username,
          name: trainer.name,
          department: trainer.department,
          role: "trainer",
        },
      })
    }

    if (role === "trainee") {
      // Check trainee credentials from database
      const trainee = await findTrainee({ username, password, department })
      if (!trainee) {
        return NextResponse.json({ error: "Invalid trainee credentials" }, { status: 401 })
      }

      return NextResponse.json({
        success: true,
        user: {
          id: trainee._id,
          username: trainee.username,
          fullName: trainee.fullName,
          email: trainee.email,
          department: trainee.department,
          role: "trainee",
        },
      })
    }

    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
