"use client"

import { useState } from "react"
import { Settings as SettingsIcon, Plus, Trash2, Sun, Moon, RotateCcw } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { PageHeader, Button, Input, Field, Badge, IconButton } from "@/components/ui-bits"
import { useStore } from "@/lib/store"
import { toFa } from "@/lib/jalali"

export function SettingsView() {
  const { state, updateSettings, addSubject, removeSubject, resetAll } = useStore()
  const [newSubject, setNewSubject] = useState("")
  const p = state.settings.pomodoro

  return (
    <div>
      <PageHeader title="تنظیمات" subtitle="شخصی‌سازی داشبورد مطالعه" icon={<SettingsIcon className="size-5" />} />

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-5">
          <h2 className="mb-4 font-semibold">ظاهر</h2>
          <div className="flex gap-2">
            <button
              onClick={() => updateSettings({ theme: "dark" })}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                state.settings.theme === "dark" ? "bg-primary text-primary-foreground" : "bg-background/40 hover:bg-accent"
              }`}
            >
              <Moon className="size-4" /> تیره
            </button>
            <button
              onClick={() => updateSettings({ theme: "light" })}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                state.settings.theme === "light" ? "bg-primary text-primary-foreground" : "bg-background/40 hover:bg-accent"
              }`}
            >
              <Sun className="size-4" /> روشن
            </button>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h2 className="mb-4 font-semibold">هدف مطالعه روزانه</h2>
          <Field label="دقیقه در روز">
            <Input
              type="number"
              value={state.settings.dailyGoalMinutes}
              onChange={(e) => updateSettings({ dailyGoalMinutes: Number(e.target.value) || 0 })}
            />
          </Field>
          <p className="mt-2 text-xs text-muted-foreground">
            معادل {toFa(Math.round((state.settings.dailyGoalMinutes / 60) * 10) / 10)} ساعت در روز
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <h2 className="mb-4 font-semibold">تنظیمات پومودورو</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="تمرکز (دقیقه)">
              <Input
                type="number"
                value={p.focus}
                onChange={(e) => updateSettings({ pomodoro: { ...p, focus: Number(e.target.value) || 1 } })}
              />
            </Field>
            <Field label="استراحت کوتاه">
              <Input
                type="number"
                value={p.shortBreak}
                onChange={(e) => updateSettings({ pomodoro: { ...p, shortBreak: Number(e.target.value) || 1 } })}
              />
            </Field>
            <Field label="استراحت بلند">
              <Input
                type="number"
                value={p.longBreak}
                onChange={(e) => updateSettings({ pomodoro: { ...p, longBreak: Number(e.target.value) || 1 } })}
              />
            </Field>
            <Field label="دور تا استراحت بلند">
              <Input
                type="number"
                value={p.rounds}
                onChange={(e) => updateSettings({ pomodoro: { ...p, rounds: Number(e.target.value) || 1 } })}
              />
            </Field>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h2 className="mb-4 font-semibold">درس‌ها</h2>
          <div className="mb-3 flex gap-2">
            <Input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="نام درس جدید"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                  addSubject(newSubject)
                  setNewSubject("")
                }
              }}
            />
            <Button
              onClick={() => {
                addSubject(newSubject)
                setNewSubject("")
              }}
            >
              <Plus className="size-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {state.subjects.map((s) => (
              <span key={s} className="flex items-center gap-1.5 rounded-full bg-background/40 py-1 pe-1 ps-3 text-sm">
                {s}
                <IconButton onClick={() => removeSubject(s)} className="size-6 hover:text-destructive">
                  <Trash2 className="size-3.5" />
                </IconButton>
              </span>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-6 flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <h2 className="font-semibold text-destructive">بازنشانی داده‌ها</h2>
          <p className="text-sm text-muted-foreground">تمام اطلاعات به حالت اولیه برمی‌گردد. این عمل قابل بازگشت نیست.</p>
        </div>
        <Button
          variant="danger"
          onClick={() => {
            if (confirm("همه داده‌ها پاک شوند؟")) resetAll()
          }}
        >
          <RotateCcw className="size-4" /> بازنشانی کامل
        </Button>
      </GlassCard>
    </div>
  )
}
