"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus } from "lucide-react"
import InventoryList from "@/components/inventory-list"

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [loading, setLoading] = useState(true)

  return (
    <main className="container px-4 py-6 mx-auto space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="w-4 h-4" />
            <span className="sr-only">Back to dashboard</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
      </div>

      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Inventory Items</CardTitle>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/inventory/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4 md:flex-row">
            <Input
              placeholder="Search items..."
              className="md:w-1/3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select defaultValue="all" value={category} onValueChange={setCategory}>
              <SelectTrigger className="md:w-1/4">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="potatoes">Potatoes</SelectItem>
                <SelectItem value="tomatoes">Tomatoes</SelectItem>
                <SelectItem value="other">Other Vegetables</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="name" value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="md:w-1/4">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="quantity-high">Quantity (High-Low)</SelectItem>
                <SelectItem value="quantity-low">Quantity (Low-High)</SelectItem>
                <SelectItem value="price-high">Price (High-Low)</SelectItem>
                <SelectItem value="price-low">Price (Low-High)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <InventoryList searchTerm={searchTerm} category={category} sortBy={sortBy} />
        </CardContent>
      </Card>
    </main>
  )
}

