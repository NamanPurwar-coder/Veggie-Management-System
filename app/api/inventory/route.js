/**
 * API Route: /api/inventory
 * Handles CRUD operations for inventory items
 */
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

/**
 * GET: Fetch all inventory items
 * Optional query parameters:
 * - category: Filter by category
 * - search: Search by name
 */
export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("inventory")

    // Build query based on parameters
    const query = {}
    if (category && category !== "all") {
      query.category = category
    }
    if (search) {
      query.name = { $regex: search, $options: "i" } // Case-insensitive search
    }

    // Fetch inventory items
    const inventory = await db.collection("items").find(query).toArray()

    return NextResponse.json({ inventory }, { status: 200 })
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST: Add a new inventory item
 * Required fields: name, category, quantity, unit, price
 * Optional fields: supplier, godown, bagCount
 */
export async function POST(request) {
  try {
    // Parse request body
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.category || !data.quantity || !data.unit || !data.price) {
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

    // Add current date for lastUpdated
    data.lastUpdated = new Date().toISOString().split("T")[0]

    // Convert string values to numbers
    if (data.quantity) data.quantity = Number.parseFloat(data.quantity)
    if (data.price) data.price = Number.parseFloat(data.price)
    if (data.bagCount) data.bagCount = Number.parseFloat(data.bagCount)

    // Insert new item
    const result = await db.collection("items").insertOne(data)

    return NextResponse.json(
      {
        success: true,
        id: result.insertedId,
        item: data,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error adding inventory item:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

