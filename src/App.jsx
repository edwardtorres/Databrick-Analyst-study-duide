import { Suspense, lazy } from 'react'
import { Home as HomeIcon, Map, Terminal, Repeat, Swords } from 'lucide-react'
import { useRoute, match } from './lib/router.js'
import { useProgress } from './lib/store.jsx'
import { allQuestions } from './data/chapters.js'
import { dueQuestions } from './lib/srs.js'
import { useContentVersion } from './lib/useContent.js'
import { Toasts, Loading } from './components/ui.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import DamagedNotice from './components/DamagedNotice.jsx'
import Home from './pages/Home.jsx'
import Chapters from './pages/Chapters.jsx'
import Chapter from './pages/Chapter.jsx'
import ChapterTest from './pages/ChapterTest.jsx'
import Review from './pages/Review.jsx'
import Boss from './pages/Boss.jsx'
import Labs from './pages/Labs.jsx'
import LabPage from './pages/LabPage.jsx'
import Settings from './pages/Settings.jsx'

const Level = lazy(() => import('./pages/Level.jsx'))
const Sandbox = lazy(() => import('./pages/Sandbox.jsx'))
const ChallengePage = lazy(() => import('./pages/ChallengePage.jsx'))

const ROUTES = [
  ['/', Home],
  ['/chapters', Chapters],
  ['/chapter/:id', Chapter],
  ['/chapter/:id/s/:sub', Level],
  ['/chapter/:id/test', ChapterTest],
  ['/sql', Sandbox],
  ['/sql/:cid', ChallengePage],
  ['/review', Review],
  ['/review/:ch', Review],
  ['/boss', Boss],
  ['/labs', Labs],
  ['/lab/:lid', LabPage],
  ['/settings', Settings],
]

// Dev-only route for checking the error boundary (`#/__crash`).
if (import.meta.env.DEV)
  ROUTES.push([
    '/__crash',
    () => {
      throw new Error('Deliberate test crash')
    },
  ])

function resolve(path) {
  for (const [pattern, Comp] of ROUTES) {
    const params = match(pattern, path)
    if (params) return [Comp, params]
  }
  return [Home, {}]
}

const NAV = [
  ['/', 'Home', HomeIcon, (p) => p === '/' || p.startsWith('/settings')],
  ['/chapters', 'Learn', Map, (p) => p.startsWith('/chapter') || p.startsWith('/lab')],
  ['/sql', 'SQL', Terminal, (p) => p.startsWith('/sql')],
  ['/review', 'Review', Repeat, (p) => p.startsWith('/review')],
  ['/boss', 'Boss', Swords, (p) => p.startsWith('/boss')],
]

export default function App() {
  const path = useRoute()
  const { state, storageError } = useProgress()
  useContentVersion() // re-render pages as chapter chunks arrive
  const [Page, params] = resolve(path)
  const due = dueQuestions(allQuestions(), state.questions).length
  const bossLive = !!state.boss.active

  return (
    <div className="mx-auto min-h-dvh max-w-2xl">
      <Toasts />
      <DamagedNotice />
      <a href="#main-content" className="skip-link" onClick={(event) => {
        event.preventDefault()
        document.getElementById('main-content')?.focus()
      }}>Skip to main content</a>
      <main id="main-content" tabIndex={-1} className="pb-safe px-4 pt-4">
        {storageError && <div role="alert" className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
          Progress cannot be saved in this browser. <a href="#/settings" className="font-bold underline">Export a backup in Settings</a> before closing this page.
        </div>}
        {/* Inner boundary keeps the nav bar usable and resets on navigation. */}
        <ErrorBoundary resetKey={path}>
          <Suspense fallback={<Loading label="Loading page…" />}>
            <Page {...params} key={path} />
          </Suspense>
        </ErrorBoundary>
      </main>
      <nav aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 backdrop-blur" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="mx-auto grid max-w-2xl grid-cols-5">
          {NAV.map(([to, label, Icon, isActive]) => {
            const active = isActive(path)
            return (
              <a key={to} href={`#${to}`} aria-current={active ? 'page' : undefined} className={`relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${active ? 'text-brand2' : 'text-slate-400'}`}>
                <Icon size={21} strokeWidth={active ? 2.5 : 2} />
                {label}
                {to === '/review' && due > 0 && (
                  <span className="absolute right-[22%] top-1 rounded-full bg-brand px-1.5 text-[10px] font-bold text-ink">{due}</span>
                )}
                {to === '/boss' && bossLive && <span className="absolute right-[28%] top-1.5 h-2 w-2 animate-pulse rounded-full bg-rose-500" />}
              </a>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
