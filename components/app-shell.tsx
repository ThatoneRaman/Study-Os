"use client"

import { useState } from "react"
import {
  Home,
  CalendarDays,
  CalendarRange,
  CalendarClock,
  Timer,
  ClipboardList,
  BarChart3,
  LineChart,
  XCircle,
  RefreshCw,
  BookOpen,
  Target,
  Flame,
  Trophy,
  Bell,
  Settings,
  Menu,
  X,
  GraduationCap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useStore, computeStreak } from "@/lib/store"
import { toFa } from "@/lib/jalali"

import { DashboardView } from "@/components/views/dashboard"
import { DailyPlanView } from "@/components/views/daily-plan"
import { WeeklyPlanView } from "@/components/views/weekly-plan"
import { CalendarView } from "@/components/views/calendar"
import { TimerView } from "@/components/views/timer"
import { TestsView } from "@/components/views/tests"
import { StatsView } from "@/components/views/stats"
import { AnalyticsView } from "@/components/views/analytics"
import { MistakesView } from "@/components/views/mistakes"
import { ReviewView } from "@/components/views/review"
import { ResourcesView } from "@/components/views/resources"
import { GoalsView } from "@/components/views/goals"
import { StreakView } from "@/components/views/streak"
import { AchievementsView } from "@/components/views/achievements"
import { RemindersView } from "@/components/views/reminders"
import { SettingsView } from "@/components/views/settings"

const NAV = [
  { id: "dashboard", label: "داشبورد", icon: Home },
  { id: "daily", label: "برنامه روزانه", icon: CalendarDays },
  { id: "weekly", label: "برنامه هفتگی", icon: CalendarRange },
  { id: "calendar", label: "تقویم شمسی", icon: CalendarClock },
  { id: "timer", label: "تایمر", icon: Timer },
  { id: "tests", label: "سیستم تست", icon: ClipboardList },
  { id: "stats", label: "آمار", icon: BarChart3 },
  { id: "analytics", label: "Analytics", icon: LineChart },
  { id: "mistakes", label: "تحلیل اشتباهات", icon: XCircle },
  { id: "review", label: "سیستم مرور", icon: RefreshCw },
  { id: "resources", label: "منابع", icon: BookOpen },
  { id: "goals", label: "هدف‌گذاری", icon: Target },
  { id: "streak", label: "استریک", icon: Flame },
  { id: "achievements", label: "دستاوردها", icon: Trophy },
  { id: "reminders", label: "یادآورها", icon: Bell },
  { id: "settings", label: "تنظیمات", icon: Settings },
] as const

export function AppShell() {
  const [active, setActive] = useState<string>("dashboard")
  const [mobileOpen, setMobileOpen] = useState(false)
  const { state, hydrated } = useStore()
  const streak = computeStreak(state.sessions)

  function navigate(id: string) {
    setActive(id)
    setMobileOpen(false)
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const current = NAV.find((n) => n.id === active)

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
          <GraduationCap className="size-6" />
        </div>
        <div>
          <p className="font-bold leading-tight">داشبورد مطالعه</p>
          <p className="text-xs text-muted-foreground">برنامه‌ریز درسی</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {NAV.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="size-[18px] shrink-0" />
              <span className="flex-1 text-right">{item.label}</span>
              {item.id === "streak" && streak > 0 ? (
                <span className="rounded-full bg-orange-500/20 px-1.5 text-xs text-orange-400">{toFa(streak)}</span>
              ) : null}
            </button>
          )
        })}
      </nav>
    </div>
  )

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="glass sticky top-0 hidden h-screen w-64 shrink-0 border-l border-border lg:block">{sidebar}</aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="glass-strong absolute right-0 top-0 h-full w-72 border-l border-border">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute left-3 top-4 flex size-9 items-center justify-center rounded-lg hover:bg-accent"
            >
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="glass sticky top-0 z-40 flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <GraduationCap className="size-5" />
            </div>
            <span className="font-bold">{current?.label ?? "داشبورد مطالعه"}</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="flex size-9 items-center justify-center rounded-lg hover:bg-accent"
            aria-label="باز کردن منو"
          >
            <Menu className="size-5" />
          </button>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8">
          {!hydrated ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">در حال بارگذاری…</div>
          ) : (
            <>
              {active === "dashboard" && <DashboardView onNavigate={navigate} />}
              {active === "daily" && <DailyPlanView />}
              {active === "weekly" && <WeeklyPlanView />}
              {active === "calendar" && <CalendarView />}
              {active === "timer" && <TimerView />}
              {active === "tests" && <TestsView />}
              {active === "stats" && <StatsView />}
              {active === "analytics" && <AnalyticsView />}
              {active === "mistakes" && <MistakesView />}
              {active === "review" && <ReviewView />}
              {active === "resources" && <ResourcesView />}
              {active === "goals" && <GoalsView />}
              {active === "streak" && <StreakView />}
              {active === "achievements" && <AchievementsView />}
              {active === "reminders" && <RemindersView />}
              {active === "settings" && <SettingsView />}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
