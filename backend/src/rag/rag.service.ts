import { Injectable } from '@nestjs/common';

@Injectable()
export class RagService {
  retrieveTopChunks(chunks: Array<{ id: string; text: string; title: string }>, objective: string, limit = 5) {
    const scored = chunks.map((chunk) => {
      const score = objective
        .toLowerCase()
        .split(/\s+/)
        .filter((token) => token.length > 3)
        .reduce((acc, token) => acc + (chunk.text.toLowerCase().includes(token) ? 1 : 0), 0);
      return { ...chunk, score };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}
