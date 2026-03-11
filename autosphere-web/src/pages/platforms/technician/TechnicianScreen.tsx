import type { ReactNode } from 'react'

interface TechnicianScreenProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export default function TechnicianScreen({ title, subtitle, children }: TechnicianScreenProps) {
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
