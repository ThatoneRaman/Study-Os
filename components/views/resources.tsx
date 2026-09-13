"use client"

import { useState } from "react"
import { BookOpen, Plus, Trash2, Minus, Video, FileText, GraduationCap, BookMarked } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { PageHeader, Button, Input, Select, Field, Badge, IconButton, EmptyState, Progress } from "@/components/ui-bits"
import { useStore } from "@/lib/store"
import { toFa } from "@/lib/jalali"
import type { ResourceType } from "@/lib/types"

const typeIcon: Record<ResourceType, React.ReactNode> = {
  book: <BookMarked className="size-4" />,
  video: <Video className="size-4" />,
  pdf: <FileText className="size-4" />,
  course: <GraduationCap className="size-4" />,
  other: <BookOpen className="size-4" />,
}
const typeLabel: Record<ResourceType, string> = {
  book: "کتاب",
  video: "ویدیو",
  pdf: "جزوه",
  course: "دوره",
  other: "سایر",
}

export function ResourcesView() {
  const { state, addResource, updateResource, removeResource } = useStore()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [type, setType] = useState<ResourceType>("book")
  const [subject, setSubject] = useState(state.subjects[0] ?? "")
  const [total, setTotal] = useState(100)
  const [unit, setUnit] = useState("صفحه")

  function submit() {
    if (!title.trim()) return
    addResource({ title: title.trim(), type, subject, current: 0, total: Number(total) || 1, unit })
    setTitle("")
    setOpen(false)
  }

  const statusTone = { "not-started": "default", "in-progress": "warning", done: "success" } as const
  const statusLabel = { "not-started": "شروع‌نشده", "in-progress": "در حال مطالعه", done: "تمام‌شده" } as const

  return (
    <div>
      <PageHeader
        title="مدیریت منابع"
        subtitle="کتاب‌ها، جزوه‌ها و دوره‌ها با پیشرفت مطالعه"
        icon={<BookOpen className="size-5" />}
        action={
          <Button onClick={() => setOpen((o) => !o)}>
            <Plus className="size-4" /> منبع جدید
          </Button>
        }
      />

      {open ? (
        <GlassCard strong className="mb-6 p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="عنوان">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً کتاب ریاضی جامع" />
            </Field>
            <Field label="نوع">
              <Select value={type} onChange={(e) => setType(e.target.value as ResourceType)}>
                {Object.entries(typeLabel).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
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
            <Field label="مقدار کل">
              <Input type="number" value={total} onChange={(e) => setTotal(Number(e.target.value))} />
            </Field>
            <Field label="واحد">
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="صفحه / جلسه / فصل" />
            </Field>
            <div className="flex items-end">
              <Button onClick={submit} className="w-full">
                افزودن
              </Button>
            </div>
          </div>
        </GlassCard>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {state.resources.length === 0 ? (
          <div className="md:col-span-2">
            <EmptyState icon={<BookOpen className="size-8" />} title="منبعی اضافه نشده" hint="کتاب‌ها و دوره‌هایت را اینجا مدیریت کن" />
          </div>
        ) : (
          state.resources.map((r) => {
            const pct = Math.round((r.current / r.total) * 100)
            return (
              <GlassCard key={r.id} className="p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      {typeIcon[r.type]}
                    </div>
                    <div>
                      <p className="font-medium leading-tight">{r.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge tone="primary">{r.subject}</Badge>
                        <Badge tone={statusTone[r.status]}>{statusLabel[r.status]}</Badge>
                      </div>
                    </div>
                  </div>
                  <IconButton onClick={() => removeResource(r.id)} className="hover:text-destructive">
                    <Trash2 className="size-4" />
                  </IconButton>
                </div>

                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {toFa(r.current)} از {toFa(r.total)} {r.unit}
                  </span>
                  <span className="font-semibold text-primary">{toFa(pct)}٪</span>
                </div>
                <Progress value={pct} className="mb-3" />

                <div className="flex items-center justify-between">
                  <IconButton
                    onClick={() => updateResource(r.id, { current: Math.max(0, r.current - 1) })}
                    className="border border-border"
                  >
                    <Minus className="size-4" />
                  </IconButton>
                  <input
                    type="range"
                    min={0}
                    max={r.total}
                    value={r.current}
                    onChange={(e) => updateResource(r.id, { current: Number(e.target.value) })}
                    className="mx-3 flex-1 accent-primary"
                  />
                  <IconButton
                    onClick={() => updateResource(r.id, { current: Math.min(r.total, r.current + 1) })}
                    className="border border-border"
                  >
                    <Plus className="size-4" />
                  </IconButton>
                </div>
              </GlassCard>
            )
          })
        )}
      </div>
    </div>
  )
}
