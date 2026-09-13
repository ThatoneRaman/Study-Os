"use client"

import { Trophy, Lock } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { PageHeader, Progress, Badge } from "@/components/ui-bits"
import { useStore, studyMinutesByDay, computeStreak } from "@/lib/store"
import { toFa } from "@/lib/jalali"

interface Achievement {
  id: string
  title: string
  desc: string
  icon: string
  current: number
  target: number
}

export function AchievementsView() {
  const { state } = useStore()
  const byDay = studyMinutesByDay(state.sessions)
  const streak = computeStreak(state.sessions)
  const totalHours = Math.round(Object.values(byDay).reduce((a, b) => a + b, 0) / 60)
  const focusCount = state.sessions.filter((s) => s.type === "focus").length
  const testCount = state.tests.length
  const doneTasks = state.tasks.filter((t) => t.done).length
  const doneGoals = state.goals.filter((g) => g.done).length

  const achievements: Achievement[] = [
    { id: "first-step", title: "قدم اول", desc: "اولین جلسه پومودورو", icon: "🌱", current: focusCount, target: 1 },
    { id: "streak-3", title: "شروع خوب", desc: "۳ روز پیوسته مطالعه", icon: "🔥", current: streak, target: 3 },
    { id: "streak-7", title: "هفته طلایی", desc: "۷ روز پیوسته مطالعه", icon: "⚡", current: streak, target: 7 },
    { id: "streak-30", title: "استاد نظم", desc: "۳۰ روز پیوسته مطالعه", icon: "👑", current: streak, target: 30 },
    { id: "pomodoro-25", title: "تمرکز عمیق", desc: "۲۵ پومودورو کامل", icon: "🎯", current: focusCount, target: 25 },
    { id: "hours-50", title: "پشتکار", desc: "۵۰ ساعت مطالعه", icon: "⏳", current: totalHours, target: 50 },
    { id: "hours-100", title: "ماراتن‌کار", desc: "۱۰۰ ساعت مطالعه", icon: "🏃", current: totalHours, target: 100 },
    { id: "tests-10", title: "آزمون‌باز", desc: "۱۰ آزمون ثبت‌شده", icon: "📝", current: testCount, target: 10 },
    { id: "tasks-50", title: "کاربلد", desc: "۵۰ تسک تمام‌شده", icon: "✅", current: doneTasks, target: 50 },
    { id: "goals-3", title: "هدف‌شکن", desc: "۳ هدف تکمیل‌شده", icon: "🏆", current: doneGoals, target: 3 },
  ]

  const unlocked = achievements.filter((a) => a.current >= a.target).length

  return (
    <div>
      <PageHeader title="دستاوردها" subtitle="نشان‌هایی که با تلاش باز می‌شوند" icon={<Trophy className="size-5" />} />

      <GlassCard strong className="mb-6 flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-muted-foreground">نشان‌های باز شده</p>
          <p className="mt-1 text-3xl font-bold">
            {toFa(unlocked)} <span className="text-lg text-muted-foreground">از {toFa(achievements.length)}</span>
          </p>
        </div>
        <div className="w-40">
          <Progress value={(unlocked / achievements.length) * 100} />
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((a) => {
          const done = a.current >= a.target
          const pct = Math.min(100, Math.round((a.current / a.target) * 100))
          return (
            <GlassCard
              key={a.id}
              className={`p-5 transition-all ${done ? "ring-1 ring-primary/40" : "opacity-80"}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex size-12 items-center justify-center rounded-xl text-2xl ${
                    done ? "bg-primary/15" : "bg-muted grayscale"
                  }`}
                >
                  {done ? a.icon : <Lock className="size-5 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{a.title}</p>
                    {done ? <Badge tone="success">باز شد</Badge> : null}
                  </div>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
              </div>
              {!done ? (
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>
                      {toFa(Math.min(a.current, a.target))}/{toFa(a.target)}
                    </span>
                    <span>{toFa(pct)}٪</span>
                  </div>
                  <Progress value={pct} />
                </div>
              ) : null}
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
