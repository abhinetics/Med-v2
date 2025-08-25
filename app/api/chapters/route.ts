// import { type NextRequest, NextResponse } from "next/server"
// import { createChapter, getChaptersByDepartment, updateChapter, deleteChapter } from "@/lib/db-utils"

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const department = searchParams.get("department")

//     if (!department) {
//       return NextResponse.json({ error: "Department is required" }, { status: 400 })
//     }

//     const chapters = await getChaptersByDepartment(department)
//     return NextResponse.json(chapters)
//   } catch (error) {
//     console.error("Error fetching chapters:", error)
//     return NextResponse.json({ error: "Failed to fetch chapters" }, { status: 500 })
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const chapterData = await request.json()
//     const result = await createChapter(chapterData)
//     return NextResponse.json({ success: true, id: result.insertedId })
//   } catch (error) {
//     console.error("Error creating chapter:", error)
//     return NextResponse.json({ error: "Failed to create chapter" }, { status: 500 })
//   }
// }

// export async function PUT(request: NextRequest) {
//   try {
//     const { id, ...updateData } = await request.json()
//     await updateChapter(id, updateData)
//     return NextResponse.json({ success: true })
//   } catch (error) {
//     console.error("Error updating chapter:", error)
//     return NextResponse.json({ error: "Failed to update chapter" }, { status: 500 })
//   }
// }

// export async function DELETE(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const id = searchParams.get("id")

//     if (!id) {
//       return NextResponse.json({ error: "Chapter ID is required" }, { status: 400 })
//     }

//     await deleteChapter(id)
//     return NextResponse.json({ success: true })
//   } catch (error) {
//     console.error("Error deleting chapter:", error)
//     return NextResponse.json({ error: "Failed to delete chapter" }, { status: 500 })
//   }
// }


// app/api/chapters/route.ts
import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDatabase } from "@/lib/db-utils"

// ✅ GET all chapters (by department)
export async function GET(req: NextRequest) {
  try {
    const db = await getDatabase()
    const department = req.nextUrl.searchParams.get("department")

    const query: any = department ? { department } : {}
    const chapters = await db.collection("chapters").find(query).toArray()

    // normalize _id → id
    const formatted = chapters.map((ch: any) => ({
      ...ch,
      id: ch._id.toString(),
      _id: undefined,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Error fetching chapters:", error)
    return NextResponse.json({ error: "Failed to fetch chapters" }, { status: 500 })
  }
}

// ✅ POST create chapter
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const db = await getDatabase()

    const result = await db.collection("chapters").insertOne({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({ success: true, id: result.insertedId.toString() })
  } catch (error) {
    console.error("Error creating chapter:", error)
    return NextResponse.json({ error: "Failed to create chapter" }, { status: 500 })
  }
}

// ✅ PUT update chapter
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updateData } = body
    if (!id) {
      return NextResponse.json({ error: "Chapter id is required" }, { status: 400 })
    }

    const db = await getDatabase()
    await db.collection("chapters").updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating chapter:", error)
    return NextResponse.json({ error: "Failed to update chapter" }, { status: 500 })
  }
}

// ✅ DELETE chapter
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "Chapter id is required" }, { status: 400 })
    }

    const db = await getDatabase()
    await db.collection("chapters").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting chapter:", error)
    return NextResponse.json({ error: "Failed to delete chapter" }, { status: 500 })
  }
}
