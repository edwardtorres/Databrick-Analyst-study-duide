import { useEffect, useState } from 'react'

// Hash routing keeps the app a pure static site: no server rewrites needed.
const current = () => window.location.hash.replace(/^#/, '') || '/'

export function useRoute() {
  const [path, setPath] = useState(current)
  useEffect(() => {
    const onHash = () => {
      setPath(current())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return path
}

export const go = (path) => {
  window.location.hash = path
}

export function match(pattern, path) {
  const p = pattern.split('/')
  const a = path.split('/')
  if (p.length !== a.length) return null
  const params = {}
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(a[i])
    else if (p[i] !== a[i]) return null
  }
  return params
}
