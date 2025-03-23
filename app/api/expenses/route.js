/**
 * API Route: /api/expenses
 * Handles operations for additional expenses related to inventory items
 */
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

/**
 * GET: Fetch expenses
 * Optional query parameters:
 * - itemId: Filter by specific item
 * - startDate/endDate: Filter by date range
 */
export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("itemId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("inventory")

    // Build query based on parameters
    const query = {}

    if (itemId) {
      query.itemId = itemId
    }

    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = startDate
      if (endDate) query.date.$lte = endDate
    }

    // Fetch expenses
    const expenses = await db.collection("expenses").find(query).sort({ date: -1 }).toArray()

    return NextResponse.json({ expenses }, { status: 200 })
  } catch (error) {
    console.error("Error fetching expenses:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST: Add a new expense
 * Required fields: itemId, description, amount
 */
export async function POST(request) {
  try {
    // Parse request body
    const data = await request.json()

    // Validate required fields
    if (!data.itemId || !data.description || !data.amount) {
      return NextResponse.json(
        {
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("inventory")

    // Add current date if not provided
    if (!data.date) {
      data.date = new Date().toISOString().split("T")[0]
    }

    // Convert string values to numbers
    if (data.amount) data.amount = Number.parseFloat(data.amount)

    // Insert expense
    const result = await db.collection("expenses").insertOne(data)

    return NextResponse.json(
      {
        success: true,
        id: result.insertedId,
        expense: data,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error adding expense:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

