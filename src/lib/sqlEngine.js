// Browser loader for sql.js. The .wasm file is bundled by Vite so the app
// works fully offline / from any static host.
import initSqlJs from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm-browser.wasm?url'

let sqlPromise = null

export function loadSql() {
  if (!sqlPromise) sqlPromise = initSqlJs({ locateFile: () => wasmUrl })
  return sqlPromise
}

export { createDb, runSql, checkChallenge, compareResults, friendlyError } from './sqlCore.js'
