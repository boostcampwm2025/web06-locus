import { REDIS_KEY_PREFIX } from '@/redis/redis.constants';
import { RedisService } from '@/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { DuckCommentResponseDto } from './dto/duck-comment-response.dto';
import { DuckRecordCreatedEvent } from './types/duck-record-created.event';
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

  /**
   * 기록 생성 이벤트 처리(최소 한 번 전달 → 멱등)
   * - 이벤트 ID를 먼저 선점(SET NX)해, 같은 이벤트가 중복 전달돼도 카운트가 한 번만 오른다.
   * - 카운트 단계가 실패하면 선점을 풀고 예외를 던져 재시도되게 한다.
   *   (선점을 남기면 재시도가 중복으로 오인돼 카운트가 영영 반영되지 않는다)
   * - 멘트 갱신은 이미 카운트가 반영된 뒤의 부가 작업이라, 실패해도 재시도하지 않는다.
   *   카운트/풀 조건이 유지되므로 다음 기록 생성 때 다시 갱신된다.
   * @returns 처리했으면 'PROCESSED', 이미 처리한 이벤트면 'DUPLICATE'
   */
  async handleRecordCreated(
    event: DuckRecordCreatedEvent,
  ): Promise<'PROCESSED' | 'DUPLICATE'> {
    const userId = BigInt(event.userId);

    const eventKey = `${REDIS_KEY_PREFIX.DUCK_EVENT}${event.eventId}`;
    const countKey = `${REDIS_KEY_PREFIX.DUCK_COUNT}${userId}`;
    const poolKey = `${REDIS_KEY_PREFIX.DUCK_POOL}${userId}`;

    const claimed = await this.redisService.setIfAbsent(
      eventKey,
      '1',
      DUCK_POLICY.EVENT_DEDUP_TTL,
    );
    if (!claimed) {
      this.logger.log(
        `⏭️ 이미 처리한 오리 이벤트(${event.eventId})라 건너뜁니다.`,
      );
      return 'DUPLICATE';
    }

    let shouldRefresh: boolean;
    try {
      const currentCount = await this.redisService.incr(countKey);
      const poolExists = await this.redisService.isExists(poolKey);

      this.logger.log(
        `🐥 유저 ${userId} 기록 생성 감지! 현재 카운트: ${currentCount}`,
      );
      shouldRefresh =
        currentCount >= DUCK_POLICY.UPDATE_THRESHOLD || !poolExists;
    } catch (error) {
      await this.redisService.del(eventKey).catch(() => undefined);
      throw error;
    }

    if (shouldRefresh) {
      this.logger.log(`🚀 유저 ${userId}의 오리 멘트 갱신을 트리거합니다.`);
      try {
        await this.refreshComments(userId);
        await this.redisService.del(countKey);
      } catch (error) {
        this.logger.error(
          `유저 ${userId} 오리 멘트 갱신 실패(다음 기록 생성 때 재시도)`,
          error,
        );
      }
    }

    return 'PROCESSED';
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
