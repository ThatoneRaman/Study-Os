"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type {
  AppState,
  DailyTask,
  Goal,
  Mistake,
  Reminder,
  Resource,
  ReviewItem,
  Settings,
  StudySession,
  TestRecord,
} from "./types"
import { addDays, dateKey, todayKey } from "./jalali"

const KEY = "study-dashboard-v2"

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const defaultSettings: Settings = {
  theme: "dark",
  dailyGoalMinutes: 240,
  pomodoro: { focus: 25, shortBreak: 5, longBreak: 15, rounds: 4 },
}

function createEmptyState(): AppState {
  return {
    subjects: ["ریاضی", "فیزیک", "شیمی", "زیست", "ادبیات", "زبان انگلیسی"],
    tasks: [],
    tests: [],
    mistakes: [],
    reviews: [],
    resources: [],
    goals: [],
    sessions: [],
    reminders: [],
    settings: {
      theme: defaultSettings.theme,
      dailyGoalMinutes: defaultSettings.dailyGoalMinutes,
      pomodoro: { ...defaultSettings.pomodoro },
    },
  }
}

interface StoreValue {
  state: AppState
  hydrated: boolean
  // subjects
  addSubject: (name: string) => void
  removeSubject: (name: string) => void
  // tasks
  addTask: (t: Omit<DailyTask, "id" | "done">) => void
  updateTask: (id: string, patch: Partial<DailyTask>) => void
  removeTask: (id: string) => void
  toggleTask: (id: string) => void
  // tests
  addTest: (t: Omit<TestRecord, "id">) => void
  removeTest: (id: string) => void
  // mistakes
  addMistake: (m: Omit<Mistake, "id" | "resolved">) => void
  toggleMistake: (id: string) => void
  removeMistake: (id: string) => void
  // reviews
  addReview: (r: Omit<ReviewItem, "id" | "box" | "createdAt" | "nextReview">) => void
  reviewDone: (id: string, remembered: boolean) => void
  removeReview: (id: string) => void
  // resources
  addResource: (r: Omit<Resource, "id" | "status">) => void
  updateResource: (id: string, patch: Partial<Resource>) => void
  removeResource: (id: string) => void
  // goals
  addGoal: (g: Omit<Goal, "id" | "done">) => void
  updateGoal: (id: string, patch: Partial<Goal>) => void
  removeGoal: (id: string) => void
  // sessions
  addSession: (s: Omit<StudySession, "id" | "completedAt">) => void
  // reminders
  addReminder: (r: Omit<Reminder, "id" | "done">) => void
  toggleReminder: (id: string) => void
  removeReminder: (id: string) => void
  // settings
  updateSettings: (patch: Partial<Settings>) => void
  resetAll: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

// Leitner spaced-repetition intervals (days) per box level.
const LEITNER_INTERVALS = [1, 2, 4, 8, 16]

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => createEmptyState())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as AppState
        setState({ ...createEmptyState(), ...parsed, settings: { ...defaultSettings, ...parsed.settings } })
      }
    } catch {
      // ignore malformed storage
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      // ignore quota errors
    }
  }, [state, hydrated])

  // apply theme class
  useEffect(() => {
    const root = document.documentElement
    if (state.settings.theme === "dark") {
      root.classList.add("dark")
      root.classList.remove("light")
    } else {
      root.classList.add("light")
      root.classList.remove("dark")
    }
  }, [state.settings.theme])

  const patch = useCallback((fn: (s: AppState) => AppState) => setState((s) => fn(s)), [])

  const value = useMemo<StoreValue>(() => {
    return {
      state,
      hydrated,
      addSubject: (name) =>
        patch((s) => (s.subjects.includes(name) || !name.trim() ? s : { ...s, subjects: [...s.subjects, name.trim()] })),
      removeSubject: (name) => patch((s) => ({ ...s, subjects: s.subjects.filter((x) => x !== name) })),

      addTask: (t) => patch((s) => ({ ...s, tasks: [...s.tasks, { ...t, id: uid(), done: false }] })),
      updateTask: (id, p) =>
        patch((s) => ({ ...s, tasks: s.tasks.map((x) => (x.id === id ? { ...x, ...p } : x)) })),
      removeTask: (id) => patch((s) => ({ ...s, tasks: s.tasks.filter((x) => x.id !== id) })),
      toggleTask: (id) =>
        patch((s) => ({ ...s, tasks: s.tasks.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) })),

      addTest: (t) => patch((s) => ({ ...s, tests: [...s.tests, { ...t, id: uid() }] })),
      removeTest: (id) => patch((s) => ({ ...s, tests: s.tests.filter((x) => x.id !== id) })),

      addMistake: (m) => patch((s) => ({ ...s, mistakes: [...s.mistakes, { ...m, id: uid(), resolved: false }] })),
      toggleMistake: (id) =>
        patch((s) => ({ ...s, mistakes: s.mistakes.map((x) => (x.id === id ? { ...x, resolved: !x.resolved } : x)) })),
      removeMistake: (id) => patch((s) => ({ ...s, mistakes: s.mistakes.filter((x) => x.id !== id) })),

      addReview: (r) =>
        patch((s) => ({
          ...s,
          reviews: [
            ...s.reviews,
            { ...r, id: uid(), box: 1, createdAt: todayKey(), nextReview: addDays(todayKey(), LEITNER_INTERVALS[0]) },
          ],
        })),
      reviewDone: (id, remembered) =>
        patch((s) => ({
          ...s,
          reviews: s.reviews.map((x) => {
            if (x.id !== id) return x
            const nextBox = remembered ? Math.min(x.box + 1, 5) : 1
            const interval = LEITNER_INTERVALS[nextBox - 1]
            return { ...x, box: nextBox, lastReviewed: todayKey(), nextReview: addDays(todayKey(), interval) }
          }),
        })),
      removeReview: (id) => patch((s) => ({ ...s, reviews: s.reviews.filter((x) => x.id !== id) })),

      addResource: (r) =>
        patch((s) => ({ ...s, resources: [...s.resources, { ...r, id: uid(), status: "in-progress" }] })),
      updateResource: (id, p) =>
        patch((s) => ({
          ...s,
          resources: s.resources.map((x) => {
            if (x.id !== id) return x
            const merged = { ...x, ...p }
            merged.status = merged.current <= 0 ? "not-started" : merged.current >= merged.total ? "done" : "in-progress"
            return merged
          }),
        })),
      removeResource: (id) => patch((s) => ({ ...s, resources: s.resources.filter((x) => x.id !== id) })),

      addGoal: (g) => patch((s) => ({ ...s, goals: [...s.goals, { ...g, id: uid(), done: false }] })),
      updateGoal: (id, p) =>
        patch((s) => ({
          ...s,
          goals: s.goals.map((x) => {
            if (x.id !== id) return x
            const merged = { ...x, ...p }
            merged.done = merged.current >= merged.target
            return merged
          }),
        })),
      removeGoal: (id) => patch((s) => ({ ...s, goals: s.goals.filter((x) => x.id !== id) })),

      addSession: (ses) =>
        patch((s) => ({ ...s, sessions: [...s.sessions, { ...ses, id: uid(), completedAt: new Date().toISOString() }] })),

      addReminder: (r) => patch((s) => ({ ...s, reminders: [...s.reminders, { ...r, id: uid(), done: false }] })),
      toggleReminder: (id) =>
        patch((s) => ({ ...s, reminders: s.reminders.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) })),
      removeReminder: (id) => patch((s) => ({ ...s, reminders: s.reminders.filter((x) => x.id !== id) })),

      updateSettings: (p) => patch((s) => ({ ...s, settings: { ...s.settings, ...p } })),
      resetAll: () => {
        try {
          localStorage.removeItem(KEY)
        } catch {
          // ignore storage errors
        }
        setState(createEmptyState())
      },
    }
  }, [state, hydrated, patch])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}

// ---------- Derived selectors ----------

export function studyMinutesByDay(sessions: StudySession[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const s of sessions) {
    if (s.type !== "focus") continue
    map[s.date] = (map[s.date] ?? 0) + s.durationMin
  }
  return map
}

export function computeStreak(sessions: StudySession[]): number {
  const byDay = studyMinutesByDay(sessions)
  let streak = 0
  let cursor = todayKey()

  // The streak is tied to the real current date. If there is no completed
  // focus session today, the current streak is immediately 0.
  while (byDay[cursor] && byDay[cursor] > 0) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}

export function lastNDays(n: number): string[] {
  const out: string[] = []
  const today = todayKey()
  for (let i = n - 1; i >= 0; i--) out.push(addDays(today, -i))
  return out
}
