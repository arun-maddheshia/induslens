import { db } from "@/lib/db"
import Link from "next/link"
import {
  Newspaper,
  Users,
  FolderOpen,
  Film,
  Award,
  Globe,
  BookOpen,
  CheckCircle2,
  FileEdit,
  Archive,
} from "lucide-react"

async function getDashboardStats() {
  const [
    totalArticles,
    publishedArticles,
    draftArticles,
    archivedArticles,
    induslensArticles,
    industalesArticles,
    totalAuthors,
    totalCategories,
    totalVideos,
    totalEminence,
  ] = await Promise.all([
    db.article.count(),
    db.article.count({ where: { status: "PUBLISHED" } }),
    db.article.count({ where: { status: "DRAFT" } }),
    db.article.count({ where: { status: "ARCHIVED" } }),
    db.article.count({ where: { siteId: "induslens" } }),
    db.article.count({ where: { siteId: "industales" } }),
    db.author.count(),
    db.category.count(),
    db.video.count(),
    db.eminence.count(),
  ])

  return {
    totalArticles,
    publishedArticles,
    draftArticles,
    archivedArticles,
    induslensArticles,
    industalesArticles,
    totalAuthors,
    totalCategories,
    totalVideos,
    totalEminence,
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const primaryCards = [
    {
      title: "Total Articles",
      value: stats.totalArticles,
      icon: Newspaper,
      href: "/admin/articles",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Authors",
      value: stats.totalAuthors,
      icon: Users,
      href: "/admin/authors",
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      title: "Categories",
      value: stats.totalCategories,
      icon: FolderOpen,
      href: "/admin/categories",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Videos",
      value: stats.totalVideos,
      icon: Film,
      href: "/admin/videos",
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      title: "Eminence",
      value: stats.totalEminence,
      icon: Award,
      href: "/admin/eminence",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ]

  const articleBreakdown = [
    {
      title: "Published",
      value: stats.publishedArticles,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      href: "/admin/articles?status=PUBLISHED",
    },
    {
      title: "Draft",
      value: stats.draftArticles,
      icon: FileEdit,
      color: "text-amber-600",
      bg: "bg-amber-50",
      href: "/admin/articles?status=DRAFT",
    },
    {
      title: "Archived",
      value: stats.archivedArticles,
      icon: Archive,
      color: "text-gray-500",
      bg: "bg-gray-100",
      href: "/admin/articles?status=ARCHIVED",
    },
    {
      title: "IndusLens",
      value: stats.induslensArticles,
      icon: Globe,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/admin/articles?siteId=induslens",
    },
    {
      title: "IndusTales",
      value: stats.industalesArticles,
      icon: BookOpen,
      color: "text-violet-600",
      bg: "bg-violet-50",
      href: "/admin/articles?siteId=industales",
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-0.5 text-sm text-gray-500">Overview of your content</p>
      </div>

      {/* Primary stats */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Content
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {primaryCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
                <p className="mt-0.5 text-sm text-gray-500">{card.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Article breakdown */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Article Breakdown
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {articleBreakdown.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
                <p className="mt-0.5 text-sm text-gray-500">{card.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "New Article", href: "/admin/articles/new" },
            { label: "New Author", href: "/admin/authors/new" },
            { label: "New Category", href: "/admin/categories/new" },
            { label: "New Video", href: "/admin/videos/new" },
            { label: "Manage Playlists", href: "/admin/playlists" },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
