"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  Newspaper,
  Users,
  FolderOpen,
  ListOrdered,
  Film,
  Award,
  Zap,
  LogOut,
  LayoutDashboard,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminSidebarProps {
  user: {
    id?: string
    name?: string | null
    email?: string | null
  }
}

const navGroups = [
  {
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Content",
    items: [
      { name: "Articles",   href: "/admin/articles",   icon: Newspaper },
      { name: "Authors",    href: "/admin/authors",    icon: Users },
      { name: "Categories", href: "/admin/categories", icon: FolderOpen },
      { name: "Playlists",  href: "/admin/playlists",  icon: ListOrdered },
      { name: "Videos",     href: "/admin/videos",     icon: Film },
    ],
  },
  {
    label: "Editorial",
    items: [
      { name: "Eminence", href: "/admin/eminence", icon: Award },
      { name: "Specials", href: "/admin/specials", icon: Zap },
    ],
  },
]

function getInitials(name?: string | null, email?: string | null) {
  if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  if (email) return email[0].toUpperCase()
  return "A"
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()

  const isActive = (item: { href: string; exact?: boolean }) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-zinc-900">
      {/* Brand */}
      <div className="flex h-14 items-center gap-3 border-b border-white/10 px-5">
        <Image
          src="/logo.svg"
          alt="IndusLens"
          width={116}
          height={26}
          className="object-contain"
          priority
        />
        <span className="rounded bg-zinc-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-300">
          CMS
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navGroups.map((group, gi) => (
          <div key={gi} className={gi > 0 ? "mt-6" : undefined}>
            {group.label && (
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item)
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-white/10 text-white"
                          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                      )}
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-semibold text-zinc-200">
            {getInitials(user.name, user.email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-none text-zinc-100">
              {user.name || "Admin"}
            </p>
            <p className="mt-0.5 truncate text-xs text-zinc-500">
              {user.email}
            </p>
          </div>
          <button
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white/10 hover:text-red-400"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
