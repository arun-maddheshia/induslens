import { notFound } from "next/navigation"
import { getVideoById } from "@/lib/db-videos"
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
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Edit Video</h1>
        <p className="mt-0.5 text-sm text-gray-500">Update video details and metadata.</p>
      </div>
      <VideoForm video={video as any} isEdit />
    </div>
  )
}
