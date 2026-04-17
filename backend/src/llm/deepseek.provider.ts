import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { LLMGenerateParams, LLMProvider } from './llm.types';

@Injectable()
export class DeepSeekProvider implements LLMProvider {
  constructor(private readonly configService: ConfigService) {}

  async generate(params: LLMGenerateParams): Promise<string> {
    const apiKey = this.configService.getOrThrow<string>('DEEPSEEK_API_KEY');
    const model = this.configService.get<string>('DEEPSEEK_MODEL', 'deepseek-chat');

    const response = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model,
        temperature: params.temperature ?? 0.2,
        messages: [
          { role: 'system', content: params.systemPrompt },
          { role: 'user', content: `${params.userPrompt}\n\nContext:\n${params.context ?? 'No context provided'}` },
        ],
      },
      { headers: { Authorization: `Bearer ${apiKey}` } },
    );

    return response.data.choices?.[0]?.message?.content ?? '';
  }
}
