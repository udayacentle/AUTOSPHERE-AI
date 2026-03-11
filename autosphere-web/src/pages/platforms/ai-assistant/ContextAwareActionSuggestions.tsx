import AIAssistantScreen from './AIAssistantScreen'

export default function ContextAwareActionSuggestions() {
  return (
    <AIAssistantScreen
      title="Context-Aware Action Suggestions"
      subtitle="Actions suggested based on current screen and user context"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Context</h3>
          <p>Current screen, recent activity, time, location.</p>
        </div>
        <div className="card">
          <h3>Actions</h3>
          <p>E.g. “Book service here”, “View claim”, “Compare premium”.</p>
        </div>
        <div className="card">
          <h3>One-tap</h3>
          <p>Execute or navigate from suggestion.</p>
        </div>
      </div>
    </AIAssistantScreen>
  )
}
