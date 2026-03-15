import type { ReactNode } from 'react'

interface FleetScreenProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export default function FleetScreen({ title, subtitle, children }: FleetScreenProps) {
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
