import Groq from 'groq-sdk'
import type { ChatMessage, AICoachError } from '../types/aiCoach'

const MODEL = 'llama-3.1-8b-instant' // Fast and responsive model

export class GroqService {
  private client: Groq | null = null
  private apiKey: string | null = null

  initialize(apiKey: string): void {
    this.apiKey = apiKey
    this.client = new Groq({ apiKey, dangerouslyAllowBrowser: true })
  }

  isInitialized(): boolean {
    return this.client !== null && this.apiKey !== null
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const testClient = new Groq({ apiKey, dangerouslyAllowBrowser: true })

      // Send a minimal test request
      const completion = await testClient.chat.completions.create({
        messages: [{ role: 'user', content: 'test' }],
        model: MODEL,
        max_tokens: 5,
      })

      return completion.choices.length > 0
    } catch (error) {
      console.error('API key validation failed:', error)
      return false
    }
  }

  async sendMessage(
    userMessage: string,
    systemPrompt: string,
    history: ChatMessage[]
  ): Promise<{ message: string; error?: AICoachError }> {
    if (!this.client || !this.apiKey) {
      return {
        message: '',
        error: {
          type: 'no_key',
          message: 'Configure Groq API key in Settings to use AI Coach.',
          retryable: false,
        },
      }
    }

    try {
      // Build messages array
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: systemPrompt },
      ]

      // Add conversation history (limit to last 10 messages to save tokens)
      const recentHistory = history.slice(-10).filter((msg) => msg.role !== 'system')
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })
      }

      // Add current user message
      messages.push({ role: 'user', content: userMessage })

      // Call Groq API
      const completion = await this.client.chat.completions.create({
        messages,
        model: MODEL,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1,
      })

      const assistantMessage = completion.choices[0]?.message?.content || ''

      if (!assistantMessage) {
        return {
          message: '',
          error: {
            type: 'unknown',
            message: 'No response from AI. Please try again.',
            retryable: true,
          },
        }
      }

      return { message: assistantMessage }
    } catch (error: unknown) {
      console.error('Groq API error:', error)

      // Type guard for error handling
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status?: number }).status

        // Rate limit error
        if (status === 429) {
          return {
            message: '',
            error: {
              type: 'rate_limit',
              message: 'Daily limit reached. Try again tomorrow or upgrade your Groq plan.',
              retryable: false,
            },
          }
        }

        // Invalid API key
        if (status === 401 || status === 403) {
          return {
            message: '',
            error: {
              type: 'invalid_key',
              message: 'Invalid API key. Update in Settings.',
              retryable: false,
            },
          }
        }
      }

      // Network error
      if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as { message?: string }).message || ''
        if (message.includes('fetch') || message.includes('network')) {
          return {
            message: '',
            error: {
              type: 'network',
              message: 'Connection lost. Check your internet and try again.',
              retryable: true,
            },
          }
        }
      }

      // Unknown error
      return {
        message: '',
        error: {
          type: 'unknown',
          message: 'Something went wrong. Please try again.',
          retryable: true,
        },
      }
    }
  }
}

// Singleton instance
export const groqService = new GroqService()
