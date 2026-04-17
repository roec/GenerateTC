import { Injectable } from '@nestjs/common';

@Injectable()
export class ParsingService {
  parseToChunks(content: string) {
    return content
      .split(/\n\n+/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((text, index) => ({
        id: `chunk-${index + 1}`,
        title: `Section ${index + 1}`,
        text,
      }));
  }
}
