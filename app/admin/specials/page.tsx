import AuthenticatedLayout from '../_components/AuthenticatedLayout'
import SpecialsManager from './_components/SpecialsManager'

export default function SpecialsAdminPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Specials</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage special sections shown on the Specials page
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <SpecialsManager />
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
