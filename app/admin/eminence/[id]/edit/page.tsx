import { notFound } from "next/navigation"
import EminenceForm from "../../_components/EminenceForm"
import { getEminenceById } from "@/lib/db-eminence"

interface EditEminencePageProps {
  params: Promise<{ id: string }>
}

export default async function EditEminencePage({ params }: EditEminencePageProps) {
  const { id } = await params
  const entry = await getEminenceById(id)

  if (!entry) {
    notFound()
  }

  const formData = {
    id: entry.id,
    name: entry.name,
    slug: entry.slug,
    excerpt: entry.excerpt,
    pageContent: entry.pageContent,
    countryName: entry.countryName,
    language: entry.language,
    status: entry.status,
    isContent: entry.isContent,
    order: entry.order,
    facebookUrl: entry.facebookUrl,
    instagramUrl: entry.instagramUrl,
    twitterUrl: entry.twitterUrl,
    linkedinUrl: entry.linkedinUrl,
    websiteUrl: entry.websiteUrl,
    images: entry.images.map((img) => ({
      id: img.id,
      imageCategory: img.imageCategory,
      imageCategoryValue: img.imageCategoryValue,
      imageDescription: img.imageDescription,
      imageUrl: img.imageUrl,
      key: img.key,
    })),
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Entry</h1>
          <p className="mt-1 text-sm text-gray-500">{entry.name}</p>
        </div>
        <EminenceForm entry={formData} isEdit />
      </div>
  )
}
