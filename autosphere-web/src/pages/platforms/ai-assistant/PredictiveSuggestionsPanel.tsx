import AIAssistantScreen from './AIAssistantScreen'

export default function PredictiveSuggestionsPanel() {
  return (
    <AIAssistantScreen
      title="Predictive Suggestions Panel"
      subtitle="AI-suggested next actions and tips"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Suggestions list</h3>
          <p>E.g. improve score, book service, check insurance, save fuel.</p>
        </div>
        <div className="card">
          <h3>Priority & relevance</h3>
          <p>Ranked by impact or urgency; dismiss or act.</p>
        </div>
        <div className="card">
          <h3>Deep link</h3>
          <p>Tap suggestion to open relevant screen or flow.</p>
        </div>
      </div>
    </AIAssistantScreen>
  )
}
