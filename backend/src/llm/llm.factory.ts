import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeepSeekProvider } from './deepseek.provider';
import { OpenAIProvider } from './openai.provider';
import { LLMProvider } from './llm.types';

@Injectable()
export class LlmFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly deepSeekProvider: DeepSeekProvider,
    private readonly openAIProvider: OpenAIProvider,
  ) {}

  getProvider(): LLMProvider {
    const active = this.configService.get<string>('LLM_PROVIDER', 'deepseek').toLowerCase();
    return active === 'openai' ? this.openAIProvider : this.deepSeekProvider;
  }

  getProviderSettings() {
    const provider = this.configService.get<string>('LLM_PROVIDER', 'deepseek').toLowerCase();
    const model = provider === 'openai'
      ? this.configService.get<string>('OPENAI_MODEL', 'gpt-4.1')
      : this.configService.get<string>('DEEPSEEK_MODEL', 'deepseek-chat');
    return { provider, model };
  }
}
