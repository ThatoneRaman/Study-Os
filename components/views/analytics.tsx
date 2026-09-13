"use client"

import { LineChart as LineChartIcon, TrendingUp, TrendingDown } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { PageHeader, Badge, Progress } from "@/components/ui-bits"
import { useStore } from "@/lib/store"
import { formatJalali, parseKey, toFa } from "@/lib/jalali"

function percent(t: { correct: number; wrong: number; total: number }): number {
  if (!t.total) return 0
  return Math.round(((t.correct * 3 - t.wrong) / (t.total * 3)) * 100)
}

export function AnalyticsView() {
  const { state } = useStore()
  const tests = [...state.tests].sort((a, b) => a.date.localeCompare(b.date))

  // accuracy trend line (SVG polyline)
  const points = tests.map((t) => ({ x: t.date, y: Math.max(0, percent(t)) }))
  const w = 640
  const h = 200
  const pad = 24
  const maxY = 100
  const stepX = points.length > 1 ? (w - pad * 2) / (points.length - 1) : 0
  const coords = points.map((p, i) => {
    const x = pad + i * stepX
    const y = h - pad - (p.y / maxY) * (h - pad * 2)
    return { x, y, ...p }
  })
  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ")
  const areaPath =
    coords.length > 0 ? `${path} L${coords[coords.length - 1].x},${h - pad} L${coords[0].x},${h - pad} Z` : ""

  // per subject accuracy
  const subjectStats: Record<string, { correct: number; wrong: number; total: number; count: number }> = {}
  for (const t of state.tests) {
    const s = (subjectStats[t.subject] ??= { correct: 0, wrong: 0, total: 0, count: 0 })
    s.correct += t.correct
    s.wrong += t.wrong
    s.total += t.total
    s.count++
  }
  const subjectEntries = Object.entries(subjectStats)
    .map(([subject, s]) => ({ subject, pct: Math.max(0, percent(s)), count: s.count }))
    .sort((a, b) => b.pct - a.pct)

  // trend: compare last vs first half
  const half = Math.floor(points.length / 2)
  const firstAvg = half ? points.slice(0, half).reduce((a, p) => a + p.y, 0) / half : 0
  const lastAvg = points.length - half ? points.slice(half).reduce((a, p) => a + p.y, 0) / (points.length - half) : 0
  const delta = Math.round(lastAvg - firstAvg)

  const best = subjectEntries[0]
  const worst = subjectEntries[subjectEntries.length - 1]

  return (
    <div>
      <PageHeader title="Analytics" subtitle="تحلیل روند و مقایسه عملکرد" icon={<LineChartIcon className="size-5" />} />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">روند دقت</p>
          <p className={`mt-1 flex items-center gap-2 text-2xl font-bold ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {delta >= 0 ? <TrendingUp className="size-5" /> : <TrendingDown className="size-5" />}
            {toFa(Math.abs(delta))}٪
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{delta >= 0 ? "رو به بهبود" : "نیازمند توجه"}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">بهترین درس</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">{best?.subject ?? "—"}</p>
          {best ? <p className="mt-0.5 text-xs text-muted-foreground">{toFa(best.pct)}٪ میانگین</p> : null}
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">ضعیف‌ترین درس</p>
          <p className="mt-1 text-2xl font-bold text-amber-400">{worst?.subject ?? "—"}</p>
          {worst ? <p className="mt-0.5 text-xs text-muted-foreground">{toFa(worst.pct)}٪ میانگین</p> : null}
        </GlassCard>
      </div>

      <GlassCard className="mb-6 p-5">
        <h2 className="mb-4 font-semibold">روند درصد آزمون‌ها</h2>
        {coords.length < 2 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">برای نمایش روند حداقل به دو آزمون نیاز است</p>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ minWidth: 480 }}>
              <defs>
                <linearGradient id="acc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 25, 50, 75, 100].map((g) => {
                const y = h - pad - (g / maxY) * (h - pad * 2)
                return (
                  <g key={g}>
                    <line x1={pad} y1={y} x2={w - pad} y2={y} className="stroke-border" strokeDasharray="4 4" />
                    <text x={w - pad + 2} y={y + 3} className="fill-muted-foreground text-[9px]">
                      {toFa(g)}
                    </text>
                  </g>
                )
              })}
              <path d={areaPath} fill="url(#acc)" />
              <path d={path} fill="none" className="stroke-primary" strokeWidth="2.5" strokeLinejoin="round" />
              {coords.map((c, i) => (
                <circle key={i} cx={c.x} cy={c.y} r="3.5" className="fill-primary" />
              ))}
            </svg>
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-5">
        <h2 className="mb-4 font-semibold">میانگین دقت به تفکیک درس</h2>
        {subjectEntries.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">هنوز آزمونی ثبت نشده</p>
        ) : (
          <div className="space-y-3">
            {subjectEntries.map((s) => (
              <div key={s.subject}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>
                    {s.subject} <span className="text-xs text-muted-foreground">({toFa(s.count)} آزمون)</span>
                  </span>
                  <Badge tone={s.pct >= 60 ? "success" : s.pct >= 40 ? "warning" : "danger"}>{toFa(s.pct)}٪</Badge>
                </div>
                <Progress value={s.pct} />
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
