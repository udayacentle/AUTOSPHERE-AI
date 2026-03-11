import type { ReactNode } from 'react'

interface AIAdminScreenProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export default function AIAdminScreen({ title, subtitle, children }: AIAdminScreenProps) {
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
