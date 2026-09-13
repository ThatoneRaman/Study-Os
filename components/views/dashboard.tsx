"use client"

import { BookOpenCheck, Flame, Clock, Target, CheckCircle2, Circle, Bell, RefreshCw, TrendingUp } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { BarChart, Badge, Progress } from "@/components/ui-bits"
import { useStore, computeStreak, studyMinutesByDay, lastNDays } from "@/lib/store"
import { formatJalali, toFa, todayKey, FA_WEEKDAYS_SHORT, parseKey, jalaliWeekday } from "@/lib/jalali"

function StatTile({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  tone: string
}) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {sub ? <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p> : null}
        </div>
        <div className={`flex size-10 items-center justify-center rounded-xl ${tone}`}>{icon}</div>
      </div>
    </GlassCard>
  )
}

export function DashboardView({ onNavigate }: { onNavigate: (t: string) => void }) {
  const { state, toggleTask } = useStore()
  const today = todayKey()
  const byDay = studyMinutesByDay(state.sessions)
  const todayMinutes = byDay[today] ?? 0
  const streak = computeStreak(state.sessions)
  const goalMin = state.settings.dailyGoalMinutes

  const todayTasks = state.tasks.filter((t) => t.date === today)
  const doneTasks = todayTasks.filter((t) => t.done).length

  const dueReviews = state.reviews.filter((r) => r.nextReview <= today).length
  const totalCorrect = state.tests.reduce((a, t) => a + t.correct, 0)
  const totalAnswered = state.tests.reduce((a, t) => a + t.correct + t.wrong, 0)
  const accuracy = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0

  const upcomingReminders = state.reminders
    .filter((r) => !r.done)
    .sort((a, b) => a.datetime.localeCompare(b.datetime))
    .slice(0, 3)

  const chartData = lastNDays(7).map((k) => {
    const d = parseKey(k)
    return { label: FA_WEEKDAYS_SHORT[jalaliWeekday(new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())))], value: byDay[k] ?? 0, hint: formatJalali(d, { withYear: false }) }
  })

  const activeGoals = state.goals.filter((g) => !g.done).slice(0, 3)

  return (
    <div className="space-y-6">
      <GlassCard strong className="overflow-hidden p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{formatJalali(new Date(), { withWeekday: true })}</p>
            <h1 className="mt-1 text-3xl font-bold text-balance">سلام، وقت درس خوندنه</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              امروز {toFa(todayMinutes)} دقیقه از هدف {toFa(goalMin)} دقیقه‌ای مطالعه کردی
            </p>
          </div>
          <div className="relative flex size-24 items-center justify-center">
            <svg className="size-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                className="text-primary transition-all duration-700"
                strokeDasharray={2 * Math.PI * 42}
                strokeDashoffset={2 * Math.PI * 42 * (1 - Math.min(1, todayMinutes / goalMin))}
              />
            </svg>
            <span className="absolute text-lg font-bold">{toFa(Math.round((todayMinutes / goalMin) * 100))}٪</span>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          icon={<Flame className="size-5" />}
          label="استریک"
          value={`${toFa(streak)} روز`}
          sub="روزهای پیوسته"
          tone="bg-orange-500/15 text-orange-400"
        />
        <StatTile
          icon={<Clock className="size-5" />}
          label="مطالعه امروز"
          value={`${toFa(todayMinutes)}د`}
          sub={`هدف ${toFa(goalMin)} دقیقه`}
          tone="bg-primary/15 text-primary"
        />
        <StatTile
          icon={<TrendingUp className="size-5" />}
          label="میانگین دقت"
          value={`${toFa(accuracy)}٪`}
          sub={`${toFa(state.tests.length)} آزمون`}
          tone="bg-emerald-500/15 text-emerald-400"
        />
        <StatTile
          icon={<CheckCircle2 className="size-5" />}
          label="تسک‌های امروز"
          value={`${toFa(doneTasks)}/${toFa(todayTasks.length)}`}
          sub="انجام‌شده"
          tone="bg-sky-500/15 text-sky-400"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">مطالعه ۷ روز اخیر</h2>
            <Badge tone="primary">دقیقه</Badge>
          </div>
          <BarChart data={chartData} unit="دقیقه" />
        </GlassCard>

        <GlassCard className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">تسک‌های امروز</h2>
            <button onClick={() => onNavigate("daily")} className="text-xs text-primary hover:underline">
              همه
            </button>
          </div>
          <div className="space-y-2">
            {todayTasks.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">تسکی برای امروز نداری</p>
            ) : (
              todayTasks.slice(0, 5).map((t) => (
                <button
                  key={t.id}
                  onClick={() => toggleTask(t.id)}
                  className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-right transition-colors hover:bg-accent"
                >
                  {t.done ? (
                    <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />
                  ) : (
                    <Circle className="size-5 shrink-0 text-muted-foreground" />
                  )}
                  <span className={`flex-1 text-sm ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.title}</span>
                  <Badge tone="default">{t.subject}</Badge>
                </button>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="p-5">
          <button onClick={() => onNavigate("review")} className="mb-3 flex w-full items-center justify-between">
            <h2 className="font-semibold">مرور امروز</h2>
            <RefreshCw className="size-4 text-primary" />
          </button>
          <p className="text-3xl font-bold">{toFa(dueReviews)}</p>
          <p className="text-sm text-muted-foreground">کارت آماده مرور</p>
        </GlassCard>

        <GlassCard className="p-5">
          <button onClick={() => onNavigate("reminders")} className="mb-3 flex w-full items-center justify-between">
            <h2 className="font-semibold">یادآورها</h2>
            <Bell className="size-4 text-primary" />
          </button>
          <div className="space-y-2">
            {upcomingReminders.length === 0 ? (
              <p className="text-sm text-muted-foreground">یادآور فعالی نداری</p>
            ) : (
              upcomingReminders.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{r.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatJalali(new Date(r.datetime), { withYear: false })}
                  </span>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <button onClick={() => onNavigate("goals")} className="mb-3 flex w-full items-center justify-between">
            <h2 className="font-semibold">اهداف فعال</h2>
            <Target className="size-4 text-primary" />
          </button>
          <div className="space-y-3">
            {activeGoals.length === 0 ? (
              <p className="text-sm text-muted-foreground">هدف فعالی نداری</p>
            ) : (
              activeGoals.map((g) => {
                const pct = Math.round((g.current / g.target) * 100)
                return (
                  <div key={g.id}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="truncate">{g.title}</span>
                      <span className="text-muted-foreground">{toFa(pct)}٪</span>
                    </div>
                    <Progress value={pct} />
                  </div>
                )
              })
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
