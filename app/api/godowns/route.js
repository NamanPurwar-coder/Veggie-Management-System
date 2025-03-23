/**
 * API Route: /api/godowns
 * Handles operations for storage locations (godowns)
 */
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

/**
 * GET: Fetch all godowns (storage locations)
 */
export async function GET() {
  try {
    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("inventory")

    // Fetch godowns
    const godowns = await db.collection("godowns").find({}).toArray()

    return NextResponse.json({ godowns }, { status: 200 })
  } catch (error) {
    console.error("Error fetching godowns:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST: Add a new godown (storage location)
 * Required fields: name
 * Optional fields: address, capacity
 */
export async function POST(request) {
  try {
    // Parse request body
    const data = await request.json()

    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        {
          error: "Missing required field: name",
        },
        { status: 400 },
      )
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("inventory")

    // Insert new godown
    const result = await db.collection("godowns").insertOne(data)

    return NextResponse.json(
      {
        success: true,
        id: result.insertedId,
        godown: data,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error adding godown:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

