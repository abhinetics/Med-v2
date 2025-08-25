import { type NextRequest, NextResponse } from "next/server"
import { saveTraineeProgress, getTraineeProgress } from "@/lib/db-utils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const traineeId = searchParams.get("traineeId")
    const department = searchParams.get("department")

    if (!traineeId || !department) {
      return NextResponse.json({ error: "Trainee ID and department are required" }, { status: 400 })
    }

    const progress = await getTraineeProgress(traineeId, department)
    return NextResponse.json(progress || {})
  } catch (error) {
    console.error("Error fetching progress:", error)
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const progressData = await request.json()
    await saveTraineeProgress(progressData)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving progress:", error)
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 })
  }
}
