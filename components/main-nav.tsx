"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BarChart3, Home, Package, Settings } from "lucide-react"

export default function MainNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "Dashboard",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/inventory",
      label: "Inventory",
      icon: Package,
      active: pathname === "/inventory" || pathname.startsWith("/inventory/"),
    },
    {
      href: "/reports",
      label: "Reports",
      icon: BarChart3,
      active: pathname === "/reports",
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/settings",
    },
  ]

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {routes.map((route) => (
        <Button
          key={route.href}
          variant="ghost"
          asChild
          className={cn("justify-start", route.active ? "bg-muted font-medium" : "font-normal")}
        >
          <Link href={route.href} className="flex items-center">
            <route.icon className="w-4 h-4 mr-2" />
            {route.label}
          </Link>
        </Button>
      ))}
    </nav>
  )
}

