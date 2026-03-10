import type { ReactNode } from 'react'

interface DriverScreenProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export default function DriverScreen({ title, subtitle, children }: DriverScreenProps) {
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
