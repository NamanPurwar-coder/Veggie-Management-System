/**
 * API Route: /api/suppliers
 * Handles operations for suppliers
 */
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

/**
 * GET: Fetch all suppliers
 */
export async function GET() {
  try {
    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("inventory")

    // Fetch suppliers
    const suppliers = await db.collection("suppliers").find({}).toArray()

    return NextResponse.json({ suppliers }, { status: 200 })
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST: Add a new supplier
 * Required fields: name
 * Optional fields: contact, address, email
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

    // Insert new supplier
    const result = await db.collection("suppliers").insertOne(data)

    return NextResponse.json(
      {
        success: true,
        id: result.insertedId,
        supplier: data,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error adding supplier:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

