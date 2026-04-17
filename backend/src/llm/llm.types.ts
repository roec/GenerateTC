export interface LLMGenerateParams {
  systemPrompt: string;
  userPrompt: string;
  context?: string;
  temperature?: number;
  responseFormat?: 'text' | 'json';
}

export interface LLMProvider {
  generate(params: LLMGenerateParams): Promise<string>;
}
