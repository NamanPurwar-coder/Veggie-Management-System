/**
 * API Route: /api/settings
 * Handles operations for application settings
 */
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

/**
 * GET: Fetch application settings
 */
export async function GET() {
  try {
    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("inventory")

    // Get settings from database
    const settings = await db.collection("settings").findOne({ type: "appSettings" })

    // If no settings exist, return defaults
    if (!settings) {
      const defaultSettings = {
        type: "appSettings",
        theme: "light",
        lowStockThreshold: 30,
        defaultCurrency: "INR",
        notifications: true,
        reportSettings: {
          companyName: "Vegetable Inventory Management",
          address: "",
          contact: "",
          email: "",
          gstin: "",
        },
      }

      // Insert default settings
      await db.collection("settings").insertOne(defaultSettings)

      return NextResponse.json({ settings: defaultSettings }, { status: 200 })
    }

    return NextResponse.json({ settings }, { status: 200 })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PUT: Update application settings
 */
export async function PUT(request) {
  try {
    // Parse request body
    const data = await request.json()

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("inventory")

    // Ensure type is set
    data.type = "appSettings"

    // Update settings
    const result = await db.collection("settings").updateOne({ type: "appSettings" }, { $set: data }, { upsert: true })

    return NextResponse.json(
      {
        success: true,
        settings: data,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

