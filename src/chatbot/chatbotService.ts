// src/chatbot/chatbotService.ts
import { buildPrompt } from './promptBuilder'
import { huggingFaceChat, setHuggingFaceApiKey } from './providers/huggingface'

export function configureChatbot(apiKey: string): void {
  setHuggingFaceApiKey(apiKey)
}

export async function getChatbotReply(message: string): Promise<string> {
  const prompt = buildPrompt(message)
  const response = await huggingFaceChat(prompt)
  return response
}
