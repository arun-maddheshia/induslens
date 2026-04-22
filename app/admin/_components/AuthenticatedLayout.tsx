import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminSidebar from "./AdminSidebar"

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export default async function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/admin/login")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      <AdminSidebar user={session.user} />
      {/* offset by sidebar width; full height; only this column scrolls */}
      <div className="ml-64 flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 pb-16">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
