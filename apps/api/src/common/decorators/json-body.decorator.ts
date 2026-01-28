import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance, ClassConstructor } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationException } from '../exceptions/validation.exception';
import { Request } from 'express';

interface MultipartFormBody {
  data?: string;
  [key: string]: unknown;
}

export function JsonBody<T extends object>(
  dtoClass: ClassConstructor<T>,
  field = 'data',
) {
  return createParamDecorator(
    async (_data: unknown, ctx: ExecutionContext): Promise<T> => {
      const request = ctx.switchToHttp().getRequest<Request>();
      const body = request.body as MultipartFormBody;
      const jsonString = body[field];

      if (typeof jsonString !== 'string') {
        throw new BadRequestException('Expected a JSON string');
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonString);
      } catch {
        throw new BadRequestException('Invalid JSON format');
      }

      const instance = plainToInstance(dtoClass, parsed);

      const errors = await validate(instance, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });

      if (errors.length > 0) {
        throw new ValidationException(errors);
      }

      return instance;
    },
  )();
}
