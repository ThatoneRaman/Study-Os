// Persian (Jalali) calendar helpers built on the browser Intl API.

const FA_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
]

// Iran week starts on Saturday.
export const FA_WEEKDAYS = ["شنبه", "یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"]
export const FA_WEEKDAYS_SHORT = ["ش", "ی", "د", "س", "چ", "پ", "ج"]

const partsFormatter = new Intl.DateTimeFormat("en-US-u-ca-persian-nu-latn", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  timeZone: "UTC",
})

export interface JalaliParts {
  year: number
  month: number // 1..12
  day: number // 1..31
}

export function toJalali(date: Date): JalaliParts {
  const parts = partsFormatter.formatToParts(date)
  let year = 0
  let month = 0
  let day = 0
  for (const p of parts) {
    if (p.type === "year") year = Number.parseInt(p.value, 10)
    else if (p.type === "month") month = Number.parseInt(p.value, 10)
    else if (p.type === "day") day = Number.parseInt(p.value, 10)
  }
  return { year, month, day }
}

// Persian weekday index where Saturday = 0 ... Friday = 6
export function jalaliWeekday(date: Date): number {
  return (date.getUTCDay() + 1) % 7
}

function utcDate(y: number, m: number, d: number): Date {
  return new Date(Date.UTC(y, m, d))
}

// Convert a jalali y/m/d to a gregorian (UTC) Date by estimation + stepping.
export function gregorianOfJalali(jy: number, jm: number, jd: number): Date {
  // Nowruz falls around March 20/21 of (jy + 621)
  let d = utcDate(jy + 621, 2, 20)
  for (let i = 0; i < 900; i++) {
    const p = toJalali(d)
    if (p.year === jy && p.month === jm && p.day === jd) return d
    const cur = p.year * 10000 + p.month * 100 + p.day
    const target = jy * 10000 + jm * 100 + jd
    d = new Date(d.getTime() + (cur < target ? 1 : -1) * 86400000)
  }
  return d
}

export function jalaliMonthLength(jy: number, jm: number): number {
  const start = gregorianOfJalali(jy, jm, 1)
  const nextY = jm === 12 ? jy + 1 : jy
  const nextM = jm === 12 ? 1 : jm + 1
  const nextStart = gregorianOfJalali(nextY, nextM, 1)
  return Math.round((nextStart.getTime() - start.getTime()) / 86400000)
}

export function jalaliMonthName(jm: number): string {
  return FA_MONTHS[jm - 1] ?? ""
}

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]

export function toFa(input: number | string): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)])
}

// yyyy-mm-dd (gregorian) key from a Date using local time
export function dateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

// Format a local Date as a friendly Jalali string, e.g. "۱۲ فروردین ۱۴۰۳"
export function formatJalali(date: Date, opts?: { withWeekday?: boolean; withYear?: boolean }): string {
  const utc = utcDate(date.getFullYear(), date.getMonth(), date.getDate())
  const j = toJalali(utc)
  const parts: string[] = []
  if (opts?.withWeekday) parts.push(FA_WEEKDAYS[jalaliWeekday(utc)])
  parts.push(`${toFa(j.day)} ${jalaliMonthName(j.month)}`)
  if (opts?.withYear !== false) parts.push(toFa(j.year))
  return parts.join(" ")
}

export function todayKey(): string {
  return dateKey(new Date())
}

export function addDays(key: string, days: number): string {
  const d = parseKey(key)
  d.setDate(d.getDate() + days)
  return dateKey(d)
}

export function diffDays(a: string, b: string): number {
  return Math.round((parseKey(a).getTime() - parseKey(b).getTime()) / 86400000)
}
