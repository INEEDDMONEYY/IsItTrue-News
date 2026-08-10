import type { ReactNode } from 'react'

export function AuthCard({ children }: { children: ReactNode }) {
  return <div className="w-full max-w-[400px] mx-auto">{children}</div>
}