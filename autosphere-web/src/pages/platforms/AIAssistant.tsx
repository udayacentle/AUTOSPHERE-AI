const SCREENS = [
  'AI Chat Interface',
  'Voice Assistant Screen',
  'Predictive Suggestions Panel',
  'Context-Aware Action Suggestions',
  'AI Explanation Screen (Why This Score?)',
]

export default function AIAssistant() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>AI Assistant Interface</h1>
        <p>AI chat, voice, suggestions, and explanations.</p>
      </div>
      <ul className="screen-list">
        {SCREENS.map((name) => (
          <li key={name}><a href="#">{name}</a></li>
        ))}
      </ul>
    </div>
  )
}
