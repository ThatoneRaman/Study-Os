import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Vazirmatn } from 'next/font/google'
import './globals.css'

const vazir = Vazirmatn({
  subsets: ['arabic'],
  variable: '--font-vazir',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'داشبورد مطالعه | برنامه‌ریزی و پیشرفت درسی',
  description:
    'داشبورد کامل مطالعه با برنامه روزانه و هفتگی، تقویم شمسی، تایمر پومودورو، سیستم تست، تحلیل اشتباهات، مرور فاصله‌دار، هدف‌گذاری، استریک و دستاوردها.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#1a1526',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fa" dir="rtl" className={`dark ${vazir.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
