import { useEffect, useSyncExternalStore } from 'react'
import { contentVersion, subscribeContent, loadAllChapters } from '../data/chapters.js'

// Re-renders the caller whenever another chapter's content chunk arrives,
// and starts loading every built chapter in the background.
export function useContentVersion() {
  useEffect(() => {
    loadAllChapters()
  }, [])
  return useSyncExternalStore(subscribeContent, contentVersion)
}
