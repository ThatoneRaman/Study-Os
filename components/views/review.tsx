"use client"

import { useState } from "react"
import { RefreshCw, Plus, Trash2, Check, X } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { PageHeader, Button, Input, Select, Field, Badge, IconButton, EmptyState } from "@/components/ui-bits"
import { useStore } from "@/lib/store"
import { formatJalali, parseKey, toFa, todayKey, diffDays } from "@/lib/jalali"

export function ReviewView() {
  const { state, addReview, reviewDone, removeReview } = useStore()
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState(state.subjects[0] ?? "")
  const [topic, setTopic] = useState("")
  const today = todayKey()

  const due = state.reviews.filter((r) => r.nextReview <= today).sort((a, b) => a.nextReview.localeCompare(b.nextReview))
  const upcoming = state.reviews.filter((r) => r.nextReview > today).sort((a, b) => a.nextReview.localeCompare(b.nextReview))

  function submit() {
    if (!topic.trim()) return
    addReview({ subject, topic: topic.trim() })
    setTopic("")
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="سیستم مرور"
        subtitle="مرور فاصله‌دار به روش جعبه لایتنر"
        icon={<RefreshCw className="size-5" />}
        action={
          <Button onClick={() => setOpen((o) => !o)}>
            <Plus className="size-4" /> مبحث جدید
          </Button>
        }
      />

      {open ? (
        <GlassCard strong className="mb-6 p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="درس">
              <Select value={subject} onChange={(e) => setSubject(e.target.value)}>
                {state.subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="مبحث">
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="مثلاً چرخه کربس" />
            </Field>
            <div className="flex items-end">
              <Button onClick={submit} className="w-full">
                افزودن به مرور
              </Button>
            </div>
          </div>
        </GlassCard>
      ) : null}

      <div className="mb-6 grid grid-cols-3 gap-4">
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">آماده مرور</p>
          <p className="mt-1 text-2xl font-bold text-amber-400">{toFa(due.length)}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">در انتظار</p>
          <p className="mt-1 text-2xl font-bold">{toFa(upcoming.length)}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">کل مباحث</p>
          <p className="mt-1 text-2xl font-bold">{toFa(state.reviews.length)}</p>
        </GlassCard>
      </div>

      <h2 className="mb-3 font-semibold">مرور امروز</h2>
      <div className="mb-8 space-y-3">
        {due.length === 0 ? (
          <EmptyState icon={<Check className="size-8" />} title="مروری برای امروز نمانده" hint="عالیه! همه‌چیز به‌روزه" />
        ) : (
          due.map((r) => (
            <GlassCard key={r.id} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{r.topic}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge tone="primary">{r.subject}</Badge>
                  <span>جعبه {toFa(r.box)}</span>
                </div>
              </div>
              <Button variant="outline" onClick={() => reviewDone(r.id, false)} className="text-red-400">
                <X className="size-4" /> بلد نبودم
              </Button>
              <Button onClick={() => reviewDone(r.id, true)}>
                <Check className="size-4" /> بلد بودم
              </Button>
              <IconButton onClick={() => removeReview(r.id)} className="hover:text-destructive">
                <Trash2 className="size-4" />
              </IconButton>
            </GlassCard>
          ))
        )}
      </div>

      <h2 className="mb-3 font-semibold">مرورهای بعدی</h2>
      <div className="space-y-2">
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">موردی در صف نیست</p>
        ) : (
          upcoming.map((r) => (
            <GlassCard key={r.id} className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                <Badge tone="default">{r.subject}</Badge>
                <span className="text-sm">{r.topic}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {toFa(diffDays(r.nextReview, today))} روز دیگر — {formatJalali(parseKey(r.nextReview), { withYear: false })}
              </span>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  )
}
