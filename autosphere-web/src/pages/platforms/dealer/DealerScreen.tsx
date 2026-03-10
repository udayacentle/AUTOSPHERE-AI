import type { ReactNode } from 'react'

interface DealerScreenProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export default function DealerScreen({ title, subtitle, children }: DealerScreenProps) {
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
