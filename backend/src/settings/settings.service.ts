import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Client } from 'pg';

@Injectable()
export class SettingsService {
  constructor(private readonly configService: ConfigService) {}

  async getHealth() {
    const dbClient = new Client({ connectionString: this.configService.get<string>('DATABASE_URL') });
    const redis = new Redis(this.configService.get<string>('REDIS_URL', 'redis://localhost:6379'), {
      lazyConnect: true,
      enableReadyCheck: false,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    });

    redis.on('error', () => {
      // Intentionally swallow Redis connection errors for health probe mode.
      // Health status is returned via the `cache` field below.
    });

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
      await redis.connect();
      const pong = await redis.ping();
      cache = pong === 'PONG' ? 'up' : 'down';
    } catch {
      cache = 'down';
    } finally {
      await redis.quit().catch(() => undefined);
      redis.disconnect(false);
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
