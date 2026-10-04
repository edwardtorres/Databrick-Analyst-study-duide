// Small SVG chart renderer for the Chart Picker lab. It draws any render spec
// from lib/chartPicker.js, so a poor choice looks as bad as it really would.
//
// Palette: the dataviz reference categorical slots 1-3 (dark steps), validated
// against this app's card surface #121a33. More than 3 series fold into a
// neutral "Other" and pies with many slices use a single hue. Mark specs:
// bars <= 24px with 4px rounded data-ends, 2px lines, ringed dots (r 4),
// hairline gridlines, 2px surface gaps between touching fills.

import { useState } from 'react'

const SURFACE = '#121a33'
const GRID = '#263257'
const SERIES = ['#3987e5', '#d95926', '#199e70']
const OTHER = '#64748b'
const W = 240
const H = 150
const PAD = { l: 34, r: 8, t: 10, b: 20 }
const IW = W - PAD.l - PAD.r
const IH = H - PAD.t - PAD.b

const fmt = (n) => (Math.abs(n) >= 1000 ? `${Math.round(n / 100) / 10}k` : String(Math.round(n * 10) / 10))

// Tap (or Enter/Space) a mark to show its value: touch screens never show
// SVG <title> tooltips. Tapping the same mark or the background hides it.
function useTapLabel() {
  const [sel, setSel] = useState(null)
  const toggle = (id, text, at) => setSel((s) => (s?.id === id ? null : { id, text, ...at }))
  const props = (key, text, at) => ({
    role: 'button',
    tabIndex: 0,
    'aria-label': text,
    'data-mark': '',
    style: { cursor: 'pointer', outline: 'none' },
    opacity: sel && sel.id !== key ? 0.45 : 1,
    onClick: (e) => {
      e.stopPropagation()
      toggle(key, text, at)
    },
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        toggle(key, text, at)
      }
    },
  })
  const label = sel ? <ValueLabel x={sel.x} y={sel.y} text={sel.text} /> : null
  // The SVG label is created fresh on each tap, and live regions only
  // announce changes to elements that already exist. This persistent,
  // visually hidden region carries the same text for screen readers.
  const live = (
    <span className="sr-only" role="status" aria-live="polite" data-testid="value-live">
      {sel ? sel.text : ''}
    </span>
  )
  return { props, label, live, clear: () => setSel(null), sel }
}

function ValueLabel({ x, y, text }) {
  const w = Math.min(W - 4, text.length * 5 + 10)
  const cx = Math.min(W - w / 2 - 2, Math.max(w / 2 + 2, x))
  const cy = Math.max(12, y - 10)
  return (
    <g pointerEvents="none" data-testid="value-label">
      <rect x={cx - w / 2} y={cy - 9} width={w} height={14} rx="3" fill="#0b1020" stroke={GRID} />
      <text x={cx} y={cy + 1} textAnchor="middle" fontSize="9" fontWeight="600" fill="#f1f5f9">
        {text}
      </text>
    </g>
  )
}

function niceMax(v) {
  if (v <= 0) return 1
  const p = 10 ** Math.floor(Math.log10(v))
  return [1, 2, 2.5, 5, 10].map((m) => m * p).find((m) => m >= v)
}

// Rounded data-end (top) and square baseline (bottom).
function columnPath(x, y, w, h, r = 4) {
  if (h <= 0) return ''
  const rr = Math.min(r, w / 2, h)
  return `M${x},${y + h} L${x},${y + rr} Q${x},${y} ${x + rr},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h} Z`
}

function Axes({ max, labels, showEvery = 1 }) {
  return (
    <g>
      {[0, 0.5, 1].map((f) => {
        const y = PAD.t + IH - f * IH
        return (
          <g key={f}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke={GRID} strokeWidth="1" />
            <text x={PAD.l - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#94a3b8">
              {fmt(max * f)}
            </text>
          </g>
        )
      })}
      {labels.map((l, i) =>
        // Step back from the last label so it always shows and never collides.
        (labels.length - 1 - i) % showEvery === 0 ? (
          <text key={i} x={PAD.l + ((i + 0.5) * IW) / labels.length} y={H - 6} textAnchor="middle" fontSize="8" fill="#94a3b8">
            {String(l).slice(0, 6)}
          </text>
        ) : null,
      )}
    </g>
  )
}

function Bars({ spec }) {
  const max = niceMax(Math.max(...spec.values))
  const band = IW / spec.values.length
  const bw = Math.min(24, Math.max(2, band - 2))
  const tap = useTapLabel()
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" onClick={tap.clear}>
      <Axes max={max} labels={spec.labels} showEvery={Math.ceil(spec.labels.length / 6)} />
      {spec.values.map((v, i) => {
        const h = (v / max) * IH
        const x = PAD.l + i * band + (band - bw) / 2
        return (
          <path
            key={i}
            d={columnPath(x, PAD.t + IH - Math.max(h, 2), bw, Math.max(h, 2))}
            fill={SERIES[0]}
            {...tap.props(i, `${spec.labels[i]}: ${fmt(v)}${spec.unit ? ` ${spec.unit}` : ''}`, { x: x + bw / 2, y: PAD.t + IH - h })}
          >
            <title>{`${spec.labels[i]}: ${fmt(v)}${spec.unit ? ` ${spec.unit}` : ''}`}</title>
          </path>
        )
      })}
      {tap.label}
      </svg>
      {tap.live}
    </>
  )
}

function Lines({ spec }) {
  const series = spec.series.slice(0, 3)
  const max = niceMax(Math.max(...series.flatMap((s) => s.values)))
  const n = spec.labels.length
  const x = (i) => PAD.l + ((i + 0.5) * IW) / n
  const y = (v) => PAD.t + IH - (v / max) * IH
  const tap = useTapLabel()
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" onClick={tap.clear}>
      <Axes max={max} labels={spec.labels} showEvery={Math.ceil(n / 6)} />
      {series.map((s, si) => (
        <g key={s.name}>
          <polyline points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke={SERIES[si]} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={x(n - 1)} cy={y(s.values[n - 1])} r="4" fill={SERIES[si]} stroke={SURFACE} strokeWidth="2" />
          {s.values.map((v, i) => (
            <circle
              key={i}
              cx={x(i)}
              cy={y(v)}
              r="7"
              fill={tap.sel?.id === `${si}-${i}` ? SERIES[si] : 'transparent'}
              stroke={tap.sel?.id === `${si}-${i}` ? SURFACE : 'none'}
              strokeWidth="2"
              {...tap.props(`${si}-${i}`, `${spec.labels[i]}: ${fmt(v)}`, { x: x(i), y: y(v) })}
              opacity={1}
            >
              <title>{`${s.name}, ${spec.labels[i]}: ${fmt(v)}`}</title>
            </circle>
          ))}
        </g>
      ))}
      {tap.label}
      </svg>
      {tap.live}
    </>
  )
}

function foldSeries(series) {
  if (series.length <= 3) return series
  const head = series.slice(0, 2)
  const rest = series.slice(2)
  return [...head, { name: 'Other', values: rest[0].values.map((_, i) => rest.reduce((a, s) => a + s.values[i], 0)), other: true }]
}

function Stacked({ spec }) {
  const series = foldSeries(spec.series)
  const totals = spec.labels.map((_, i) => series.reduce((a, s) => a + s.values[i], 0))
  const max = niceMax(Math.max(...totals))
  const band = IW / spec.labels.length
  const bw = Math.min(24, band - 4)
  const tap = useTapLabel()
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" onClick={tap.clear}>
      <Axes max={max} labels={spec.labels} />
      {spec.labels.map((l, i) => {
        let base = PAD.t + IH
        const x = PAD.l + i * band + (band - bw) / 2
        return series.map((s, si) => {
          const h = (s.values[i] / max) * IH
          const top = si === series.length - 1
          base -= h
          // 2px surface gap between stacked segments
          const segH = Math.max(0, h - (si > 0 ? 2 : 0))
          const d = top ? columnPath(x, base, bw, segH) : `M${x},${base} h${bw} v${segH} h${-bw} Z`
          return (
            <path
              key={`${l}-${si}`}
              d={d}
              fill={s.other ? OTHER : SERIES[si]}
              {...tap.props(`${i}-${si}`, `${l} · ${s.name}: ${fmt(s.values[i])}`, { x: x + bw / 2, y: base })}
            >
              <title>{`${l}, ${s.name}: ${fmt(s.values[i])}`}</title>
            </path>
          )
        })
      })}
      {tap.label}
      </svg>
      {tap.live}
    </>
  )
}

function Pie({ spec }) {
  const total = spec.values.reduce((a, b) => a + b, 0) || 1
  const many = spec.values.length > 3
  const cx = W / 2
  const cy = H / 2
  const r = 58
  let a0 = -Math.PI / 2
  const tap = useTapLabel()
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" onClick={tap.clear}>
      {spec.values.map((v, i) => {
        const a1 = a0 + (v / total) * Math.PI * 2
        const large = a1 - a0 > Math.PI ? 1 : 0
        const d = `M${cx},${cy} L${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} A${r},${r} 0 ${large} 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)} Z`
        const mid = (a0 + a1) / 2
        a0 = a1
        return (
          <g key={i}>
            <path
              d={d}
              fill={many ? SERIES[0] : SERIES[i]}
              fillOpacity={many ? 0.55 + 0.45 * ((i % 3) / 2) : 1}
              stroke={SURFACE}
              strokeWidth="2"
              {...tap.props(i, `${spec.labels[i]}: ${fmt(v)} (${Math.round((v / total) * 100)}%)`, {
                x: cx + r * 0.6 * Math.cos(mid),
                y: cy + r * 0.6 * Math.sin(mid),
              })}
            >
              <title>{`${spec.labels[i]}: ${fmt(v)} (${Math.round((v / total) * 100)}%)`}</title>
            </path>
            {!many && (
              <text x={cx + (r + 12) * Math.cos(mid)} y={cy + (r + 12) * Math.sin(mid) + 3} textAnchor="middle" fontSize="8" fill="#cbd5e1">
                {Math.round((v / total) * 100)}%
              </text>
            )}
          </g>
        )
      })}
      {tap.label}
      </svg>
      {tap.live}
    </>
  )
}

function Scatter({ spec }) {
  const xs = spec.points.map((p) => p.x)
  const ys = spec.points.map((p) => p.y)
  const xMax = niceMax(Math.max(...xs))
  const yMax = niceMax(Math.max(...ys))
  const tap = useTapLabel()
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" onClick={tap.clear}>
      <Axes max={yMax} labels={[]} />
      <text x={PAD.l} y={H - 6} fontSize="8" fill="#94a3b8">
        0
      </text>
      <text x={W - PAD.r} y={H - 6} textAnchor="end" fontSize="8" fill="#94a3b8">
        {fmt(xMax)} {spec.xName ? `· ${spec.xName}` : ''}
      </text>
      {spec.points.map((p, i) => (
        <circle
          key={i}
          cx={PAD.l + (p.x / xMax) * IW}
          cy={PAD.t + IH - (p.y / yMax) * IH}
          r="4"
          fill={SERIES[0]}
          stroke={SURFACE}
          strokeWidth="2"
          {...tap.props(i, `${p.label}: ${fmt(p.x)} → ${fmt(p.y)}`, { x: PAD.l + (p.x / xMax) * IW, y: PAD.t + IH - (p.y / yMax) * IH })}
        >
          <title>{`${p.label}: ${fmt(p.x)} → ${fmt(p.y)}`}</title>
        </circle>
      ))}
      {tap.label}
      </svg>
      {tap.live}
    </>
  )
}

function Hist({ spec }) {
  const max = niceMax(Math.max(...spec.bins.map((b) => b.count)))
  const band = IW / spec.bins.length
  const tap = useTapLabel()
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" onClick={tap.clear}>
      <Axes max={max} labels={spec.bins.map((b) => b.label.split('–')[0])} />
      {spec.bins.map((b, i) => {
        const h = (b.count / max) * IH
        return (
          <path
            key={i}
            d={columnPath(PAD.l + i * band + 1, PAD.t + IH - Math.max(h, 2), band - 2, Math.max(h, 2))}
            fill={SERIES[0]}
            {...tap.props(i, `${b.label}: ${b.count} values`, { x: PAD.l + (i + 0.5) * band, y: PAD.t + IH - h })}
          >
            <title>{`${b.label}: ${b.count}`}</title>
          </path>
        )
      })}
      {tap.label}
      </svg>
      {tap.live}
    </>
  )
}

export function Legend({ names }) {
  if (names.length < 2) return null
  return (
    <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-slate-300">
      {names.map((n, i) => (
        <span key={n} className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: n === 'Other' ? OTHER : SERIES[i] }} />
          {n}
        </span>
      ))}
    </div>
  )
}

export default function MiniChart({ spec }) {
  switch (spec.kind) {
    case 'bars':
      return <Bars spec={spec} />
    case 'lines':
      return (
        <>
          <Lines spec={spec} />
          <Legend names={spec.series.slice(0, 3).map((s) => s.name)} />
        </>
      )
    case 'stacked':
      return (
        <>
          <Stacked spec={spec} />
          <Legend names={foldSeries(spec.series).map((s) => s.name)} />
        </>
      )
    case 'pie':
      return (
        <>
          <Pie spec={spec} />
          {spec.values.length <= 3 ? <Legend names={spec.labels} /> : <p className="text-center text-[10px] text-slate-500">{spec.values.length} slices</p>}
        </>
      )
    case 'scatter':
      return <Scatter spec={spec} />
    case 'hist':
      return <Hist spec={spec} />
    case 'counter': {
      const pct = spec.target ? spec.value / spec.target : null
      return (
        <div className="flex h-[150px] flex-col items-center justify-center text-center">
          <div className="text-3xl font-black text-white">
            {spec.unit === '$' || spec.unit === '$k' ? '$' : ''}
            {spec.value.toLocaleString()}
            {spec.unit === '$k' ? 'k' : spec.unit === '%' ? '%' : ''}
          </div>
          <div className="text-[11px] text-slate-400">{spec.caption}</div>
          {pct !== null && (
            <div className="mt-2 w-3/4">
              <div className="h-1.5 overflow-hidden rounded-full bg-ink">
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct * 100)}%`, background: SERIES[0] }} />
              </div>
              <div className="mt-1 text-[10px] text-slate-400">
                {Math.round(pct * 100)}% of ${spec.target.toLocaleString()}k target
              </div>
            </div>
          )}
        </div>
      )
    }
    case 'table':
      return (
        <div className="max-h-[150px] overflow-auto rounded-lg border border-line">
          <table className="w-full font-mono text-[9px]">
            <thead className="sticky top-0 bg-panel2">
              <tr>
                {spec.cols.map((c) => (
                  <th key={c} className="px-1.5 py-1 text-left text-slate-300">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {spec.rows.map((r, i) => (
                <tr key={i} className="odd:bg-ink/40">
                  {r.map((v, j) => (
                    <td key={j} className="px-1.5 py-0.5 text-slate-200">
                      {typeof v === 'number' ? v.toLocaleString() : v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    default:
      return (
        <div className="flex h-[150px] items-center justify-center rounded-lg border border-dashed border-line p-3 text-center text-[11px] text-slate-400">
          Can't draw this: {spec.reason}
        </div>
      )
  }
}
