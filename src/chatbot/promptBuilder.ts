// src/chatbot/promptBuilder.ts
export function buildPrompt(message: string): string {
  return `SYSTEM:
You are a helpful assistant for Short Circuit platform.

RULES:
- Be concise
- Be beginner-friendly

USER:
${message}`
}
