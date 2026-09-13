"use client"

import { useState } from "react"
import { Bell, Plus, Trash2, CheckCircle2, Circle, Clock } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { PageHeader, Button, Input, Field, Badge, IconButton, EmptyState } from "@/components/ui-bits"
import { useStore } from "@/lib/store"
import { formatJalali, toFa } from "@/lib/jalali"

export function RemindersView() {
  const { state, addReminder, toggleReminder, removeReminder } = useStore()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [datetime, setDatetime] = useState(() => new Date(Date.now() + 3600000).toISOString().slice(0, 16))

  function submit() {
    if (!title.trim()) return
    addReminder({ title: title.trim(), datetime })
    setTitle("")
    setOpen(false)
  }

  const now = Date.now()
  const items = [...state.reminders].sort((a, b) => a.datetime.localeCompare(b.datetime))
  const active = items.filter((r) => !r.done)
  const done = items.filter((r) => r.done)

  function timeLabel(dt: string): { text: string; tone: "danger" | "warning" | "default" } {
    const diff = new Date(dt).getTime() - now
    if (diff < 0) return { text: "گذشته", tone: "danger" }
    const hours = Math.round(diff / 3600000)
    if (hours < 24) return { text: `${toFa(hours)} ساعت دیگر`, tone: "warning" }
    return { text: `${toFa(Math.round(hours / 24))} روز دیگر`, tone: "default" }
  }

  return (
    <div>
      <PageHeader
        title="یادآورها"
        subtitle="رویدادها و کارهای مهم را فراموش نکن"
        icon={<Bell className="size-5" />}
        action={
          <Button onClick={() => setOpen((o) => !o)}>
            <Plus className="size-4" /> یادآور جدید
          </Button>
        }
      />

      {open ? (
        <GlassCard strong className="mb-6 p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="عنوان">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً آزمون آزمایشی" />
            </Field>
            <Field label="تاریخ و ساعت">
              <Input type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} />
            </Field>
            <div className="flex items-end">
              <Button onClick={submit} className="w-full">
                افزودن
              </Button>
            </div>
          </div>
        </GlassCard>
      ) : null}

      <div className="space-y-3">
        {active.length === 0 && done.length === 0 ? (
          <EmptyState icon={<Bell className="size-8" />} title="یادآوری ثبت نشده" hint="اولین یادآورت را اضافه کن" />
        ) : null}

        {active.map((r) => {
          const label = timeLabel(r.datetime)
          const d = new Date(r.datetime)
          return (
            <GlassCard key={r.id} className="flex items-center gap-3 p-4">
              <button onClick={() => toggleReminder(r.id)}>
                <Circle className="size-6 text-muted-foreground" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{r.title}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  <span>
                    {formatJalali(d, { withWeekday: true })} — {toFa(d.toTimeString().slice(0, 5))}
                  </span>
                </div>
              </div>
              <Badge tone={label.tone}>{label.text}</Badge>
              <IconButton onClick={() => removeReminder(r.id)} className="hover:text-destructive">
                <Trash2 className="size-4" />
              </IconButton>
            </GlassCard>
          )
        })}

        {done.length > 0 ? (
          <>
            <h2 className="mb-2 mt-6 font-semibold text-muted-foreground">انجام‌شده</h2>
            {done.map((r) => (
              <GlassCard key={r.id} className="flex items-center gap-3 p-4 opacity-60">
                <button onClick={() => toggleReminder(r.id)}>
                  <CheckCircle2 className="size-6 text-emerald-400" />
                </button>
                <span className="flex-1 line-through">{r.title}</span>
                <IconButton onClick={() => removeReminder(r.id)} className="hover:text-destructive">
                  <Trash2 className="size-4" />
                </IconButton>
              </GlassCard>
            ))}
          </>
        ) : null}
      </div>
    </div>
  )
}
