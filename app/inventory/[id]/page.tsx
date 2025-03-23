"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Clock, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { generateVegetablePDF } from "@/lib/pdf-generator"

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

interface Transaction {
  _id: string
  type: string
  quantity: number
  price: number
  totalAmount: number
  date: string
  description: string
}

interface Expense {
  _id: string
  description: string
  amount: number
  date: string
}

interface ReportSettings {
  companyName: string
  address: string
  contact: string
}

/**
 * Edit Item Page
 * Allows editing an existing inventory item and viewing its transaction/expense history
 */
export default function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const itemId = resolvedParams.id

  const [formData, setFormData] = useState<FormData>({
    name: "",
    category: "",
    quantity: "",
    unit: "",
    price: "",
    supplier: "",
    godown: "",
    bagCount: "",
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [expenseData, setExpenseData] = useState({
    description: "",
    amount: "",
  })
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [suppliers] = useState<Supplier[]>([
    { _id: "supplier-1", name: "Supplier 1" },
    { _id: "supplier-2", name: "Supplier 2" },
  ])
  const [godowns] = useState<Godown[]>([
    { _id: "godown-1", name: "Godown 1" },
    { _id: "godown-2", name: "Godown 2" },
  ])
  const [reportSettings, setReportSettings] = useState<ReportSettings>({
    companyName: "Vegetable Inventory Management",
    address: "",
    contact: "",
  })

  // Fetch item data and history on component mount
  useEffect(() => {
    fetchItemData()
    fetchItemHistory()
    fetchReportSettings()
  }, [itemId])

  // Fetch item data from API
  async function fetchItemData() {
    try {
      setLoading(true)
      const res = await fetch(`/api/inventory/${itemId}`)

      if (!res.ok) {
        throw new Error("Failed to fetch item")
      }

      const data = await res.json()

      if (data.item) {
        setFormData({
          name: data.item.name || "",
          category: data.item.category || "",
          quantity: data.item.quantity?.toString() || "",
          unit: data.item.unit || "",
          price: data.item.price?.toString() || "",
          supplier: data.item.supplier || "",
          godown: data.item.godown || "",
          bagCount: data.item.bagCount?.toString() || "",
        })
      } else {
        // Handle item not found
        toast.error("Item not found")
        router.push("/inventory")
      }
    } catch (error) {
      console.error("Error fetching item:", error)
      toast.error("Failed to fetch item details")
      router.push("/inventory")
    } finally {
      setLoading(false)
    }
  }

  // Fetch transaction and expense history
  async function fetchItemHistory() {
    try {
      setLoadingHistory(true)

      // Fetch transactions
      const transactionsRes = await fetch(`/api/transactions?itemId=${itemId}`)
      const transactionsData = await transactionsRes.json()

      // Fetch expenses
      const expensesRes = await fetch(`/api/expenses?itemId=${itemId}`)
      const expensesData = await expensesRes.json()

      setTransactions(transactionsData.transactions || [])
      setExpenses(expensesData.expenses || [])
    } catch (error) {
      console.error("Error fetching history:", error)
      toast.error("Failed to fetch item history")
    } finally {
      setLoadingHistory(false)
    }
  }

  // Fetch report settings
  async function fetchReportSettings() {
    try {
      const res = await fetch("/api/settings")
      if (res.ok) {
        const data = await res.json()
        if (data.settings && data.settings.reportSettings) {
          setReportSettings(data.settings.reportSettings)
        }
      }
    } catch (error) {
      console.error("Error fetching report settings:", error)
    }
  }

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
    setSaving(true)

    try {
      const res = await fetch(`/api/inventory/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to update item")
      }

      toast.success("Item updated successfully")
      router.push("/inventory")
    } catch (error: unknown) {
      console.error("Error updating item:", error)
      if (error instanceof Error) {
        toast.error(error.message || "Failed to update the item. Please try again.")
      } else {
        toast.error("Failed to update the item. Please try again.")
      }
      setSaving(false)
    }
  }

  // Handle adding an expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (!expenseData.description || !expenseData.amount) {
        throw new Error("Please fill in all fields")
      }

      const amount = Number.parseFloat(expenseData.amount)
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount")
      }

      const expense = {
        itemId,
        description: expenseData.description,
        amount,
        date: new Date().toISOString().split("T")[0],
      }

      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expense),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to add expense")
      }

      // Reset form and refresh history
      setExpenseData({
        description: "",
        amount: "",
      })

      toast.success("Expense added successfully")
      fetchItemHistory()
    } catch (error: unknown) {
      console.error("Error adding expense:", error)
      if (error instanceof Error) {
        toast.error(error.message || "Failed to add expense. Please try again.")
      } else {
        toast.error("Failed to add expense. Please try again.")
      }
    }
  }

  // Generate and download PDF report
  const handleGenerateReport = () => {
    try {
      // Create item object with all data
      const item = {
        ...formData,
        _id: itemId,
        lastUpdated: new Date().toISOString().split("T")[0],
        quantity: parseFloat(formData.quantity) || 0,
        price: parseFloat(formData.price) || 0,
        bagCount: formData.bagCount ? parseInt(formData.bagCount) : 0,
      }

      // Ensure transactions have proper number values
      const formattedTransactions = transactions.map(t => ({
        ...t,
        quantity: Number(t.quantity) || 0,
        price: Number(t.price) || 0,
        totalAmount: Number(t.totalAmount) || 0,
      }))

      // Ensure expenses have proper number values
      const formattedExpenses = expenses.map(e => ({
        ...e,
        amount: Number(e.amount) || 0,
      }))

      // Generate PDF
      const doc = generateVegetablePDF(item, formattedTransactions, formattedExpenses, reportSettings)

      // Download PDF
      doc.save(`${formData.name.replace(/\s+/g, "_")}_report.pdf`)

      toast.success("Report generated successfully")
    } catch (error) {
      console.error("Error generating report:", error)
      toast.error("Failed to generate report. Please try again.")
    }
  }

  if (loading) {
    return (
      <main className="container px-4 py-6 mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/inventory">
              <ArrowLeft className="w-4 h-4" />
              <span className="sr-only">Back to inventory</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit Item</h1>
        </div>
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </main>
    )
  }

  return (
    <main className="container px-4 py-6 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/inventory">
              <ArrowLeft className="w-4 h-4" />
              <span className="sr-only">Back to inventory</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit Item</h1>
        </div>
        <Button onClick={handleGenerateReport} variant="outline" className="hidden sm:flex">
          <Download className="w-4 h-4 mr-2" />
          Export Item Report
        </Button>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Item Details</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Edit Item Details</CardTitle>
                <CardDescription>Update the details of this inventory item</CardDescription>
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
                        <SelectValue placeholder={formData.category || "Select a category"} />
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
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>View all purchases and sales for this item</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p>No transaction history found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction, index) => (
                        <TableRow key={index}>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell className="capitalize">{transaction.type}</TableCell>
                          <TableCell>
                            {transaction.quantity} {formData.unit}
                          </TableCell>
                          <TableCell>
                            {transaction.price ? `₹${transaction.price.toFixed(2)}/${formData.unit}` : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {transaction.totalAmount ? `₹${transaction.totalAmount.toFixed(2)}` : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Additional Expenses</CardTitle>
                <CardDescription>Record and view additional expenses related to this item</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleAddExpense} className="space-y-4 border-b pb-6">
                  <h3 className="font-medium">Add New Expense</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="expense-description">Description</Label>
                      <Input
                        id="expense-description"
                        placeholder="e.g., Transportation, Storage"
                        value={expenseData.description}
                        onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expense-amount">Amount (₹)</Label>
                      <Input
                        id="expense-amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Enter amount"
                        value={expenseData.amount}
                        onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full sm:w-auto">
                    Add Expense
                  </Button>
                </form>

                <div>
                  <h3 className="font-medium mb-4">Expense History</h3>
                  {loadingHistory ? (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ) : expenses.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p>No expense history found</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expenses.map((expense, index) => (
                          <TableRow key={index}>
                            <TableCell>{expense.date}</TableCell>
                            <TableCell>{expense.description}</TableCell>
                            <TableCell className="text-right">₹{expense.amount?.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Button onClick={handleGenerateReport} variant="outline" className="w-full sm:hidden">
          <Download className="w-4 h-4 mr-2" />
          Export Item Report
        </Button>
      </div>
    </main>
  )
}

