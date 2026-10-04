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
      verify="Ingestion features change often (Lakeflow Connect connectors, read_files options, upload limits). Check the current docs."
    />
  )
}
