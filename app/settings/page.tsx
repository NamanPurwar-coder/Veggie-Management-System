"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import { toast } from "react-toastify"
import { Moon, Sun, Monitor } from "lucide-react"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [lowStockThreshold, setLowStockThreshold] = useState("30")
  const [defaultCurrency, setDefaultCurrency] = useState("INR")
  const [notifications, setNotifications] = useState(true)

  const saveSettings = () => {
    // In a real app, this would save to a database
    toast.success("Settings saved successfully")
  }

  return (
    <main className="container px-4 py-6 mx-auto space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how the application looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-4">
                    <Sun className="w-5 h-5" />
                    <div className="space-y-0.5">
                      <p className="font-medium">Light</p>
                      <p className="text-sm text-muted-foreground">Use light theme</p>
                    </div>
                  </div>
                  <Switch checked={theme === "light"} onCheckedChange={() => setTheme("light")} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-4">
                    <Moon className="w-5 h-5" />
                    <div className="space-y-0.5">
                      <p className="font-medium">Dark</p>
                      <p className="text-sm text-muted-foreground">Use dark theme</p>
                    </div>
                  </div>
                  <Switch checked={theme === "dark"} onCheckedChange={() => setTheme("dark")} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-4">
                    <Monitor className="w-5 h-5" />
                    <div className="space-y-0.5">
                      <p className="font-medium">System</p>
                      <p className="text-sm text-muted-foreground">Follow system theme</p>
                    </div>
                  </div>
                  <Switch checked={theme === "system"} onCheckedChange={() => setTheme("system")} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Inventory Settings</CardTitle>
            <CardDescription>Configure inventory management preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="low-stock-threshold">Low Stock Threshold</Label>
              <Input
                id="low-stock-threshold"
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Items with quantity below this value will be marked as low stock
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-currency">Default Currency</Label>
              <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
                <SelectTrigger id="default-currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="GBP">British Pound (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive alerts for low stock and other events</p>
              </div>
              <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={saveSettings} className="ml-auto">
              Save Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}

