import { labById } from '../components/widgets.js'
import { Suspense } from 'react'
import { PageHeader, Loading } from '../components/ui.jsx'

export default function LabPage({ lid }) {
  const lab = labById(lid)
  if (!lab?.component) return <PageHeader title="Lab not available yet" back="/labs" />
  const Lab = lab.component
  return (
    <div>
      <PageHeader title="Lab" back="/labs" subtitle={`Chapter ${lab.chapter}`} />
      <div className="card">
        <Suspense fallback={<Loading label="Loading lab…" />}>
          <Lab />
        </Suspense>
      </div>
    </div>
  )
}
