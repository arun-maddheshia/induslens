import AuthenticatedLayout from "../_components/AuthenticatedLayout"
import PlaylistTabs from "./_components/PlaylistTabs"

export default function PlaylistsPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Playlists</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your content playlists and arrange articles in custom order
          </p>
        </div>

        {/* Client Component for Tabs */}
        <PlaylistTabs />
      </div>
    </AuthenticatedLayout>
  )
}