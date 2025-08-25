import { type NextRequest, NextResponse } from "next/server"
import { createTrainee, getAllTrainees } from "@/lib/db-utils"

export async function GET() {
  try {
    const trainees = await getAllTrainees()
    return NextResponse.json(trainees)
  } catch (error) {
    console.error("Error fetching trainees:", error)
    return NextResponse.json({ error: "Failed to fetch trainees" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fullName, username, email, password, department } = await request.json()

    if (!fullName || !username || !email || !password || !department) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const result = await createTrainee({
      fullName: fullName.trim(),
      username: username.trim(),
      email: email.trim(),
      password: password.trim(),
      department,
      signupDate: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("Error creating trainee:", error)
    return NextResponse.json({ error: "Failed to create trainee" }, { status: 500 })
  }
}
