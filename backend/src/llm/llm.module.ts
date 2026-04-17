import { Module } from '@nestjs/common';
import { OpenAIProvider } from './openai.provider';
import { DeepSeekProvider } from './deepseek.provider';
import { LlmFactory } from './llm.factory';

@Module({
  providers: [OpenAIProvider, DeepSeekProvider, LlmFactory],
  exports: [LlmFactory],
})
export class LlmModule {}
