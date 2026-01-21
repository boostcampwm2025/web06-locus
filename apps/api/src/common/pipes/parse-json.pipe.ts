import { PipeTransform, BadRequestException } from '@nestjs/common';
import { plainToInstance, ClassConstructor } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { ValidationException } from '../exceptions/validation.exception';

export class ParseJsonPipe<T extends object>
  implements PipeTransform<string, Promise<T>>
{
  constructor(private readonly dtoClass: ClassConstructor<T>) {}

  async transform(value: string): Promise<T> {
    if (typeof value !== 'string') {
      throw new BadRequestException('Expected a JSON string');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch {
      throw new BadRequestException('Invalid JSON format');
    }

    const instance = plainToInstance(this.dtoClass, parsed);

    const errors: ValidationError[] = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      throw new ValidationException(errors);
    }

    return instance;
  }
}
