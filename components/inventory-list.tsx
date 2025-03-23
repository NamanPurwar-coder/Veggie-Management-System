"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, ShoppingCart, Package } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"
import { InventoryItem } from "@/types"

interface InventoryListProps {
  searchTerm?: string;
  category?: string;
  sortBy?: string;
}

export default function InventoryList({ searchTerm = "", category = "all", sortBy = "name" }: InventoryListProps) {
  const router = useRouter()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [transactionItem, setTransactionItem] = useState<InventoryItem | null>(null)
  const [transactionType, setTransactionType] = useState<"purchase" | "sale">("purchase")
  const [transactionData, setTransactionData] = useState({
    quantity: "",
    price: "",
  })
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)

  useEffect(() => {
    fetchInventory()
  }, [])

  async function fetchInventory() {
    try {
      setLoading(true)
      const res = await fetch("/api/inventory")
      const data = await res.json()
      setInventory(data.inventory || [])
    } catch (error) {
      console.error("Failed to fetch inventory:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        const res = await fetch(`/api/inventory/${id}`, {
          method: "DELETE",
        })

        if (res.ok) {
          setInventory(inventory.filter((item) => item._id !== id))
          toast.success("Item deleted successfully")
        } else {
          throw new Error("Failed to delete item")
        }
      } catch (error) {
        console.error("Error deleting item:", error)
        toast.error("Failed to delete the item. Please try again.")
      }
    }
  }

  const openTransactionDialog = (item: InventoryItem, type: "purchase" | "sale") => {
    setTransactionItem(item)
    setTransactionType(type)
    setTransactionData({
      quantity: "",
      price: type === "purchase" ? item.price?.toString() || "" : "",
    })
    setIsTransactionDialogOpen(true)
  }

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!transactionItem || !transactionType) return

    try {
      const quantity = Number.parseFloat(transactionData.quantity)
      const price = Number.parseFloat(transactionData.price)

      if (isNaN(quantity) || quantity <= 0) {
        throw new Error("Please enter a valid quantity")
      }

      if (isNaN(price) || price <= 0) {
        throw new Error("Please enter a valid price")
      }

      // For sales, check if we have enough inventory
      if (transactionType === "sale" && quantity > transactionItem.quantity) {
        throw new Error("Not enough inventory for this sale")
      }

      const transaction = {
        itemId: transactionItem._id,
        type: transactionType,
        quantity,
        price,
        totalAmount: quantity * price,
        date: new Date().toISOString().split("T")[0],
      }

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction),
      })

      if (!res.ok) {
        throw new Error("Failed to record transaction")
      }

      // Update local inventory
      setInventory(
        inventory.map((item) => {
          if (item._id === transactionItem._id) {
            const newQuantity = transactionType === "purchase" ? item.quantity + quantity : item.quantity - quantity
            return { ...item, quantity: newQuantity }
          }
          return item
        }),
      )

      setIsTransactionDialogOpen(false)
      toast.success(`Successfully recorded ${quantity} ${transactionItem.unit} ${transactionType} of ${transactionItem.name}`)
    } catch (error) {
      console.error("Error recording transaction:", error)
      toast.error(error instanceof Error ? error.message : "Failed to record transaction. Please try again.")
    }
  }

  // Filter and sort inventory
  const filteredInventory = inventory
    .filter((item) => {
      // Filter by search term
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())

      // Filter by category
      const matchesCategory = category === "all" || item.category === category

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      // Sort by selected option
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "quantity-high":
          return b.quantity - a.quantity
        case "quantity-low":
          return a.quantity - b.quantity
        case "price-high":
          return b.price - a.price
        case "price-low":
          return a.price - b.price
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div>
      {/* Mobile view - card layout */}
      <div className="grid gap-4 md:hidden">
        {filteredInventory.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No items found</p>
        ) : (
          filteredInventory.map((item) => (
            <div key={item._id} className="p-4 border rounded-lg bg-card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{item.name}</h3>
                <Badge variant={item.quantity < 30 ? "destructive" : "secondary"}>
                  {item.quantity < 30 ? "Low Stock" : "In Stock"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Category:</p>
                  <p className="capitalize">{item.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Quantity:</p>
                  <p>
                    {item.quantity} {item.unit}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Price:</p>
                  <p>
                    ₹{item.price?.toFixed(2)}/{item.unit}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Updated:</p>
                  <p>{item.lastUpdated}</p>
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => openTransactionDialog(item, "purchase")}>
                  <Package className="w-4 h-4 mr-1" />
                  Buy
                </Button>
                <Button variant="outline" size="sm" onClick={() => openTransactionDialog(item, "sale")}>
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Sell
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/inventory/${item._id}`}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteItem(item._id)}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop view - table layout */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No items found
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="capitalize">{item.category}</TableCell>
                  <TableCell>
                    {item.quantity} {item.unit}
                  </TableCell>
                  <TableCell>
                    ₹{item.price?.toFixed(2)}/{item.unit}
                  </TableCell>
                  <TableCell>{item.lastUpdated}</TableCell>
                  <TableCell>
                    <Badge variant={item.quantity < 30 ? "destructive" : "secondary"}>
                      {item.quantity < 30 ? "Low Stock" : "In Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openTransactionDialog(item, "purchase")}
                        title="Buy"
                      >
                        <Package className="w-4 h-4" />
                        <span className="sr-only">Buy {item.name}</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openTransactionDialog(item, "sale")}
                        title="Sell"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="sr-only">Sell {item.name}</span>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/inventory/${item._id}`}>
                          <Edit className="w-4 h-4" />
                          <span className="sr-only">Edit {item.name}</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteItem(item._id)}>
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Delete {item.name}</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Transaction Dialog */}
      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{transactionType === "purchase" ? "Record Purchase" : "Record Sale"}</DialogTitle>
            <DialogDescription>
              {transactionType === "purchase"
                ? "Add inventory by recording a purchase"
                : "Reduce inventory by recording a sale"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleTransactionSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="item-name">Item</Label>
                <Input id="item-name" value={transactionItem?.name || ""} disabled />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity ({transactionItem?.unit})</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={transactionData.quantity}
                  onChange={(e) => setTransactionData({ ...transactionData, quantity: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="price">Price per {transactionItem?.unit} (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={transactionData.price}
                  onChange={(e) => setTransactionData({ ...transactionData, price: e.target.value })}
                  required
                />
              </div>

              {transactionData.quantity && transactionData.price && (
                <div className="text-right font-medium">
                  Total: ₹
                  {(Number.parseFloat(transactionData.quantity) * Number.parseFloat(transactionData.price)).toFixed(2)}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTransactionDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{transactionType === "purchase" ? "Record Purchase" : "Record Sale"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

