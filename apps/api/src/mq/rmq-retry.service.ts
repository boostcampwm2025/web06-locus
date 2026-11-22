import { Injectable, Logger } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { Channel, ConfirmChannel, Message } from 'amqplib';

export const RMQ_RETRY_COUNT_HEADER = 'x-retry-count';
export const RMQ_DLQ_SUFFIX = '.dlq';

export interface RmqRetryOptions {
  /** 이 횟수만큼 재시도해도 실패하면 DLQ로 보낸다 */
  maxRetries: number;
  /** 지수 백오프 기준 지연(ms): base * 2^재시도횟수 */
  baseDelayMs: number;
  /** 백오프 상한(ms) */
  maxDelayMs: number;
}

export const DEFAULT_RMQ_RETRY_OPTIONS: RmqRetryOptions = {
  maxRetries: 5,
  baseDelayMs: 1000,
  maxDelayMs: 30_000,
};

export type RmqFailureOutcome =
  | 'RETRY_SCHEDULED' // 재시도 횟수를 올려 같은 큐에 다시 발행하고 원본은 ACK
  | 'DEAD_LETTERED' // DLQ로 보내고 원본은 ACK
  | 'REQUEUED'; // 재발행/DLQ 발행에 실패해 원본을 그대로 되돌림(NACK + requeue)

/**
 * 재시도해도 소용없는 메시지(형식 오류 등)에 던진다.
 * 재시도 없이 바로 DLQ로 보낸다.
 */
export class NonRetryableMessageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NonRetryableMessageError';
  }
}

/**
 * 큐와 무관한 메시지 실패 처리(재시도 상한 + DLQ)
 *
 * 기존에는 실패 시 nack(requeue: true)만 해서 상한이 없고, 처리 불가능한 메시지(poison)가
 * 큐 맨 앞에서 무한히 재처리됐다. 이 서비스는 실패한 메시지를
 * 1) `x-retry-count` 헤더를 올려 같은 큐에 다시 발행(지수 백오프)하고 원본을 ACK,
 * 2) 상한을 넘으면 `<큐 이름>.dlq`로 보내고 원본을 ACK 한다.
 *
 * - 원본은 새 메시지가 브로커에 확정(confirm)된 뒤에만 ACK → 메시지 유실 없음(최소 한 번)
 * - 재발행 직후 크래시하면 같은 메시지가 두 번 전달될 수 있으나, 컨슈머가 멱등이면 안전
 * - 큐 이름은 메시지의 routingKey(기본 exchange로 발행하면 큐 이름과 같다)에서 얻으므로
 *   어떤 큐의 컨슈머에서도 그대로 쓸 수 있다
 */
@Injectable()
export class RmqRetryService {
  private readonly logger = new Logger(RmqRetryService.name);
  private readonly assertedDlqs = new Set<string>();

  async handleFailure(
    context: RmqContext,
    error: unknown,
    options: Partial<RmqRetryOptions> = {},
  ): Promise<RmqFailureOutcome> {
    const { maxRetries, baseDelayMs, maxDelayMs } = {
      ...DEFAULT_RMQ_RETRY_OPTIONS,
      ...options,
    };
    const channel = context.getChannelRef() as Channel;
    const message = context.getMessage() as Message;
    const queue = message.fields.routingKey;
    const attempt = this.getRetryCount(message);
    const retryable = !(error instanceof NonRetryableMessageError);

    try {
      if (!retryable || attempt >= maxRetries) {
        await this.sendToDeadLetter(channel, queue, message, attempt, error);
        channel.ack(message);
        this.logger.error(
          `🚨 ${queue}: 메시지를 DLQ(${queue}${RMQ_DLQ_SUFFIX})로 이동 (시도 ${attempt}회, ${retryable ? '재시도 상한 초과' : '재시도 불가'})`,
        );
        return 'DEAD_LETTERED';
      }

      await this.delay(Math.min(baseDelayMs * 2 ** attempt, maxDelayMs));
      await this.publish(channel, queue, message, {
        ...message.properties.headers,
        [RMQ_RETRY_COUNT_HEADER]: attempt + 1,
      });
      channel.ack(message);
      this.logger.warn(
        `↩️ ${queue}: 재시도 ${attempt + 1} / ${maxRetries} 예약`,
      );
      return 'RETRY_SCHEDULED';
    } catch (routingError) {
      // 재발행/DLQ 발행에 실패하면 원본을 잃지 않도록 그대로 되돌린다.
      this.logger.error(
        `${queue}: 재시도/DLQ 이동 실패, 원본을 requeue 합니다`,
        routingError,
      );
      channel.nack(message, false, true);
      return 'REQUEUED';
    }
  }

  private getRetryCount(message: Message): number {
    const raw = message.properties.headers?.[RMQ_RETRY_COUNT_HEADER] as unknown;
    const count = Number(raw);
    return Number.isInteger(count) && count > 0 ? count : 0;
  }

  private async sendToDeadLetter(
    channel: Channel,
    queue: string,
    message: Message,
    attempt: number,
    error: unknown,
  ): Promise<void> {
    const dlq = `${queue}${RMQ_DLQ_SUFFIX}`;
    if (!this.assertedDlqs.has(dlq)) {
      await channel.assertQueue(dlq, { durable: true });
      this.assertedDlqs.add(dlq);
    }

    await this.publish(channel, dlq, message, {
      ...message.properties.headers,
      [RMQ_RETRY_COUNT_HEADER]: attempt,
      'x-original-queue': queue,
      'x-failed-at': new Date().toISOString(),
      'x-error': (error instanceof Error ? error.message : String(error)).slice(
        0,
        500,
      ),
    });
  }

  /** 새 메시지를 보내고, 확정(confirm) 채널이면 브로커가 받을 때까지 기다린다. */
  private async publish(
    channel: Channel,
    queue: string,
    message: Message,
    headers: Record<string, unknown>,
  ): Promise<void> {
    channel.sendToQueue(queue, message.content, {
      ...message.properties,
      headers,
    });

    const confirmChannel = channel as Partial<ConfirmChannel>;
    if (typeof confirmChannel.waitForConfirms === 'function') {
      await confirmChannel.waitForConfirms();
    }
  }

  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
