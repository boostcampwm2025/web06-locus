import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseJsonPipe implements PipeTransform {
  transform(value: string): unknown {
    if (typeof value !== 'string') {
      throw new BadRequestException('Expected a JSON string');
    }

    try {
      return JSON.parse(value) as unknown;
    } catch {
      throw new BadRequestException('Invalid JSON format');
    }
  }
}
