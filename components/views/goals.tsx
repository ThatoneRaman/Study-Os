"use client"

import { useState } from "react"
import { Target, Plus, Trash2, Minus, CheckCircle2 } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { PageHeader, Button, Input, Select, Field, Badge, IconButton, EmptyState, Progress } from "@/components/ui-bits"
import { useStore } from "@/lib/store"
import { formatJalali, parseKey, toFa, todayKey, diffDays } from "@/lib/jalali"

export function GoalsView() {
  const { state, addGoal, updateGoal, removeGoal } = useStore()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [target, setTarget] = useState(100)
  const [unit, setUnit] = useState("تست")
  const [deadline, setDeadline] = useState(todayKey())

  function submit() {
    if (!title.trim()) return
    addGoal({ title: title.trim(), subject: subject || undefined, target: Number(target) || 1, current: 0, unit, deadline })
    setTitle("")
    setOpen(false)
  }

  const active = state.goals.filter((g) => !g.done)
  const done = state.goals.filter((g) => g.done)

  return (
    <div>
      <PageHeader
        title="هدف‌گذاری"
        subtitle="اهداف مطالعاتی‌ات را تعیین و دنبال کن"
        icon={<Target className="size-5" />}
        action={
          <Button onClick={() => setOpen((o) => !o)}>
            <Plus className="size-4" /> هدف جدید
          </Button>
        }
      />

      {open ? (
        <GlassCard strong className="mb-6 p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="عنوان هدف">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً حل ۵۰۰ تست" />
            </Field>
            <Field label="درس (اختیاری)">
              <Select value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="">عمومی</option>
                {state.subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="مقدار هدف">
              <Input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} />
            </Field>
            <Field label="واحد">
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="تست / ساعت / فصل" />
            </Field>
            <Field label="مهلت">
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
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
          <EmptyState icon={<Target className="size-8" />} title="هنوز هدفی تعیین نشده" hint="اولین هدفت را مشخص کن" />
        ) : null}

        {active.map((g) => {
          const pct = Math.round((g.current / g.target) * 100)
          const daysLeft = diffDays(g.deadline, todayKey())
          return (
            <GlassCard key={g.id} className="p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{g.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    {g.subject ? <Badge tone="primary">{g.subject}</Badge> : <Badge tone="default">عمومی</Badge>}
                    <Badge tone={daysLeft < 0 ? "danger" : daysLeft <= 3 ? "warning" : "default"}>
                      {daysLeft < 0 ? `${toFa(-daysLeft)} روز گذشته` : `${toFa(daysLeft)} روز مانده`}
                    </Badge>
                    <span className="text-muted-foreground">تا {formatJalali(parseKey(g.deadline), { withYear: false })}</span>
                  </div>
                </div>
                <IconButton onClick={() => removeGoal(g.id)} className="hover:text-destructive">
                  <Trash2 className="size-4" />
                </IconButton>
              </div>

              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {toFa(g.current)} از {toFa(g.target)} {g.unit}
                </span>
                <span className="font-semibold text-primary">{toFa(pct)}٪</span>
              </div>
              <Progress value={pct} className="mb-3" />

              <div className="flex items-center gap-2">
                <IconButton
                  onClick={() => updateGoal(g.id, { current: Math.max(0, g.current - 1) })}
                  className="border border-border"
                >
                  <Minus className="size-4" />
                </IconButton>
                <IconButton
                  onClick={() => updateGoal(g.id, { current: g.current + 1 })}
                  className="border border-border"
                >
                  <Plus className="size-4" />
                </IconButton>
                <Button variant="outline" className="ms-auto" onClick={() => updateGoal(g.id, { current: g.target })}>
                  تکمیل شد
                </Button>
              </div>
            </GlassCard>
          )
        })}

        {done.length > 0 ? (
          <>
            <h2 className="mb-2 mt-6 font-semibold text-muted-foreground">اهداف تکمیل‌شده</h2>
            {done.map((g) => (
              <GlassCard key={g.id} className="flex items-center gap-3 p-4 opacity-70">
                <CheckCircle2 className="size-5 text-emerald-400" />
                <span className="flex-1 line-through">{g.title}</span>
                <Badge tone="success">تکمیل</Badge>
                <IconButton onClick={() => removeGoal(g.id)} className="hover:text-destructive">
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
