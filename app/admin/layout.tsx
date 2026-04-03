import AdminSidebar from "./_components/AdminSidebar"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <>{children}</>
}