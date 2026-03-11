import type { ReactNode } from 'react'

interface SalesScreenProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export default function SalesScreen({ title, subtitle, children }: SalesScreenProps) {
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
