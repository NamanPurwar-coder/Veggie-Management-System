/**
 * API Route: /api/reports
 * Handles generation of inventory reports
 */
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

/**
 * GET: Generate inventory report
 * Query parameters:
 * - startDate/endDate: Date range for the report
 * - category: Filter by category
 * - itemId: Generate report for specific item
 */
export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const category = searchParams.get("category")
    const itemId = searchParams.get("itemId")

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("inventory")

    // If itemId is provided, generate report for specific item
    if (itemId && ObjectId.isValid(itemId)) {
      return await generateItemReport(db, itemId, startDate, endDate)
    }

    // Get inventory items
    const itemsQuery = {}
    if (category && category !== "all") {
      itemsQuery.category = category
    }

    const items = await db.collection("items").find(itemsQuery).toArray()

    // Get transactions
    const transactionsQuery = {}
    if (startDate && endDate) {
      transactionsQuery.date = { $gte: startDate, $lte: endDate }
    }

    const transactions = await db.collection("transactions").find(transactionsQuery).toArray()

    // Get expenses
    const expensesQuery = {}
    if (startDate && endDate) {
      expensesQuery.date = { $gte: startDate, $lte: endDate }
    }

    const expenses = await db.collection("expenses").find(expensesQuery).toArray()

    // Calculate summary
    const summary = {
      totalItems: items.length,
      totalQuantity: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
      totalValue: items.reduce((sum, item) => sum + (item.quantity || 0) * (item.price || 0), 0),
      totalPurchases: transactions
        .filter((t) => t.type === "purchase")
        .reduce((sum, t) => sum + (t.totalAmount || 0), 0),
      totalSales: transactions.filter((t) => t.type === "sale").reduce((sum, t) => sum + (t.totalAmount || 0), 0),
      totalExpenses: expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
      profit:
        transactions.filter((t) => t.type === "sale").reduce((sum, t) => sum + (t.totalAmount || 0), 0) -
        transactions.filter((t) => t.type === "purchase").reduce((sum, t) => sum + (t.totalAmount || 0), 0) -
        expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    }

    return NextResponse.json(
      {
        items,
        transactions,
        expenses,
        summary,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * Generate a report for a specific inventory item
 * @param {Object} db - MongoDB database connection
 * @param {String} itemId - ID of the item to generate report for
 * @param {String} startDate - Start date for the report
 * @param {String} endDate - End date for the report
 * @returns {NextResponse} - JSON response with item report data
 */
async function generateItemReport(db, itemId, startDate, endDate) {
  // Get the item
  const item = await db.collection("items").findOne({ _id: new ObjectId(itemId) })

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 })
  }

  // Get transactions for this item
  const transactionsQuery = { itemId: itemId }
  if (startDate && endDate) {
    transactionsQuery.date = { $gte: startDate, $lte: endDate }
  }

  const transactions = await db.collection("transactions").find(transactionsQuery).sort({ date: -1 }).toArray()

  // Get expenses for this item
  const expensesQuery = { itemId: itemId }
  if (startDate && endDate) {
    expensesQuery.date = { $gte: startDate, $lte: endDate }
  }

  const expenses = await db.collection("expenses").find(expensesQuery).sort({ date: -1 }).toArray()

  // Calculate summary
  const totalPurchases = transactions
    .filter((t) => t.type === "purchase")
    .reduce((sum, t) => sum + (t.totalAmount || 0), 0)

  const totalSales = transactions.filter((t) => t.type === "sale").reduce((sum, t) => sum + (t.totalAmount || 0), 0)

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

  const summary = {
    totalQuantity: item.quantity,
    totalValue: item.quantity * item.price,
    totalPurchases,
    totalSales,
    totalExpenses,
    profit: totalSales - totalPurchases - totalExpenses,
  }

  return NextResponse.json(
    {
      item,
      transactions,
      expenses,
      summary,
    },
    { status: 200 },
  )
}

