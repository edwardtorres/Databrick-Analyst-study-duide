import { useEffect, useState } from 'react'
import { loadSql } from './sqlEngine.js'

export function useSql() {
  const [state, setState] = useState({ SQL: null, error: null })
  useEffect(() => {
    let alive = true
    loadSql()
      .then((SQL) => alive && setState({ SQL, error: null }))
      .catch((e) => alive && setState({ SQL: null, error: e.message }))
    return () => {
      alive = false
    }
  }, [])
  return state
}
