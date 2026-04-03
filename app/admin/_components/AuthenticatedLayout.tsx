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
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar user={session.user} />
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        <div className="flex-1 py-6">
          <div className="px-4 sm:px-6 lg:px-8 pb-20">
            {children}
          </div>
        </div>
        {/* Footer spacer to prevent content from being cut off */}
        <div className="h-16 flex-shrink-0"></div>
      </main>
    </div>
  )
}