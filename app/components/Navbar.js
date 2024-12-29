'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar, LayoutDashboard, Users, UserPlus, Laptop, AppWindowIcon as Apps, IndianRupee, Star, Bell, Settings } from 'lucide-react'
import { calendar } from "@nextui-org/react"

const navigation = [
  // { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "People", href: "/manage-employees", icon: Users },
  // { name: "Salary", href: "/salaries", icon: IndianRupee },
  // {name : "Calendar", href:"/calendar", icon: Calendar},
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50  bg-white backdrop-blur-lg  pb-2">
      <div className="flex h-16 items-center px-4 justify-between w-full">
        <div className="flex items-center space-x-8 border-2 rounded-full bg-stone-300 ">
          <Link href="/" className="font-extralight text-lg p-1 mx-2 text-black">
            Experimind Labs
          </Link>
        </div>

        {/* Navigation items on the right */}
        <div className="ml-auto flex items-center justify-around space-x-8 bg-stone-300 rounded-full p-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                    "flex items-center px-3 py-2 rounded-full text-sm text-black font-medium transition-colors",
                  isActive
                    ? "bg-slate-600 text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
