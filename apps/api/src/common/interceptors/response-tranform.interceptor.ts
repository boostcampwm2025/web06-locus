import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ApiResponseType } from '../type/api-response.types';
import { ApiResponse } from '../utils/api-response.helper';
import { Request } from 'express';

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ApiResponseType<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseType<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.url.includes('/metrics')) {
      return next.handle() as Observable<ApiResponseType<T>>;
    }
    return next.handle().pipe(map((data: T) => ApiResponse.success(data)));
  }
}
