export default function ResultTable({ result, maxRows = 200, highlight }) {
  if (!result) return null
  if (result.message && !result.columns.length)
    return <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{result.message}</div>
  const rows = result.rows.slice(0, maxRows)
  return (
    <div>
      <div className="max-h-72 overflow-auto rounded-xl border border-line">
        <table className="w-full border-collapse font-mono text-xs">
          <thead className="sticky top-0 bg-panel2">
            <tr>
              {result.columns.map((c, i) => (
                <th key={i} className="whitespace-nowrap border-b border-line px-2.5 py-1.5 text-left font-semibold text-slate-300">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={`odd:bg-ink/30 ${highlight?.(r, i) || ''}`}>
                {r.map((v, j) => (
                  <td key={j} className="whitespace-nowrap border-b border-line/50 px-2.5 py-1.5">
                    {v === null ? <span className="italic text-fuchsia-300/80">NULL</span> : v === '' ? <span className="text-slate-500">''</span> : String(v)}
                  </td>
                ))}
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={result.columns.length} className="px-2.5 py-3 text-center text-slate-500">
                  0 rows
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-1 text-right text-[11px] text-slate-500">
        {result.rows.length} row{result.rows.length === 1 ? '' : 's'}
        {result.rows.length > maxRows && ` (showing ${maxRows})`}
        {result.ms !== undefined && ` · ${result.ms} ms`}
      </div>
    </div>
  )
}
