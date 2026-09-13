"use client"

import { useState } from "react"
import { CalendarRange, ChevronLeft, ChevronRight, CheckCircle2, Circle } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { PageHeader, Badge } from "@/components/ui-bits"
import { useStore } from "@/lib/store"
import { addDays, dateKey, parseKey, toFa, todayKey, jalaliWeekday, FA_WEEKDAYS, formatJalali } from "@/lib/jalali"

function startOfWeek(key: string): string {
  const d = parseKey(key)
  const wd = jalaliWeekday(new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())))
  return addDays(key, -wd)
}

export function WeeklyPlanView() {
  const { state, toggleTask } = useStore()
  const [weekStart, setWeekStart] = useState(startOfWeek(todayKey()))
  const today = todayKey()

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const weekTasks = state.tasks.filter((t) => t.date >= weekStart && t.date <= addDays(weekStart, 6))
  const totalMin = weekTasks.reduce((a, t) => a + t.duration, 0)
  const doneMin = weekTasks.filter((t) => t.done).reduce((a, t) => a + t.duration, 0)

  return (
    <div>
      <PageHeader
        title="برنامه هفتگی"
        subtitle="نمای کلی هفت روز پیش‌رو"
        icon={<CalendarRange className="size-5" />}
      />

      <GlassCard className="mb-6 flex items-center justify-between p-3">
        <button
          onClick={() => setWeekStart((w) => addDays(w, 7))}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm hover:bg-accent"
        >
          <ChevronRight className="size-4" /> هفته بعد
        </button>
        <div className="text-center text-sm">
          <p className="font-semibold">
            {formatJalali(parseKey(weekStart), { withYear: false })} تا {formatJalali(parseKey(addDays(weekStart, 6)))}
          </p>
          <button onClick={() => setWeekStart(startOfWeek(today))} className="text-xs text-primary hover:underline">
            هفته جاری
          </button>
        </div>
        <button
          onClick={() => setWeekStart((w) => addDays(w, -7))}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm hover:bg-accent"
        >
          هفته قبل <ChevronLeft className="size-4" />
        </button>
      </GlassCard>

      <GlassCard className="mb-6 flex flex-wrap items-center gap-4 p-4 text-sm">
        <span className="text-muted-foreground">
          مجموع هفته: <span className="font-semibold text-foreground">{toFa(Math.round(totalMin / 60))} ساعت</span>
        </span>
        <span className="text-muted-foreground">
          انجام‌شده: <span className="font-semibold text-emerald-400">{toFa(Math.round(doneMin / 60))} ساعت</span>
        </span>
        <span className="text-muted-foreground">
          تعداد تسک: <span className="font-semibold text-foreground">{toFa(weekTasks.length)}</span>
        </span>
      </GlassCard>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
        {days.map((key, i) => {
          const dayTasks = state.tasks.filter((t) => t.date === key).sort((a, b) => a.time.localeCompare(b.time))
          const isToday = key === today
          const dayMin = dayTasks.reduce((a, t) => a + t.duration, 0)
          return (
            <GlassCard
              key={key}
              strong={isToday}
              className={`flex flex-col p-3 ${isToday ? "ring-2 ring-primary/50" : ""}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">{FA_WEEKDAYS[i]}</span>
                <span className="text-xs text-muted-foreground">
                  {toFa(parseKey(key).getDate())} {formatJalali(parseKey(key), { withYear: false }).split(" ")[1]}
                </span>
              </div>
              {dayMin > 0 ? <Badge tone="primary" className="mb-2 w-fit">{toFa(dayMin)} دقیقه</Badge> : null}
              <div className="flex-1 space-y-1.5">
                {dayTasks.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground/60">—</p>
                ) : (
                  dayTasks.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => toggleTask(t.id)}
                      className="flex w-full items-start gap-1.5 rounded-lg bg-background/30 p-2 text-right transition-colors hover:bg-accent"
                    >
                      {t.done ? (
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
                      ) : (
                        <Circle className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                      )}
                      <span className={`text-xs leading-tight ${t.done ? "text-muted-foreground line-through" : ""}`}>
                        {t.title}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
