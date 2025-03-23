/**
 * API Route: /api/transactions
 * Handles operations for inventory transactions (purchases and sales)
 */
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

/**
 * GET: Fetch transactions
 * Optional query parameters:
 * - itemId: Filter by specific item
 * - startDate/endDate: Filter by date range
 * - type: Filter by transaction type (purchase/sale)
 */
export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("itemId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const type = searchParams.get("type")

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

    if (type && (type === "purchase" || type === "sale")) {
      query.type = type
    }

    // Fetch transactions
    const transactions = await db.collection("transactions").find(query).sort({ date: -1 }).toArray()

    return NextResponse.json({ transactions }, { status: 200 })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST: Add a new transaction (purchase or sale)
 * Required fields: itemId, type, quantity, price
 */
export async function POST(request) {
  try {
    // Parse request body
    const data = await request.json()

    // Validate required fields
    if (!data.itemId || !data.type || !data.quantity || !data.price) {
      return NextResponse.json(
        {
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    // Validate transaction type
    if (data.type !== "purchase" && data.type !== "sale") {
      return NextResponse.json(
        {
          error: "Transaction type must be 'purchase' or 'sale'",
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
    if (data.quantity) data.quantity = Number.parseFloat(data.quantity)
    if (data.price) data.price = Number.parseFloat(data.price)

    // Calculate total amount
    data.totalAmount = data.quantity * data.price

    // For sales, check if there's enough inventory
    if (data.type === "sale") {
      const item = await db.collection("items").findOne({
        _id: new ObjectId(data.itemId),
      })

      if (!item) {
        return NextResponse.json(
          {
            error: "Item not found",
          },
          { status: 404 },
        )
      }

      if (item.quantity < data.quantity) {
        return NextResponse.json(
          {
            error: "Not enough inventory for this sale",
          },
          { status: 400 },
        )
      }
    }

    // Insert transaction
    const result = await db.collection("transactions").insertOne(data)

    // Update inventory quantity
    const quantityChange = data.type === "purchase" ? data.quantity : -data.quantity

    await db.collection("items").updateOne(
      { _id: new ObjectId(data.itemId) },
      {
        $inc: { quantity: quantityChange },
        $set: { lastUpdated: data.date },
      },
    )

    return NextResponse.json(
      {
        success: true,
        id: result.insertedId,
        transaction: data,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error adding transaction:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

