import PlaylistTabs from "./_components/PlaylistTabs"

export default function PlaylistsPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      <div className="flex-none">
        <h1 className="text-xl font-semibold text-gray-900">Playlists</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Manage content playlists and arrange articles in custom order
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <PlaylistTabs />
      </div>
    </div>
  )
}
