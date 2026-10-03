import { Component } from 'react'

const STORAGE_KEY = 'lakehouse-quest:v1'

function downloadSavedProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([raw], { type: 'application/json' }))
    a.download = `lakehouse-quest-progress-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  } catch {
    /* nothing to download */
  }
}

// Catches render errors so one broken screen doesn't blank the whole app.
// `resetKey` (e.g. the current route) clears the error when it changes.
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Lakehouse Quest crashed:', error, info?.componentStack)
  }

  componentDidUpdate(prev) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children
    const home = () => {
      this.setState({ error: null })
      window.location.hash = '/'
    }
    return (
      <div className="flex min-h-[70dvh] flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl">🧯</div>
        <h1 className="mt-3 text-xl font-black">Something broke on this screen</h1>
        <p className="mt-1 max-w-sm text-sm text-slate-400">
          Your progress is saved. Head back home and carry on. If this keeps happening, download a backup of your progress first.
        </p>
        <div className="mt-5 flex w-full max-w-xs flex-col gap-2">
          <button onClick={home} className="btn-primary py-3">
            Back to Home
          </button>
          <button onClick={() => window.location.reload()} className="btn-ghost">
            Reload the app
          </button>
          <button onClick={downloadSavedProgress} className="text-xs text-slate-400 underline">
            Download a backup of my progress
          </button>
        </div>
        <details className="mt-4 max-w-sm text-left text-[11px] text-slate-500">
          <summary className="cursor-pointer">Error details</summary>
          <pre className="mt-1 whitespace-pre-wrap">{String(this.state.error?.message || this.state.error)}</pre>
        </details>
      </div>
    )
  }
}
