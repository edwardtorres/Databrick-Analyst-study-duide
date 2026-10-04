import ScenarioPicker from './ScenarioPicker.jsx'
import { COMPONENTS, SCENARIOS } from '../lib/platformMatch.js'

export default function PlatformMatch() {
  return (
    <ScenarioPicker
      title="🧩 Platform Match"
      items={COMPONENTS}
      scenarios={SCENARIOS}
      prefix="pm"
      question="Which platform component solves it?"
      note="Names follow the exam guide. Current product names: Workflows → Lakeflow Jobs, Delta Live Tables → Lakeflow pipelines, Databricks Assistant → Genie Code, Vector Search → AI Search, Delta Sharing → OpenSharing."
    />
  )
}
