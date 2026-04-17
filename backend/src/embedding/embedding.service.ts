import { Injectable } from '@nestjs/common';

@Injectable()
export class EmbeddingService {
  generateVector(text: string) {
    const seed = text.length % 10;
    return Array.from({ length: 8 }).map((_, idx) => Number(((seed + idx) / 10).toFixed(2)));
  }
}
