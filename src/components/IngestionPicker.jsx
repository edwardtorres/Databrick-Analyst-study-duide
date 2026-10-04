import ScenarioPicker from './ScenarioPicker.jsx'
import { METHODS, SCENARIOS } from '../lib/ingestionPicker.js'

export default function IngestionPicker() {
  return (
    <ScenarioPicker
      title="📥 Ingestion Picker"
      items={METHODS}
      scenarios={SCENARIOS}
      prefix="ip"
      question="Which ingestion method fits best?"
      note="Methods and limits checked against the Databricks docs (Sep 2026). Delta Sharing is now called OpenSharing in the docs."
    />
  )
}
