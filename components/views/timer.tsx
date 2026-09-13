"use client"

import { useEffect, useRef, useState } from "react"
import { Timer as TimerIcon, Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { PageHeader, Button, Select, Badge } from "@/components/ui-bits"
import { useStore } from "@/lib/store"
import { toFa, todayKey } from "@/lib/jalali"
import { studyMinutesByDay as minutesByDay } from "@/lib/store"

type Mode = "focus" | "shortBreak" | "longBreak"

const modeLabel: Record<Mode, string> = { focus: "تمرکز", shortBreak: "استراحت کوتاه", longBreak: "استراحت بلند" }

export function TimerView() {
  const { state, addSession } = useStore()
  const p = state.settings.pomodoro
  const [mode, setMode] = useState<Mode>("focus")
  const [subject, setSubject] = useState(state.subjects[0] ?? "")
  const [remaining, setRemaining] = useState(p.focus * 60)
  const [running, setRunning] = useState(false)
  const [round, setRound] = useState(1)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const durations: Record<Mode, number> = {
    focus: p.focus * 60,
    shortBreak: p.shortBreak * 60,
    longBreak: p.longBreak * 60,
  }

  // reset remaining when mode changes (and not running)
  useEffect(() => {
    setRemaining(durations[mode])
    setRunning(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, p.focus, p.shortBreak, p.longBreak])

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running])

  // handle completion
  useEffect(() => {
    if (remaining !== 0 || !running) return
    setRunning(false)
    if (mode === "focus") {
      addSession({ date: todayKey(), subject, durationMin: p.focus, type: "focus" })
      const nextRound = round + 1
      setRound(nextRound)
      const nextMode: Mode = (round % p.rounds === 0) ? "longBreak" : "shortBreak"
      setMode(nextMode)
    } else {
      setMode("focus")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining])

  const total = durations[mode]
  const progress = 1 - remaining / total
  const min = Math.floor(remaining / 60)
  const sec = remaining % 60

  const byDay = minutesByDay(state.sessions)
  const todayMin = byDay[todayKey()] ?? 0
  const todayFocusCount = state.sessions.filter((s) => s.date === todayKey() && s.type === "focus").length

  const R = 130
  const C = 2 * Math.PI * R

  return (
    <div>
      <PageHeader title="تایمر حرفه‌ای" subtitle="تکنیک پومودورو برای تمرکز عمیق" icon={<TimerIcon className="size-5" />} />

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard strong className="flex flex-col items-center p-8 lg:col-span-2">
          <div className="mb-6 flex gap-2">
            {(["focus", "shortBreak", "longBreak"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  mode === m ? "bg-primary text-primary-foreground" : "bg-background/40 text-muted-foreground hover:bg-accent"
                }`}
              >
                {modeLabel[m]}
              </button>
            ))}
          </div>

          <div className="relative flex items-center justify-center">
            <svg width="300" height="300" className="-rotate-90">
              <circle cx="150" cy="150" r={R} fill="none" strokeWidth="14" className="stroke-muted" />
              <circle
                cx="150"
                cy="150"
                r={R}
                fill="none"
                strokeWidth="14"
                strokeLinecap="round"
                className={mode === "focus" ? "stroke-primary" : "stroke-emerald-400"}
                strokeDasharray={C}
                strokeDashoffset={C * (1 - progress)}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-mono text-6xl font-bold tabular-nums">
                {toFa(String(min).padStart(2, "0"))}:{toFa(String(sec).padStart(2, "0"))}
              </span>
              <span className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                {mode === "focus" ? <Brain className="size-4" /> : <Coffee className="size-4" />}
                {modeLabel[mode]} • دور {toFa(round)}
              </span>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <Button onClick={() => setRunning((r) => !r)} className="min-w-32">
              {running ? <Pause className="size-4" /> : <Play className="size-4" />}
              {running ? "توقف" : "شروع"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setRunning(false)
                setRemaining(durations[mode])
              }}
            >
              <RotateCcw className="size-4" /> ریست
            </Button>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="p-5">
            <h3 className="mb-3 font-semibold">درس در حال مطالعه</h3>
            <Select value={subject} onChange={(e) => setSubject(e.target.value)}>
              {state.subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="mb-4 font-semibold">آمار امروز</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">پومودوروهای کامل</span>
                <Badge tone="primary">{toFa(todayFocusCount)}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">مجموع تمرکز</span>
                <span className="font-semibold">{toFa(todayMin)} دقیقه</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">تنظیمات</span>
                <span className="text-xs text-muted-foreground">
                  {toFa(p.focus)}/{toFa(p.shortBreak)}/{toFa(p.longBreak)}
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
