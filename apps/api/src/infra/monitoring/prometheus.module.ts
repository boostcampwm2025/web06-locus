import { Module } from '@nestjs/common';
import { PrometheusModule as NestPrometheusModule } from '@willsoto/nestjs-prometheus';
import { allMetricsProviders } from './metrics.provider';
import { ApiMetricsInterceptor } from '@/infra/monitoring/interceptor/api-metrics.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ApiMetricsService } from './services/api-metrics.service';
import { OutboxMetricsService } from './services/outbox-metrics.service';
import { RabbitMQMetricsService } from './services/rabbitmq-metrics.service';
import { ElasticsearchMetricsService } from './services/elasticsearch-metrics.service';

@Module({
  imports: [
    NestPrometheusModule.register({
      defaultMetrics: { enabled: true },
      path: '/metrics',
      defaultLabels: { app: 'locus' },
    }),
  ],
  providers: [
    ...allMetricsProviders,
    ApiMetricsService,
    OutboxMetricsService,
    RabbitMQMetricsService,
    ElasticsearchMetricsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiMetricsInterceptor,
    },
  ],
  exports: [
    NestPrometheusModule,
    OutboxMetricsService,
    RabbitMQMetricsService,
    ElasticsearchMetricsService,
  ],
})
export class PrometheusModule {}
