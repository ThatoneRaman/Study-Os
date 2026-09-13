import type React from "react"
import { cn } from "@/lib/utils"

export function GlassCard({
  className,
  children,
  strong,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { strong?: boolean }) {
  return (
    <div className={cn(strong ? "glass-strong" : "glass", "rounded-2xl", className)} {...props}>
      {children}
    </div>
  )
}
