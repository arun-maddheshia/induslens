import VideoForm from "../_components/VideoForm"

export default function NewVideoPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">New Video</h1>
        <p className="mt-0.5 text-sm text-gray-500">Add a new video to your content library.</p>
      </div>
      <VideoForm />
    </div>
  )
}
