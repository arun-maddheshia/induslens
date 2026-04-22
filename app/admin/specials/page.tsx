import SpecialsManager from './_components/SpecialsManager'

export default function SpecialsAdminPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      <div className="flex-none">
        <h1 className="text-xl font-semibold text-gray-900">Specials</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Manage special sections shown on the Specials page
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <SpecialsManager />
      </div>
    </div>
  )
}
