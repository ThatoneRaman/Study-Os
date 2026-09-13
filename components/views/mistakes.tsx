"use client"

import { useState } from "react"
import { XCircle, Plus, Trash2, CheckCircle2, RotateCcw } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { PageHeader, Button, Input, Textarea, Select, Field, Badge, IconButton, EmptyState, Progress } from "@/components/ui-bits"
import { useStore } from "@/lib/store"
import { formatJalali, parseKey, toFa } from "@/lib/jalali"
import type { MistakeReason } from "@/lib/types"

const reasonLabel: Record<MistakeReason, string> = {
  careless: "بی‌دقتی",
  concept: "نقص مفهومی",
  time: "کمبود وقت",
  misread: "بدخوانی سوال",
  guess: "حدس اشتباه",
}
const reasonTone: Record<MistakeReason, "default" | "warning" | "danger" | "primary" | "success"> = {
  careless: "warning",
  concept: "danger",
  time: "primary",
  misread: "default",
  guess: "success",
}

export function MistakesView() {
  const { state, addMistake, toggleMistake, removeMistake } = useStore()
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState(state.subjects[0] ?? "")
  const [topic, setTopic] = useState("")
  const [description, setDescription] = useState("")
  const [reason, setReason] = useState<MistakeReason>("concept")
  const [filter, setFilter] = useState<"all" | "open">("all")

  function submit() {
    if (!topic.trim()) return
    addMistake({ subject, topic: topic.trim(), description: description.trim(), reason, date: new Date().toISOString().slice(0, 10) })
    setTopic("")
    setDescription("")
    setOpen(false)
  }

  const list = state.mistakes.filter((m) => (filter === "open" ? !m.resolved : true)).sort((a, b) => b.date.localeCompare(a.date))

  // reason distribution
  const dist: Record<string, number> = {}
  for (const m of state.mistakes) dist[m.reason] = (dist[m.reason] ?? 0) + 1
  const total = state.mistakes.length
  const resolved = state.mistakes.filter((m) => m.resolved).length

  return (
    <div>
      <PageHeader
        title="تحلیل اشتباهات"
        subtitle="دفتر اشتباهات برای نزدن دوباره یک خطا"
        icon={<XCircle className="size-5" />}
        action={
          <Button onClick={() => setOpen((o) => !o)}>
            <Plus className="size-4" /> ثبت اشتباه
          </Button>
        }
      />

      {total > 0 ? (
        <div className="mb-6 grid gap-6 lg:grid-cols-3">
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">کل اشتباهات</p>
            <p className="mt-1 text-2xl font-bold">{toFa(total)}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">رفع‌شده</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">
              {toFa(resolved)} <span className="text-sm text-muted-foreground">({toFa(Math.round((resolved / total) * 100))}٪)</span>
            </p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="mb-2 text-xs text-muted-foreground">پرتکرارترین علت</p>
            {(() => {
              const top = Object.entries(dist).sort((a, b) => b[1] - a[1])[0]
              return top ? (
                <Badge tone={reasonTone[top[0] as MistakeReason]}>{reasonLabel[top[0] as MistakeReason]}</Badge>
              ) : null
            })()}
          </GlassCard>
        </div>
      ) : null}

      {total > 0 ? (
        <GlassCard className="mb-6 p-5">
          <h2 className="mb-4 font-semibold">توزیع علت اشتباهات</h2>
          <div className="space-y-3">
            {Object.entries(dist)
              .sort((a, b) => b[1] - a[1])
              .map(([r, count]) => (
                <div key={r}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>{reasonLabel[r as MistakeReason]}</span>
                    <span className="text-muted-foreground">{toFa(count)} مورد</span>
                  </div>
                  <Progress value={(count / total) * 100} />
                </div>
              ))}
          </div>
        </GlassCard>
      ) : null}

      {open ? (
        <GlassCard strong className="mb-6 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="درس">
              <Select value={subject} onChange={(e) => setSubject(e.target.value)}>
                {state.subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="مبحث / سوال">
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="مثلاً مشتق تابع مرکب" />
            </Field>
            <Field label="علت اشتباه">
              <Select value={reason} onChange={(e) => setReason(e.target.value as MistakeReason)}>
                {Object.entries(reasonLabel).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="توضیح (اختیاری)">
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="چرا اشتباه شد؟" />
            </Field>
            <div className="sm:col-span-2">
              <Button onClick={submit} className="w-full">
                ثبت در دفتر اشتباهات
              </Button>
            </div>
          </div>
        </GlassCard>
      ) : null}

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-4 py-1.5 text-sm ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-background/40 hover:bg-accent"}`}
        >
          همه
        </button>
        <button
          onClick={() => setFilter("open")}
          className={`rounded-full px-4 py-1.5 text-sm ${filter === "open" ? "bg-primary text-primary-foreground" : "bg-background/40 hover:bg-accent"}`}
        >
          رفع‌نشده
        </button>
      </div>

      <div className="space-y-3">
        {list.length === 0 ? (
          <EmptyState icon={<XCircle className="size-8" />} title="اشتباهی ثبت نشده" hint="هر اشتباه یک فرصت یادگیری است" />
        ) : (
          list.map((m) => (
            <GlassCard key={m.id} className={`p-4 ${m.resolved ? "opacity-70" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="primary">{m.subject}</Badge>
                    <Badge tone={reasonTone[m.reason]}>{reasonLabel[m.reason]}</Badge>
                    {m.resolved ? <Badge tone="success">رفع‌شده</Badge> : null}
                    <span className="text-xs text-muted-foreground">{formatJalali(parseKey(m.date), { withYear: false })}</span>
                  </div>
                  <p className={`mt-2 font-medium ${m.resolved ? "line-through" : ""}`}>{m.topic}</p>
                  {m.description ? <p className="mt-1 text-sm text-muted-foreground">{m.description}</p> : null}
                </div>
                <div className="flex shrink-0 gap-1">
                  <IconButton onClick={() => toggleMistake(m.id)} className={m.resolved ? "text-amber-400" : "text-emerald-400"}>
                    {m.resolved ? <RotateCcw className="size-4" /> : <CheckCircle2 className="size-4" />}
                  </IconButton>
                  <IconButton onClick={() => removeMistake(m.id)} className="hover:text-destructive">
                    <Trash2 className="size-4" />
                  </IconButton>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  )
}
