export type ID = string

export type ResourceType = "book" | "video" | "pdf" | "course" | "other"
export type ResourceStatus = "not-started" | "in-progress" | "done"

export interface DailyTask {
  id: ID
  title: string
  subject: string
  date: string // yyyy-mm-dd (gregorian anchor)
  time: string // HH:mm
  duration: number // minutes
  priority: "low" | "medium" | "high"
  done: boolean
}

export interface TestRecord {
  id: ID
  subject: string
  date: string // yyyy-mm-dd
  total: number
  correct: number
  wrong: number
  blank: number
  durationMin: number
  note?: string
}

export type MistakeReason = "careless" | "concept" | "time" | "misread" | "guess"

export interface Mistake {
  id: ID
  subject: string
  topic: string
  description: string
  reason: MistakeReason
  date: string
  resolved: boolean
}

export interface ReviewItem {
  id: ID
  subject: string
  topic: string
  createdAt: string
  nextReview: string // yyyy-mm-dd
  box: number // 1..5 leitner
  lastReviewed?: string
}

export interface Resource {
  id: ID
  title: string
  type: ResourceType
  subject: string
  current: number
  total: number
  unit: string
  status: ResourceStatus
}

export interface Goal {
  id: ID
  title: string
  subject?: string
  target: number
  current: number
  unit: string
  deadline: string
  done: boolean
}

export interface StudySession {
  id: ID
  date: string // yyyy-mm-dd
  subject: string
  durationMin: number
  type: "focus" | "break"
  completedAt: string // ISO
}

export interface Reminder {
  id: ID
  title: string
  datetime: string // ISO local
  done: boolean
}

export interface PomodoroSettings {
  focus: number
  shortBreak: number
  longBreak: number
  rounds: number
}

export interface Settings {
  theme: "dark" | "light"
  dailyGoalMinutes: number
  pomodoro: PomodoroSettings
}

export interface AppState {
  subjects: string[]
  tasks: DailyTask[]
  tests: TestRecord[]
  mistakes: Mistake[]
  reviews: ReviewItem[]
  resources: Resource[]
  goals: Goal[]
  sessions: StudySession[]
  reminders: Reminder[]
  settings: Settings
}
