/**
 * API Route: /api/inventory/[id]
 * Handles operations for a specific inventory item
 */
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

/**
 * GET: Fetch a specific inventory item by ID
 */
export async function GET(request, { params }) {
  try {
    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("inventory")

    // Validate ObjectId
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 })
    }

    // Find the item by ID
    const item = await db.collection("items").findOne({
      _id: new ObjectId(params.id),
    })

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json({ item }, { status: 200 })
  } catch (error) {
    console.error("Error fetching item:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PUT: Update an inventory item
 */
export async function PUT(request, { params }) {
  try {
    // Parse request body
    const data = await request.json()

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("inventory")

    // Validate ObjectId
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 })
    }

    // Update lastUpdated date
    data.lastUpdated = new Date().toISOString().split("T")[0]

    // Convert string values to numbers
    if (data.quantity) data.quantity = Number.parseFloat(data.quantity)
    if (data.price) data.price = Number.parseFloat(data.price)
    if (data.bagCount) data.bagCount = Number.parseFloat(data.bagCount)

    // Update the item
    const result = await db.collection("items").updateOne({ _id: new ObjectId(params.id) }, { $set: data })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        success: true,
        item: data,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error updating item:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE: Remove an inventory item
 */
export async function DELETE(request, { params }) {
  try {
    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("inventory")

    // Validate ObjectId
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 })
    }

    // Delete the item
    const result = await db.collection("items").deleteOne({
      _id: new ObjectId(params.id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Also delete related transactions and expenses
    await db.collection("transactions").deleteMany({ itemId: params.id })
    await db.collection("expenses").deleteMany({ itemId: params.id })

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error deleting item:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

