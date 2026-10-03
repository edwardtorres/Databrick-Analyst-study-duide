import { labById } from '../components/widgets.js'
import { PageHeader } from '../components/ui.jsx'

export default function LabPage({ lid }) {
  const lab = labById(lid)
  if (!lab?.component) return <PageHeader title="Lab not available yet" back="/labs" />
  const Lab = lab.component
  return (
    <div>
      <PageHeader title="Lab" back="/labs" subtitle={`Chapter ${lab.chapter}`} />
      <div className="card">
        <Lab />
      </div>
    </div>
  )
}
