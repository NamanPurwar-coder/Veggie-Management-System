"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function InventorySummary() {
  const [inventory, setInventory] = useState({
    potatoes: [],
    tomatoes: [],
    other: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInventory() {
      try {
        const res = await fetch("/api/inventory")
        const data = await res.json()

        // Group items by category
        const grouped = {
          potatoes: data.inventory.filter((item) => item.category === "potatoes"),
          tomatoes: data.inventory.filter((item) => item.category === "tomatoes"),
          other: data.inventory.filter((item) => item.category === "other"),
        }

        setInventory(grouped)
      } catch (error) {
        console.error("Failed to fetch inventory:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInventory()
  }, [])

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Inventory Summary</CardTitle>
        <CardDescription>Quick overview of your vegetable inventory</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="potatoes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="potatoes">Potatoes</TabsTrigger>
            <TabsTrigger value="tomatoes">Tomatoes</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <>
              <TabsContent value="potatoes" className="space-y-4">
                {inventory.potatoes.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No potato items found</p>
                ) : (
                  inventory.potatoes.map((item) => (
                    <div key={item._id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            {item.quantity} {item.unit}
                          </span>
                          <span>•</span>
                          <span>
                            ₹{item.price?.toFixed(2)}/{item.unit}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.quantity < 30 ? "destructive" : "secondary"}>
                          {item.quantity < 30 ? "Low" : "In Stock"}
                        </Badge>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/inventory/${item._id}`}>
                            <Edit className="w-4 h-4" />
                            <span className="sr-only">Edit {item.name}</span>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="tomatoes" className="space-y-4">
                {inventory.tomatoes.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No tomato items found</p>
                ) : (
                  inventory.tomatoes.map((item) => (
                    <div key={item._id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            {item.quantity} {item.unit}
                          </span>
                          <span>•</span>
                          <span>
                            ₹{item.price?.toFixed(2)}/{item.unit}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.quantity < 30 ? "destructive" : "secondary"}>
                          {item.quantity < 30 ? "Low" : "In Stock"}
                        </Badge>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/inventory/${item._id}`}>
                            <Edit className="w-4 h-4" />
                            <span className="sr-only">Edit {item.name}</span>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="other" className="space-y-4">
                {inventory.other.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No other vegetable items found</p>
                ) : (
                  inventory.other.map((item) => (
                    <div key={item._id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            {item.quantity} {item.unit}
                          </span>
                          <span>•</span>
                          <span>
                            ₹{item.price?.toFixed(2)}/{item.unit}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.quantity < 30 ? "destructive" : "secondary"}>
                          {item.quantity < 30 ? "Low" : "In Stock"}
                        </Badge>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/inventory/${item._id}`}>
                            <Edit className="w-4 h-4" />
                            <span className="sr-only">Edit {item.name}</span>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </>
          )}

          <div className="mt-4">
            <Button asChild className="w-full bg-primary hover:bg-primary/90">
              <Link href="/inventory/new">
                <Plus className="w-4 h-4 mr-2" />
                Add New Item
              </Link>
            </Button>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}

