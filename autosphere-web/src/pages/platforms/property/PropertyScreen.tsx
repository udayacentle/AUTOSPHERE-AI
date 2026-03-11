import type { ReactNode } from 'react'

interface PropertyScreenProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export default function PropertyScreen({ title, subtitle, children }: PropertyScreenProps) {
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
