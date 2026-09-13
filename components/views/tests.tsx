"use client"

import { useState } from "react"
import { ClipboardList, Plus, Trash2 } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { PageHeader, Button, Input, Select, Field, Badge, IconButton, EmptyState, Progress } from "@/components/ui-bits"
import { useStore } from "@/lib/store"
import { formatJalali, parseKey, toFa, todayKey } from "@/lib/jalali"

// Standard 3-choice negative marking: score = (correct*3 - wrong)/(total*3)
function percent(t: { correct: number; wrong: number; total: number }): number {
  if (!t.total) return 0
  return Math.round(((t.correct * 3 - t.wrong) / (t.total * 3)) * 100)
}

export function TestsView() {
  const { state, addTest, removeTest } = useStore()
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState(state.subjects[0] ?? "")
  const [date, setDate] = useState(todayKey())
  const [total, setTotal] = useState(20)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [durationMin, setDurationMin] = useState(20)
  const [note, setNote] = useState("")

  const tests = [...state.tests].sort((a, b) => b.date.localeCompare(a.date))
  const blank = Math.max(0, total - correct - wrong)

  function submit() {
    if (total <= 0) return
    addTest({ subject, date, total, correct, wrong, blank, durationMin, note: note.trim() || undefined })
    setOpen(false)
    setCorrect(0)
    setWrong(0)
    setNote("")
  }

  const avg = tests.length ? Math.round(tests.reduce((a, t) => a + percent(t), 0) / tests.length) : 0

  return (
    <div>
      <PageHeader
        title="سیستم تست"
        subtitle="ثبت و پیگیری آزمون‌ها با درصد سه‌گزینه‌ای"
        icon={<ClipboardList className="size-5" />}
        action={
          <Button onClick={() => setOpen((o) => !o)}>
            <Plus className="size-4" /> آزمون جدید
          </Button>
        }
      />

      {tests.length > 0 ? (
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">تعداد آزمون</p>
            <p className="mt-1 text-2xl font-bold">{toFa(tests.length)}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">میانگین درصد</p>
            <p className="mt-1 text-2xl font-bold text-primary">{toFa(avg)}٪</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">مجموع سوالات</p>
            <p className="mt-1 text-2xl font-bold">{toFa(tests.reduce((a, t) => a + t.total, 0))}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">پاسخ صحیح</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">{toFa(tests.reduce((a, t) => a + t.correct, 0))}</p>
          </GlassCard>
        </div>
      ) : null}

      {open ? (
        <GlassCard strong className="mb-6 p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="درس">
              <Select value={subject} onChange={(e) => setSubject(e.target.value)}>
                {state.subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="تاریخ">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="تعداد کل سوال">
              <Input type="number" value={total} onChange={(e) => setTotal(Number(e.target.value))} />
            </Field>
            <Field label="پاسخ صحیح">
              <Input type="number" value={correct} onChange={(e) => setCorrect(Number(e.target.value))} />
            </Field>
            <Field label="پاسخ غلط">
              <Input type="number" value={wrong} onChange={(e) => setWrong(Number(e.target.value))} />
            </Field>
            <Field label="مدت (دقیقه)">
              <Input type="number" value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} />
            </Field>
            <Field label="یادداشت (اختیاری)">
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="مثلاً فصل مشتق" />
            </Field>
            <div className="flex items-end gap-2">
              <Badge tone="default">نزده: {toFa(blank)}</Badge>
            </div>
            <div className="flex items-end">
              <Button onClick={submit} className="w-full">
                ثبت آزمون
              </Button>
            </div>
          </div>
        </GlassCard>
      ) : null}

      <div className="space-y-3">
        {tests.length === 0 ? (
          <EmptyState icon={<ClipboardList className="size-8" />} title="هنوز آزمونی ثبت نشده" hint="اولین آزمونت را اضافه کن" />
        ) : (
          tests.map((t) => {
            const pct = percent(t)
            return (
              <GlassCard key={t.id} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Badge tone="primary">{t.subject}</Badge>
                    <span className="text-xs text-muted-foreground">{formatJalali(parseKey(t.date))}</span>
                    {t.note ? <span className="text-xs text-muted-foreground">• {t.note}</span> : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${pct >= 50 ? "text-emerald-400" : "text-amber-400"}`}>
                      {toFa(pct)}٪
                    </span>
                    <IconButton onClick={() => removeTest(t.id)} className="hover:text-destructive">
                      <Trash2 className="size-4" />
                    </IconButton>
                  </div>
                </div>
                <div className="mt-3">
                  <Progress value={pct < 0 ? 0 : pct} />
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="text-emerald-400">صحیح: {toFa(t.correct)}</span>
                  <span className="text-red-400">غلط: {toFa(t.wrong)}</span>
                  <span>نزده: {toFa(t.blank)}</span>
                  <span>از {toFa(t.total)}</span>
                  <span>• {toFa(t.durationMin)} دقیقه</span>
                </div>
              </GlassCard>
            )
          })
        )}
      </div>
    </div>
  )
}
