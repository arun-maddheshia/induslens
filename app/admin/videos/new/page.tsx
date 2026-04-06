import AuthenticatedLayout from "../../_components/AuthenticatedLayout"
import VideoForm from "../_components/VideoForm"

export default function NewVideoPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Video</h1>
          <p className="mt-1 text-sm text-gray-500">Add a new video to your content library.</p>
        </div>
        <VideoForm />
      </div>
    </AuthenticatedLayout>
  )
}
