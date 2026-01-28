import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
  ) {}

  async onModuleDestroy() {
    await this.redisClient.quit();
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redisClient.setEx(key, ttl, value);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async getTTL(key: string): Promise<number> {
    return await this.redisClient.ttl(key);
  }

  async isExists(key: string): Promise<boolean> {
    return Boolean(await this.redisClient.exists(key));
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async hSet(key: string, field: string, value: string): Promise<number> {
    return await this.redisClient.hSet(key, field, value);
  }

  async hGet(key: string, field: string): Promise<string | null> {
    return await this.redisClient.hGet(key, field);
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    return await this.redisClient.hGetAll(key);
  }

  async hDel(key: string, field: string): Promise<void> {
    await this.redisClient.hDel(key, field);
  }

  getClient() {
    return this.redisClient;
  }
}
