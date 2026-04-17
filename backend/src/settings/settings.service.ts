import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Client } from 'pg';

@Injectable()
export class SettingsService {
  constructor(private readonly configService: ConfigService) {}

  async getHealth() {
    const dbClient = new Client({ connectionString: this.configService.get<string>('DATABASE_URL') });
    const redis = new Redis(this.configService.get<string>('REDIS_URL', 'redis://localhost:6379'));

    let database = 'down';
    let cache = 'down';

    try {
      await dbClient.connect();
      await dbClient.query('SELECT 1');
      database = 'up';
    } catch {
      database = 'down';
    } finally {
      await dbClient.end().catch(() => undefined);
    }

    try {
      const pong = await redis.ping();
      cache = pong === 'PONG' ? 'up' : 'down';
    } catch {
      cache = 'down';
    } finally {
      await redis.quit().catch(() => undefined);
    }

    return {
      activeProvider: this.configService.get<string>('LLM_PROVIDER', 'deepseek'),
      activeModel:
        this.configService.get<string>('LLM_PROVIDER', 'deepseek') === 'openai'
          ? this.configService.get<string>('OPENAI_MODEL', 'gpt-4.1')
          : this.configService.get<string>('DEEPSEEK_MODEL', 'deepseek-chat'),
      database,
      redis: cache,
      ingestionDefaults: { chunkingStrategy: 'heading_rule_api_module', embeddingStore: 'pgvector' },
      generationDefaults: { mode: 'standard', includePostman: true, includeSqlValidation: true, includeCoverage: true },
    };
  }
}
