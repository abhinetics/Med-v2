import { type NextRequest, NextResponse } from "next/server"
import { createTrainer, getAllTrainers, deleteTrainer, createUser } from "@/lib/db-utils"

export async function GET() {
  try {
    const trainers = await getAllTrainers()
    return NextResponse.json(trainers)
  } catch (error) {
    console.error("Error fetching trainers:", error)
    return NextResponse.json({ error: "Failed to fetch trainers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, username, department, password } = await request.json()

    if (!name || !username || !department || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Create trainer record
    const trainerResult = await createTrainer({
      name: name.trim(),
      username: username.trim(),
      department,
      password: password.trim(),
      dateAdded: new Date().toLocaleDateString(),
    })

    // Create user record for authentication
    await createUser({
      username: username.trim(),
      password: password.trim(),
      name: name.trim(),
      department,
      role: "trainer",
    })

    return NextResponse.json({ success: true, id: trainerResult.insertedId })
  } catch (error) {
    console.error("Error creating trainer:", error)
    return NextResponse.json({ error: "Failed to create trainer" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Trainer ID is required" }, { status: 400 })
    }

    await deleteTrainer(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting trainer:", error)
    return NextResponse.json({ error: "Failed to delete trainer" }, { status: 500 })
  }
}
