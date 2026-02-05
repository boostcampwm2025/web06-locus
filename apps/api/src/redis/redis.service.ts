import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { REDIS_CLIENT } from './redis.constants';
import { GraphResponseDto } from '@/records/dto/graph.response.dto';

const GRAPH_TTL_SECONDS = 300; // 5 minutes
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

  async incr(key: string): Promise<number> {
    return await this.redisClient.incr(key);
  }

  getClient() {
    return this.redisClient;
  }

  makeCachingRecordKey(userId: bigint, recordPublicId: string): string {
    return `record:user=${userId}:publicId=${recordPublicId}`;
  }

  makeCachingGraphKey(userId: bigint, startRecordPublicId: string): string {
    return `graph:user=${userId}:publicId=${startRecordPublicId}`;
  }

  async getCachedGraph(userId: bigint, startRecordPublicId: string) {
    const cachedRecordKey = this.makeCachingRecordKey(
      userId,
      startRecordPublicId,
    );
    const cachedGraphId = await this.get(cachedRecordKey);
    if (!cachedGraphId) return null;

    const rawGraph = await this.get(cachedGraphId);
    if (!rawGraph) return null;

    const cachedGraph = JSON.parse(rawGraph) as GraphResponseDto;
    return { cachedGraphId, cachedGraph };
  }

  async deleteCachedGraph(userId: bigint, startRecordPublicId: string) {
    const cached = await this.getCachedGraph(userId, startRecordPublicId);

    if (!cached) {
      return;
    }

    const pipeline = this.getClient().multi();

    cached.cachedGraph.nodes.forEach((node) => {
      const nodeCacheId = this.makeCachingRecordKey(userId, node.publicId);
      pipeline.del(nodeCacheId);
    });

    pipeline.del(cached.cachedGraphId);

    await pipeline.exec();
  }

  async cacheGraph(
    userId: bigint,
    startRecordPublicId: string,
    graph: GraphResponseDto,
    ttlSeconds = GRAPH_TTL_SECONDS,
  ) {
    const graphCacheId = this.makeCachingGraphKey(userId, startRecordPublicId);

    const pipeline = this.getClient().multi();
    pipeline.setEx(graphCacheId, ttlSeconds, JSON.stringify(graph));
    graph.nodes.forEach((node) => {
      const nodeCacheId = this.makeCachingRecordKey(userId, node.publicId);
      pipeline.setEx(nodeCacheId, ttlSeconds, graphCacheId);
    });
    await pipeline.exec();
  }
}
