import { Module } from '@nestjs/common';
import { PrometheusModule as NestPrometheusModule } from '@willsoto/nestjs-prometheus';
import { metricsProviders } from './metrics.provider';
import { ApiMetricsInterceptor } from '@/infra/monitoring/interceptor/api-metrics.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ApiMetricsService } from './api-metrics.service';

@Module({
  imports: [
    NestPrometheusModule.register({
      defaultMetrics: { enabled: true },
      path: '/metrics',
      defaultLabels: { app: 'locus' },
    }),
  ],
  providers: [
    ...metricsProviders,
    ApiMetricsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiMetricsInterceptor,
    },
  ],
  exports: [NestPrometheusModule],
})
export class PrometheusModule {}
