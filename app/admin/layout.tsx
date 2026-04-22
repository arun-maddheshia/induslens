import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import AdminSidebar from "./_components/AdminSidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = headers().get("x-pathname") ?? ""

  // Login page renders without the admin shell
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  const session = await auth()

  if (!session?.user) {
    redirect("/admin/login")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar user={session.user} />
      <div className="ml-64 flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full flex flex-col p-6 gap-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
