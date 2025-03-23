"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { Skeleton } from "@/components/ui/skeleton"

interface FormData {
  name: string
  category: string
  quantity: string
  unit: string
  price: string
  supplier: string
  godown: string
  bagCount: string
}

interface Supplier {
  _id: string
  name: string
}

interface Godown {
  _id: string
  name: string
}

/**
 * New Item Page
 * Form for adding a new inventory item with all required fields
 */
export default function NewItemPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: "",
    category: "",
    quantity: "",
    unit: "kg",
    price: "",
    supplier: "",
    godown: "",
    bagCount: "",
  })

  const [loading, setLoading] = useState(false)
  const [suppliers] = useState<Supplier[]>([
    { _id: "supplier-1", name: "Supplier 1" },
    { _id: "supplier-2", name: "Supplier 2" },
  ])
  const [godowns] = useState<Godown[]>([
    { _id: "godown-1", name: "Godown 1" },
    { _id: "godown-2", name: "Godown 2" },
  ])

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle select input changes
  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to add item")
      }

      toast.success("Item added successfully")
      router.push("/inventory")
    } catch (error: unknown) {
      console.error("Error adding item:", error)
      if (error instanceof Error) {
        toast.error(error.message || "Failed to add the item. Please try again.")
      } else {
        toast.error("Failed to add the item. Please try again.")
      }
      setLoading(false)
    }
  }

  return (
    <main className="container px-4 py-6 mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/inventory">
            <ArrowLeft className="w-4 h-4" />
            <span className="sr-only">Back to inventory</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Add New Item</h1>
      </div>

      <Card className="max-w-2xl mx-auto bg-card">
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
          <CardDescription>Enter the details of the new inventory item</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter item name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                name="category"
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
                required
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="potatoes">Potatoes</SelectItem>
                  <SelectItem value="tomatoes">Tomatoes</SelectItem>
                  <SelectItem value="other">Other Vegetables</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quantity and Unit */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  name="unit"
                  value={formData.unit}
                  onValueChange={(value) => handleSelectChange("unit", value)}
                  required
                >
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="g">Grams (g)</SelectItem>
                    <SelectItem value="lb">Pounds (lb)</SelectItem>
                    <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price per Unit (₹)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter price per unit"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            {/* Bag Count */}
            <div className="space-y-2">
              <Label htmlFor="bagCount">Bag Count</Label>
              <Input
                id="bagCount"
                name="bagCount"
                type="number"
                min="0"
                step="1"
                placeholder="Enter number of bags"
                value={formData.bagCount}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">Optional: Number of bags or containers</p>
            </div>

            {/* Supplier */}
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select
                name="supplier"
                value={formData.supplier}
                onValueChange={(value) => handleSelectChange("supplier", value)}
              >
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.length === 0 ? (
                    <SelectItem value="no-suppliers" disabled>
                      No suppliers found
                    </SelectItem>
                  ) : (
                    <>
                      <SelectItem value="none">None</SelectItem>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier._id} value={supplier._id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Storage Location (Godown) */}
            <div className="space-y-2">
              <Label htmlFor="godown">Storage Location</Label>
              <Select
                name="godown"
                value={formData.godown}
                onValueChange={(value) => handleSelectChange("godown", value)}
              >
                <SelectTrigger id="godown">
                  <SelectValue placeholder="Select storage location" />
                </SelectTrigger>
                <SelectContent>
                  {godowns.length === 0 ? (
                    <SelectItem value="no-godowns" disabled>
                      No storage locations found
                    </SelectItem>
                  ) : (
                    <>
                      <SelectItem value="none">None</SelectItem>
                      {godowns.map((godown) => (
                        <SelectItem key={godown._id} value={godown._id}>
                          {godown.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href="/inventory">Cancel</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Item"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}

