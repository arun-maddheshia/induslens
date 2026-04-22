import EminenceForm from "../_components/EminenceForm"

export default function NewEminencePage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">New Eminence Entry</h1>
        <p className="mt-0.5 text-sm text-gray-500">Add a new profile to Indus Eminence.</p>
      </div>
      <EminenceForm />
    </div>
  )
}
