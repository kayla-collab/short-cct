// src/chatbot/providers/huggingface.ts
let huggingFaceApiKey = ''

export function setHuggingFaceApiKey(apiKey: string): void {
  huggingFaceApiKey = apiKey
}

export async function huggingFaceChat(prompt: string): Promise<string> {
  if (!huggingFaceApiKey) {
    throw new Error('HUGGINGFACE_API_KEY is not configured')
  }

  const response = await fetch('https://api-inference.huggingface.co/models/google/flan-t5-large', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${huggingFaceApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 160,
        temperature: 0.4,
        return_full_text: false,
      },
    }),
  })

  const data: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const reason = typeof (data as Record<string, unknown>)?.error === 'string' 
      ? (data as Record<string, unknown>).error 
      : `Hugging Face request failed with status ${response.status}`
    throw new Error(reason as string)
  }

  if (Array.isArray(data) && typeof (data[0] as Record<string, unknown>)?.generated_text === 'string') {
    return ((data[0] as Record<string, unknown>).generated_text as string).trim()
  }

  if (typeof (data as Record<string, unknown>)?.generated_text === 'string') {
    return ((data as Record<string, unknown>).generated_text as string).trim()
  }

  return 'I could not generate a response right now. Please try again.'
}
