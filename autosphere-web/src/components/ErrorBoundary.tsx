import React from 'react'

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div style={{
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif',
          color: '#1a1d21',
          background: '#f0f2f5',
          minHeight: '100vh',
        }}>
          <h1>Something went wrong</h1>
          <pre style={{ background: '#fff', padding: '1rem', overflow: 'auto' }}>
            {this.state.error.message}
          </pre>
          <p>
            <strong>Login URLs:</strong><br />
            <a href="/" style={{ color: '#2563eb' }}>/ (Welcome)</a><br />
            <a href="/auth/login" style={{ color: '#2563eb' }}>/auth/login (Auth login page)</a>
          </p>
        </div>
      )
    }
    return this.props.children
  }
}
