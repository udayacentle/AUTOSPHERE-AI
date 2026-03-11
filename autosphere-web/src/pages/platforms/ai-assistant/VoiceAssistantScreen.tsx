import AIAssistantScreen from './AIAssistantScreen'

export default function VoiceAssistantScreen() {
  return (
    <AIAssistantScreen
      title="Voice Assistant Screen"
      subtitle="Voice-first interaction with the AI assistant"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Voice input</h3>
          <p>Push-to-talk or wake word; speech-to-text.</p>
        </div>
        <div className="card">
          <h3>Response</h3>
          <p>Text-to-speech reply; optional transcript.</p>
        </div>
        <div className="card">
          <h3>Commands</h3>
          <p>Navigate, query score, book service, get tips.</p>
        </div>
      </div>
    </AIAssistantScreen>
  )
}
