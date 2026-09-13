"use client"

import { BarChart3 } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { PageHeader, BarChart, Progress, Badge } from "@/components/ui-bits"
import { useStore, studyMinutesByDay, lastNDays, computeStreak } from "@/lib/store"
import { toFa, parseKey, FA_WEEKDAYS_SHORT, jalaliWeekday } from "@/lib/jalali"

export function StatsView() {
  const { state } = useStore()
  const byDay = studyMinutesByDay(state.sessions)

  const days30 = lastNDays(30)
  const total30 = days30.reduce((a, k) => a + (byDay[k] ?? 0), 0)
  const activeDays = days30.filter((k) => (byDay[k] ?? 0) > 0).length
  const avgPerActive = activeDays ? Math.round(total30 / activeDays) : 0

  // per-subject minutes
  const subjectMinutes: Record<string, number> = {}
  for (const s of state.sessions) {
    if (s.type !== "focus") continue
    subjectMinutes[s.subject] = (subjectMinutes[s.subject] ?? 0) + s.durationMin
  }
  const subjectEntries = Object.entries(subjectMinutes).sort((a, b) => b[1] - a[1])
  const maxSubject = Math.max(1, ...subjectEntries.map((e) => e[1]))

  const last14 = lastNDays(14).map((k) => {
    const d = parseKey(k)
    return {
      label: FA_WEEKDAYS_SHORT[jalaliWeekday(new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())))],
      value: byDay[k] ?? 0,
    }
  })

  const totalTasks = state.tasks.length
  const doneTasks = state.tasks.filter((t) => t.done).length
  const taskRate = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <div>
      <PageHeader title="آمار" subtitle="نمای کلی عملکرد مطالعه" icon={<BarChart3 className="size-5" />} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { l: "مطالعه ۳۰ روز", v: `${toFa(Math.round(total30 / 60))} ساعت` },
          { l: "روزهای فعال", v: `${toFa(activeDays)} روز` },
          { l: "میانگین روز فعال", v: `${toFa(avgPerActive)} دقیقه` },
          { l: "استریک فعلی", v: `${toFa(computeStreak(state.sessions))} روز` },
        ].map((s) => (
          <GlassCard key={s.l} className="p-4">
            <p className="text-xs text-muted-foreground">{s.l}</p>
            <p className="mt-1 text-2xl font-bold">{s.v}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="p-5 lg:col-span-2">
          <h2 className="mb-4 font-semibold">مطالعه ۱۴ روز اخیر (دقیقه)</h2>
          <BarChart data={last14} unit="دقیقه" height={200} />
        </GlassCard>

        <GlassCard className="p-5">
          <h2 className="mb-4 font-semibold">پیشرفت تسک‌ها</h2>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative flex size-32 items-center justify-center">
              <svg className="size-32 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" strokeWidth="9" className="stroke-muted" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  strokeWidth="9"
                  strokeLinecap="round"
                  className="stroke-primary transition-all duration-700"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - taskRate / 100)}
                />
              </svg>
              <span className="absolute text-2xl font-bold">{toFa(taskRate)}٪</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {toFa(doneTasks)} از {toFa(totalTasks)} تسک انجام شده
            </p>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-6 p-5">
        <h2 className="mb-4 font-semibold">توزیع زمان به تفکیک درس</h2>
        {subjectEntries.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">هنوز داده‌ای ثبت نشده</p>
        ) : (
          <div className="space-y-3">
            {subjectEntries.map(([subject, minutes]) => (
              <div key={subject}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{subject}</span>
                  <Badge tone="primary">{toFa(Math.round(minutes / 60))} ساعت {toFa(minutes % 60)} دقیقه</Badge>
                </div>
                <Progress value={(minutes / maxSubject) * 100} />
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
