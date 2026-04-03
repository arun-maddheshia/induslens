import { redirect } from "next/navigation"

export default async function AdminPage() {
  // Redirect to articles listing as the main admin page
  redirect("/admin/articles")
}