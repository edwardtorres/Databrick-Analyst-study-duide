import { ArrowRight } from 'lucide-react'
import { allChallenges, challengeById, allChaptersLoaded } from '../data/chapters.js'
import { useProgress } from '../lib/store.jsx'
import SqlChallenge from '../components/SqlChallenge.jsx'
import { PageHeader } from '../components/ui.jsx'
import { go } from '../lib/router.js'
import ContentStatus from '../components/ContentStatus.jsx'

function ChallengePageInner({ cid }) {
  const challenge = challengeById(cid)
  const { state } = useProgress()
  if (!challenge) return <PageHeader title="Challenge not found" back="/sql" />
  const list = allChallenges()
  const idx = list.findIndex((c) => c.id === cid)
  const nextUnsolved = [...list.slice(idx + 1), ...list.slice(0, idx)].find((c) => !state.challenges[c.id]?.solved)

  return (
    <div>
      <PageHeader title="SQL Arena" back="/sql" subtitle={`Challenge ${idx + 1} of ${list.length}`} />
      <div className="card">
        <SqlChallenge challenge={challenge} />
      </div>
      {nextUnsolved && (
        <button onClick={() => go(`/sql/${nextUnsolved.id}`)} className="btn-ghost mt-3 w-full">
          Next unsolved: {nextUnsolved.title} <ArrowRight size={16} />
        </button>
      )}
    </div>
  )
}

export default function ChallengePage(props) {
  if (!allChaptersLoaded()) return <ContentStatus label="Loading questions…" />
  return <ChallengePageInner {...props} />
}
