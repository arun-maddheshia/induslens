import { notFound } from "next/navigation"
import { getVideoById } from "@/lib/db-videos"
import AuthenticatedLayout from "../../../_components/AuthenticatedLayout"
import VideoForm from "../../_components/VideoForm"

interface EditVideoPageProps {
  params: { id: string }
}

export default async function EditVideoPage({ params }: EditVideoPageProps) {
  const video = await getVideoById(params.id)

  if (!video) {
    notFound()
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Video</h1>
          <p className="mt-1 text-sm text-gray-500">Update video details and metadata.</p>
        </div>
        <VideoForm video={video as any} isEdit />
      </div>
    </AuthenticatedLayout>
  )
}
