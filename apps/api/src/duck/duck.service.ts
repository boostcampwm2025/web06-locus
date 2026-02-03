import { REDIS_KEY_PREFIX } from '@/redis/redis.constants';
import { RedisService } from '@/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { DuckCommentResponseDto } from './dto/duck-comment-response.dto';

@Injectable()
export class DuckService {
  private readonly logger = new Logger(DuckService.name);

  constructor(private readonly redisService: RedisService) {}

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
    return DuckCommentResponseDto.of(this.getDefaultComments());
  }

  getDefaultComments(): string[] {
    return [
      '오늘도 기록은 네가 해야지, 내가 할 순 없다.',
      '이렇게 가만히 있다가, 기록 다 놓친다.',
      '기록도 습관이다, 오늘이 딱 시작할 타이밍.',
      '오래 쉬면 둔해져. 다시 한 번 써보자!',
      '별거 안 해도 괜찮아, 시작한 것만으로 반이나 왔다.',
      '누군가와 비교하지 마. 네 리듬대로 가는 거야!',
      '기록이 쌓이면, 언젠가 너도 놀랄 거다.',
      '주저 말고 남겨. 완벽하려다 시작도 못한단다.',
      '오늘 한 줄, 내일을 바꾼다. 안 믿기지? 해봐. 아자아!',
      '끈기가 답이다. 어제보다 한 줄 더 쓰면 이긴 거지.',
    ];
  }
}
