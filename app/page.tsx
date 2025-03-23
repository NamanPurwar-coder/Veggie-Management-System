"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Package, ShoppingCart } from "lucide-react"
import InventorySummary from "@/components/inventory-summary"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/reports")
        const data = await res.json()

        setStats({
          totalItems: data.items.length,
          totalValue: data.summary.totalValue,
          lowStock: data.items.filter((item) => item.quantity < 30).length,
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <main className="container px-4 py-6 mx-auto space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Vegetable Inventory</h1>
        <p className="text-muted-foreground">Manage your vegetable inventory with ease</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalItems || 0}</div>
                <p className="text-xs text-muted-foreground">Vegetable varieties in stock</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.lowStock || 0}</div>
                <p className="text-xs text-muted-foreground">Items below threshold</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">₹{stats?.totalValue?.toFixed(2) || "0.00"}</div>
                <p className="text-xs text-muted-foreground">Current inventory value</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <InventorySummary />

      <div className="flex justify-center">
        <Button asChild className="w-full md:w-auto">
          <Link href="/inventory">View All Inventory</Link>
        </Button>
      </div>
    </main>
  )
}

