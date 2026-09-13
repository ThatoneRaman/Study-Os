"use client"

import { useState } from "react"
import { CalendarDays, Plus, Trash2, CheckCircle2, Circle, ChevronLeft, ChevronRight } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { PageHeader, Button, Input, Select, Field, Badge, IconButton, EmptyState } from "@/components/ui-bits"
import { useStore } from "@/lib/store"
import { formatJalali, toFa, todayKey, addDays } from "@/lib/jalali"

const priorityTone = { high: "danger", medium: "warning", low: "success" } as const
const priorityLabel = { high: "زیاد", medium: "متوسط", low: "کم" } as const

export function DailyPlanView() {
  const { state, addTask, toggleTask, removeTask } = useStore()
  const [day, setDay] = useState(todayKey())
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState(state.subjects[0] ?? "")
  const [time, setTime] = useState("08:00")
  const [duration, setDuration] = useState(60)
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")

  const tasks = state.tasks
    .filter((t) => t.date === day)
    .sort((a, b) => a.time.localeCompare(b.time))

  const totalMin = tasks.reduce((a, t) => a + t.duration, 0)
  const doneMin = tasks.filter((t) => t.done).reduce((a, t) => a + t.duration, 0)

  function submit() {
    if (!title.trim()) return
    addTask({ title: title.trim(), subject, time, duration: Number(duration) || 0, priority, date: day })
    setTitle("")
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="برنامه روزانه"
        subtitle="تسک‌های مطالعه روزت را برنامه‌ریزی کن"
        icon={<CalendarDays className="size-5" />}
        action={
          <Button onClick={() => setOpen((o) => !o)}>
            <Plus className="size-4" /> تسک جدید
          </Button>
        }
      />

      <GlassCard className="mb-6 flex items-center justify-between p-3">
        <IconButton onClick={() => setDay((d) => addDays(d, 1))}>
          <ChevronRight className="size-5" />
        </IconButton>
        <div className="text-center">
          <p className="font-semibold">{formatJalali(new Date(day.replace(/-/g, "/")), { withWeekday: true })}</p>
          <button onClick={() => setDay(todayKey())} className="text-xs text-primary hover:underline">
            برو به امروز
          </button>
        </div>
        <IconButton onClick={() => setDay((d) => addDays(d, -1))}>
          <ChevronLeft className="size-5" />
        </IconButton>
      </GlassCard>

      {open ? (
        <GlassCard strong className="mb-6 p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="عنوان تسک">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً حل تست فصل ۲" />
            </Field>
            <Field label="درس">
              <Select value={subject} onChange={(e) => setSubject(e.target.value)}>
                {state.subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="ساعت شروع">
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </Field>
            <Field label="مدت (دقیقه)">
              <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
            </Field>
            <Field label="اولویت">
              <Select value={priority} onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}>
                <option value="high">زیاد</option>
                <option value="medium">متوسط</option>
                <option value="low">کم</option>
              </Select>
            </Field>
            <div className="flex items-end">
              <Button onClick={submit} className="w-full">
                افزودن
              </Button>
            </div>
          </div>
        </GlassCard>
      ) : null}

      {tasks.length > 0 ? (
        <GlassCard className="mb-4 flex flex-wrap items-center gap-4 p-4 text-sm">
          <span className="text-muted-foreground">
            مجموع برنامه: <span className="font-semibold text-foreground">{toFa(totalMin)} دقیقه</span>
          </span>
          <span className="text-muted-foreground">
            انجام‌شده: <span className="font-semibold text-emerald-400">{toFa(doneMin)} دقیقه</span>
          </span>
        </GlassCard>
      ) : null}

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <EmptyState icon={<CalendarDays className="size-8" />} title="برای این روز تسکی ثبت نشده" hint="با دکمه «تسک جدید» شروع کن" />
        ) : (
          tasks.map((t) => (
            <GlassCard key={t.id} className="flex items-center gap-3 p-4">
              <button onClick={() => toggleTask(t.id)} className="shrink-0">
                {t.done ? (
                  <CheckCircle2 className="size-6 text-emerald-400" />
                ) : (
                  <Circle className="size-6 text-muted-foreground" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p className={`font-medium ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{toFa(t.time)}</span>
                  <span>•</span>
                  <span>{toFa(t.duration)} دقیقه</span>
                </div>
              </div>
              <Badge tone="primary">{t.subject}</Badge>
              <Badge tone={priorityTone[t.priority]}>{priorityLabel[t.priority]}</Badge>
              <IconButton onClick={() => removeTask(t.id)} className="hover:text-destructive">
                <Trash2 className="size-4" />
              </IconButton>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  )
}
