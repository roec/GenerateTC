import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { LLMGenerateParams, LLMProvider } from './llm.types';

@Injectable()
export class OpenAIProvider implements LLMProvider {
  constructor(private readonly configService: ConfigService) {}

  async generate(params: LLMGenerateParams): Promise<string> {
    const apiKey = this.configService.getOrThrow<string>('OPENAI_API_KEY');
    const model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4.1');

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model,
        temperature: params.temperature ?? 0.2,
        messages: [
          { role: 'system', content: params.systemPrompt },
          { role: 'user', content: `${params.userPrompt}\n\nContext:\n${params.context ?? 'No context provided'}` },
        ],
        response_format: params.responseFormat === 'json' ? { type: 'json_object' } : undefined,
      },
      { headers: { Authorization: `Bearer ${apiKey}` } },
    );

    return response.data.choices?.[0]?.message?.content ?? '';
  }
}
