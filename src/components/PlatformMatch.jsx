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
      verify="Product names have changed recently: Workflows → Lakeflow Jobs, Delta Live Tables → Lakeflow Declarative Pipelines, DatabricksIQ → Data Intelligence Engine."
    />
  )
}
