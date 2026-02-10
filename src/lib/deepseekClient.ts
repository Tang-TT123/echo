import { type LLMConfig } from 'coze-coding-dev-sdk';

const API_URL = 'https://api.deepseek.com/chat/completions';

export class DeepSeekClient {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('DeepSeek API Key is missing. Please set DEEPSEEK_API_KEY in .env');
    }
  }

  async *stream(
    messages: any[],
    config: { model: string; temperature?: number },
    _signal?: AbortSignal,
    _headers?: Record<string, string>
  ) {
    if (!this.apiKey) {
      throw new Error('DeepSeek API Key is not configured');
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages,
          temperature: config.temperature ?? 1.0,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API Error: ${response.status} ${errorText}`);
      }

      if (!response.body) {
        throw new Error('Response body is empty');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;
          if (trimmedLine === 'data: [DONE]') return;
          if (trimmedLine.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmedLine.slice(6));
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                yield { content };
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('DeepSeek Stream Error:', error);
      throw error;
    }
  }
}

export const deepSeekClient = new DeepSeekClient();
