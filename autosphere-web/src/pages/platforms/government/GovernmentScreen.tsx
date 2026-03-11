import type { ReactNode } from 'react'

interface GovernmentScreenProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export default function GovernmentScreen({ title, subtitle, children }: GovernmentScreenProps) {
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
