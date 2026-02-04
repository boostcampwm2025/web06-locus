import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiMetricsService } from '../services/api-metrics.service';
import { Request, Response } from 'express';

@Injectable()
export class ApiMetricsInterceptor implements NestInterceptor {
  private readonly EXCLUDE_PATHS = ['/api/metrics'];

  constructor(private readonly apiMetricsService: ApiMetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const method: string = request.method;
    const url: string = request.url;
    const route = request.route as { path: string } | undefined;
    const path: string = route?.path ?? url;

    if (this.EXCLUDE_PATHS.some((excludePath) => path.includes(excludePath))) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse<Response>();
          const statusCode = response.statusCode;
          const duration = (Date.now() - startTime) / 1000;
          this.recordApiMetrics(method, path, statusCode, duration);
        },
        error: (error: { status?: number; statusCode?: number }) => {
          const statusCode = error.status ?? error.statusCode ?? 500;
          const duration = (Date.now() - startTime) / 1000;
          this.recordApiMetrics(method, path, statusCode, duration);
        },
      }),
    );
  }
  private recordApiMetrics(
    method: string,
    path: string,
    status: number,
    duration: number,
  ) {
    this.apiMetricsService.recordRequest(method, path, status);
    this.apiMetricsService.recordAPIDurationTime(
      method,
      path,
      status,
      duration,
    );
  }
}
