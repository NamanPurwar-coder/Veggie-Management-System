"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { BarChart3, Home, Menu, Package, Settings } from "lucide-react"

/**
 * Header component with responsive navigation
 * Includes desktop and mobile navigation with active route highlighting
 */
export default function Header() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Define navigation routes
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
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <div className="font-semibold text-primary">Veggie Tracker</div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={route.active ? "secondary" : "ghost"}
              asChild
              className="flex items-center"
            >
              <Link href={route.href}>
                <route.icon className="w-4 h-4 mr-2" />
                {route.label}
              </Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center space-x-2">
          <ModeToggle />

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="font-semibold text-primary py-4">Veggie Tracker</div>
              <nav className="flex flex-col gap-4 mt-4">
                {routes.map((route) => (
                  <Button
                    key={route.href}
                    variant={route.active ? "secondary" : "ghost"}
                    asChild
                    className="justify-start"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href={route.href} className="flex items-center">
                      <route.icon className="w-4 h-4 mr-2" />
                      {route.label}
                    </Link>
                  </Button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

