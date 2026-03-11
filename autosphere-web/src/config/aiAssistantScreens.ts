export interface AIAssistantScreen {
  id: number
  path: string
  title: string
}

export const AI_ASSISTANT_SCREENS: AIAssistantScreen[] = [
  { id: 1, path: 'ai-chat-interface', title: 'AI Chat Interface' },
  { id: 2, path: 'voice-assistant-screen', title: 'Voice Assistant Screen' },
  { id: 3, path: 'predictive-suggestions-panel', title: 'Predictive Suggestions Panel' },
  { id: 4, path: 'context-aware-action-suggestions', title: 'Context-Aware Action Suggestions' },
  { id: 5, path: 'ai-explanation-screen', title: 'AI Explanation Screen (Why This Score?)' },
]
