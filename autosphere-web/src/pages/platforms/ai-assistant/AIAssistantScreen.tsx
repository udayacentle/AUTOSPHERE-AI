import type { ReactNode } from 'react'

interface AIAssistantScreenProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export default function AIAssistantScreen({ title, subtitle, children }: AIAssistantScreenProps) {
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
