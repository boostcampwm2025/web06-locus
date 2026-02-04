import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { API_METRICS } from '../constants/metrics.constants';

@Injectable()
export class ApiMetricsService {
  constructor(
    @InjectMetric(API_METRICS.HTTP_REQUESTS_TOTAL)
    private readonly requestsTotal: Counter<string>,

    @InjectMetric(API_METRICS.HTTP_REQUEST_DURATION_SEC)
    private readonly requestDuration: Histogram<string>,
  ) {}

  // request 기록
  recordRequest(method: string, path: string, statusCode: number): void {
    this.requestsTotal.inc({ method, path, status: statusCode.toString() });
  }

  recordAPIDurationTime(
    method: string,
    path: string,
    statusCode: number,
    durationSeconds: number,
  ): void {
    this.requestDuration.observe(
      { method, path, status: statusCode.toString() },
      durationSeconds,
    );
  }
}
