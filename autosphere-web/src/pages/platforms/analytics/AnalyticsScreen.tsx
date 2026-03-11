import type { ReactNode } from 'react'

interface AnalyticsScreenProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export default function AnalyticsScreen({ title, subtitle, children }: AnalyticsScreenProps) {
  return (
    <div className="page driver-screen">
      <div className="page-header">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}
