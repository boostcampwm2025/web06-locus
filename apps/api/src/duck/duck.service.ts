import { REDIS_KEY_PREFIX } from '@/redis/redis.constants';
import { RedisService } from '@/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { DuckCommentResponseDto } from './dto/duck-comment-response.dto';
import { RecordSyncPayload } from '@/records/type/record-sync.types';
import { RecordsService } from '@/records/records.service';
import { NcpAiService } from './ncp-ai.service';
import { UsersService } from '@/users/users.service';
import {
  DUCK_DEFAULT_COMMENTS,
  DUCK_POLICY,
} from './constants/duck.policy.constants';
import { AiRecordContext } from './types/ncp-ai.types';

@Injectable()
export class DuckService {
  private readonly logger = new Logger(DuckService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly recordsService: RecordsService,
    private readonly ncpAiService: NcpAiService,
    private readonly usersService: UsersService,
  ) {}

  async getComments(userId: bigint): Promise<DuckCommentResponseDto> {
    const key = `${REDIS_KEY_PREFIX.DUCK_POOL}${userId}`;
    const cached = await this.redisService.get(key);

    if (cached) {
      try {
        const comments = JSON.parse(cached) as string[];
        return DuckCommentResponseDto.of(comments);
      } catch (e) {
        this.logger.error(`Failed to parse duck pool for user ${userId}`, e);
      }
    }

    // 데이터가 없거나 에러 시 기본 멘트 반환
    return DuckCommentResponseDto.of(DUCK_DEFAULT_COMMENTS);
  }

  async handleRecordCreated(payload: RecordSyncPayload) {
    const userId = BigInt(payload.userId);

    const countKey = `${REDIS_KEY_PREFIX.DUCK_COUNT}${userId}`;
    const poolKey = `${REDIS_KEY_PREFIX.DUCK_POOL}${userId}`;

    const currentCount = await this.redisService.incr(countKey);
    const poolExists = await this.redisService.isExists(poolKey);

    this.logger.log(
      `🐥 유저 ${userId} 기록 생성 감지! 현재 카운트: ${currentCount}`,
    );

    if (currentCount >= DUCK_POLICY.UPDATE_THRESHOLD || !poolExists) {
      this.logger.log(`🚀 유저 ${userId}의 오리 멘트 갱신을 트리거합니다.`);

      await this.refreshComments(userId);
      await this.redisService.del(countKey);
    }
  }

  private async refreshComments(userId: bigint): Promise<string[]> {
    const nickname = await this.usersService.findNickNameById(userId);

    const recentRecordsResult = await this.recordsService.getAllRecords(
      userId,
      {
        page: 1,
        limit: DUCK_POLICY.RECENT_RECORD_LIMIT,
        sortOrder: 'desc',
      },
    );

    // 기록이 0개인 경우 AI 호출 없이 기본 멘트 반환
    if (recentRecordsResult.totalCount === 0) {
      return this.saveAndReturnDefaultComments(userId);
    }

    const recordsForAi: AiRecordContext[] = recentRecordsResult.records.map(
      (r) => ({
        title: r.title,
        location: r.location.name ?? '',
        tags: r.tags.map((t) => t.name),
      }),
    );

    try {
      const newComments = await this.ncpAiService.generateDuckComments(
        nickname,
        recordsForAi,
      );

      await this.saveCommentsToRedis(userId, newComments);
      return newComments;
    } catch (e) {
      this.logger.error(`AI 갱신 실패로 기본 멘트를 사용합니다.`, e);
      return this.saveAndReturnDefaultComments(userId);
    }
  }

  private async saveCommentsToRedis(userId: bigint, comments: string[]) {
    const key = `${REDIS_KEY_PREFIX.DUCK_POOL}${userId}`;
    await this.redisService.set(
      key,
      JSON.stringify(comments),
      DUCK_POLICY.POOL_TTL,
    );
  }

  private async saveAndReturnDefaultComments(
    userId: bigint,
  ): Promise<string[]> {
    await this.saveCommentsToRedis(userId, DUCK_DEFAULT_COMMENTS);
    return DUCK_DEFAULT_COMMENTS;
  }
}
