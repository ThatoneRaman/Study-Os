"use client"

import { useMemo, useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { PageHeader, Badge, Button } from "@/components/ui-bits"
import { useStore } from "@/lib/store"
import {
  FA_WEEKDAYS_SHORT,
  gregorianOfJalali,
  jalaliMonthLength,
  jalaliMonthName,
  jalaliWeekday,
  toJalali,
  toFa,
  dateKey,
  todayKey,
  formatJalali,
  parseKey,
} from "@/lib/jalali"

export function CalendarView() {
  const { state } = useStore()
  const todayJ = toJalali(new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())))
  const [ym, setYm] = useState({ y: todayJ.year, m: todayJ.month })
  const [selected, setSelected] = useState<string>(todayKey())

  const grid = useMemo(() => {
    const len = jalaliMonthLength(ym.y, ym.m)
    const first = gregorianOfJalali(ym.y, ym.m, 1)
    const firstWeekday = jalaliWeekday(first)
    const cells: ({ key: string; day: number } | null)[] = []
    for (let i = 0; i < firstWeekday; i++) cells.push(null)
    for (let d = 1; d <= len; d++) {
      const g = gregorianOfJalali(ym.y, ym.m, d)
      // convert UTC-based date to a local date key
      cells.push({ key: dateKey(new Date(g.getUTCFullYear(), g.getUTCMonth(), g.getUTCDate())), day: d })
    }
    return cells
  }, [ym])

  const marks = useMemo(() => {
    const map: Record<string, { tasks: number; tests: number; reviews: number }> = {}
    const ensure = (k: string) => (map[k] ??= { tasks: 0, tests: 0, reviews: 0 })
    for (const t of state.tasks) ensure(t.date).tasks++
    for (const t of state.tests) ensure(t.date).tests++
    for (const r of state.reviews) ensure(r.nextReview).reviews++
    return map
  }, [state.tasks, state.tests, state.reviews])

  function shift(delta: number) {
    setYm((cur) => {
      let m = cur.m + delta
      let y = cur.y
      if (m < 1) {
        m = 12
        y--
      } else if (m > 12) {
        m = 1
        y++
      }
      return { y, m }
    })
  }

  const today = todayKey()
  const selDate = parseKey(selected)
  const dayTasks = state.tasks.filter((t) => t.date === selected)
  const dayTests = state.tests.filter((t) => t.date === selected)
  const dayReviews = state.reviews.filter((r) => r.nextReview === selected)

  return (
    <div>
      <PageHeader title="تقویم شمسی" subtitle="نمای ماهانه فعالیت‌ها" icon={<CalendarDays className="size-5" />} />

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={() => shift(1)} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm hover:bg-accent">
              <ChevronRight className="size-4" /> بعد
            </button>
            <h2 className="text-lg font-bold">
              {jalaliMonthName(ym.m)} {toFa(ym.y)}
            </h2>
            <button onClick={() => shift(-1)} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm hover:bg-accent">
              قبل <ChevronLeft className="size-4" />
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1.5 text-center">
            {FA_WEEKDAYS_SHORT.map((w) => (
              <div key={w} className="py-1 text-xs font-medium text-muted-foreground">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {grid.map((cell, i) => {
              if (!cell) return <div key={i} />
              const mark = marks[cell.key]
              const isToday = cell.key === today
              const isSelected = cell.key === selected
              return (
                <button
                  key={cell.key}
                  onClick={() => setSelected(cell.key)}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold"
                      : isToday
                        ? "bg-primary/15 text-primary font-semibold"
                        : "hover:bg-accent"
                  }`}
                >
                  {toFa(cell.day)}
                  {mark ? (
                    <span className="absolute bottom-1.5 flex gap-0.5">
                      {mark.tasks ? <span className="size-1 rounded-full bg-sky-400" /> : null}
                      {mark.tests ? <span className="size-1 rounded-full bg-emerald-400" /> : null}
                      {mark.reviews ? <span className="size-1 rounded-full bg-amber-400" /> : null}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-sky-400" /> تسک</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-400" /> آزمون</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-400" /> مرور</span>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="mb-1 font-semibold">{formatJalali(selDate, { withWeekday: true })}</h3>
          <p className="mb-4 text-xs text-muted-foreground">جزئیات روز انتخاب‌شده</p>

          <div className="space-y-4">
            <div>
              <Badge tone="default" className="mb-2">تسک‌ها ({toFa(dayTasks.length)})</Badge>
              {dayTasks.length ? (
                dayTasks.map((t) => (
                  <div key={t.id} className="mb-1 rounded-lg bg-background/30 px-3 py-2 text-sm">
                    <span className="ml-2">{toFa(t.time)}</span>
                    {t.title}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground/60">—</p>
              )}
            </div>
            <div>
              <Badge tone="success" className="mb-2">آزمون‌ها ({toFa(dayTests.length)})</Badge>
              {dayTests.length ? (
                dayTests.map((t) => (
                  <div key={t.id} className="mb-1 rounded-lg bg-background/30 px-3 py-2 text-sm">
                    {t.subject} — {toFa(t.correct)}/{toFa(t.total)}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground/60">—</p>
              )}
            </div>
            <div>
              <Badge tone="warning" className="mb-2">مرورها ({toFa(dayReviews.length)})</Badge>
              {dayReviews.length ? (
                dayReviews.map((r) => (
                  <div key={r.id} className="mb-1 rounded-lg bg-background/30 px-3 py-2 text-sm">
                    {r.subject} — {r.topic}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground/60">—</p>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
