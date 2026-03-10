import type { ReactNode } from 'react'

interface InsuranceScreenProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export default function InsuranceScreen({ title, subtitle, children }: InsuranceScreenProps) {
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
