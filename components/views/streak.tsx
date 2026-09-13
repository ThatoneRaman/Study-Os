"use client"

import { Flame } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { PageHeader, Badge } from "@/components/ui-bits"
import { useStore, studyMinutesByDay, computeStreak } from "@/lib/store"
import {
  toFa,
  todayKey,
  addDays,
  parseKey,
  gregorianOfJalali,
  jalaliMonthLength,
  jalaliMonthName,
  jalaliWeekday,
  toJalali,
  dateKey,
  FA_WEEKDAYS_SHORT,
} from "@/lib/jalali"

export function StreakView() {
  const { state } = useStore()
  const byDay = studyMinutesByDay(state.sessions)
  const streak = computeStreak(state.sessions)

  // longest streak across history
  const daysWith = Object.keys(byDay)
    .filter((k) => byDay[k] > 0)
    .sort()
  let longest = 0
  let run = 0
  let prev = ""
  for (const k of daysWith) {
    if (prev && addDays(prev, 1) === k) run++
    else run = 1
    longest = Math.max(longest, run)
    prev = k
  }

  const totalDays = daysWith.length
  const totalMin = Object.values(byDay).reduce((a, b) => a + b, 0)

  // current jalali month heat grid
  const now = new Date()
  const todayJ = toJalali(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())))
  const len = jalaliMonthLength(todayJ.year, todayJ.month)
  const first = gregorianOfJalali(todayJ.year, todayJ.month, 1)
  const firstWeekday = jalaliWeekday(first)
  const cells: ({ key: string; day: number } | null)[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= len; d++) {
    const g = gregorianOfJalali(todayJ.year, todayJ.month, d)
    cells.push({ key: dateKey(new Date(g.getUTCFullYear(), g.getUTCMonth(), g.getUTCDate())), day: d })
  }
  const goal = state.settings.dailyGoalMinutes

  function heat(min: number): string {
    if (min <= 0) return "bg-muted"
    const ratio = Math.min(1, min / goal)
    if (ratio < 0.34) return "bg-primary/30"
    if (ratio < 0.67) return "bg-primary/60"
    return "bg-primary"
  }

  return (
    <div>
      <PageHeader title="استریک" subtitle="روزهای پیوسته مطالعه‌ات" icon={<Flame className="size-5" />} />

      <GlassCard strong className="mb-6 flex flex-col items-center p-8">
        <div className="flex size-28 items-center justify-center rounded-full bg-gradient-to-br from-orange-500/30 to-primary/30">
          <Flame className="size-14 text-orange-400" />
        </div>
        <p className="mt-4 text-5xl font-bold">{toFa(streak)}</p>
        <p className="text-muted-foreground">روز پیوسته</p>
      </GlassCard>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <GlassCard className="p-4 text-center">
          <p className="text-xs text-muted-foreground">طولانی‌ترین استریک</p>
          <p className="mt-1 text-2xl font-bold text-orange-400">{toFa(longest)}</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-xs text-muted-foreground">کل روزهای مطالعه</p>
          <p className="mt-1 text-2xl font-bold">{toFa(totalDays)}</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-xs text-muted-foreground">مجموع ساعت</p>
          <p className="mt-1 text-2xl font-bold text-primary">{toFa(Math.round(totalMin / 60))}</p>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <h2 className="mb-4 font-semibold">
          نقشه فعالیت {jalaliMonthName(todayJ.month)} {toFa(todayJ.year)}
        </h2>
        <div className="mb-2 grid grid-cols-7 gap-1.5 text-center">
          {FA_WEEKDAYS_SHORT.map((w) => (
            <div key={w} className="text-xs font-medium text-muted-foreground">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((c, i) => {
            if (!c) return <div key={i} />
            const min = byDay[c.key] ?? 0
            const isToday = c.key === todayKey()
            return (
              <div
                key={c.key}
                title={`${toFa(c.day)}: ${toFa(min)} دقیقه`}
                className={`flex aspect-square items-center justify-center rounded-lg text-xs ${heat(min)} ${
                  isToday ? "ring-2 ring-primary" : ""
                } ${min > 0 ? "text-primary-foreground" : "text-muted-foreground"}`}
              >
                {toFa(c.day)}
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <span>کم</span>
          <span className="size-3 rounded bg-muted" />
          <span className="size-3 rounded bg-primary/30" />
          <span className="size-3 rounded bg-primary/60" />
          <span className="size-3 rounded bg-primary" />
          <span>زیاد</span>
        </div>
      </GlassCard>
    </div>
  )
}
