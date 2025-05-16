import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  Type,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

@Injectable()
export class SocketValidationPipe implements PipeTransform {
  transform<T = any>(value: unknown, metadata: ArgumentMetadata): T {
    const { metatype } = metadata;

    if (typeof value !== 'object' || value === null) {
      throw new WsException('Invalid message format');
    }

    if (!metatype || !this.toValidate(metatype)) {
      return value as T;
    }

    const object = plainToInstance(metatype as Type<T>, value);
    const errors = validateSync(object as object);

    if (errors.length > 0) {
      throw new WsException(errors);
    }

    return object;
  }

  private toValidate(metatype: Type<unknown>): boolean {
    const primitives: Type<unknown>[] = [
      String,
      Boolean,
      Number,
      Array,
      Object,
    ];
    return !primitives.includes(metatype);
  }
}
