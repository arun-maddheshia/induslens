"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import clsx from "clsx"

interface AdminSidebarProps {
  user: {
    id?: string
    name?: string | null
    email?: string | null
  }
}

const navigation = [
  { name: "Articles", href: "/admin/articles", icon: "📄" },
  { name: "Authors", href: "/admin/authors", icon: "👤" },
  { name: "Categories", href: "/admin/categories", icon: "🏷️" },
  { name: "Playlists", href: "/admin/playlists", icon: "📋" },
]

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/admin/login" })
  }

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0 px-4 py-6 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">
            CMS
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                pathname.startsWith(item.href)
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <span className="mr-3 text-base">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User info and logout */}
        <div className="flex-shrink-0 border-t border-gray-200">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name || "Admin User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-3 w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}