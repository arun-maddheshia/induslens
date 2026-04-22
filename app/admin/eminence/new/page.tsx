import EminenceForm from "../_components/EminenceForm"

export default function NewEminencePage() {
  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Eminence Entry</h1>
          <p className="mt-1 text-sm text-gray-500">Add a new profile to Indus Eminence.</p>
        </div>
        <EminenceForm />
      </div>
  )
}
