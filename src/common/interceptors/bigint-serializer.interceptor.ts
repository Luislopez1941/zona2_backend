import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interceptor que convierte BigInt a string para poder serializarlos en JSON
 */
@Injectable()
export class BigIntSerializerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => this.transformBigInt(data)),
    );
  }

  private transformBigInt(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'bigint') {
      return obj.toString();
    }

    // Manejar Date antes de otros objetos
    if (obj instanceof Date) {
      return obj.toISOString();
    }

    // Manejar Decimal de Prisma
    if (obj && typeof obj === 'object' && typeof obj.toNumber === 'function') {
      return obj.toNumber();
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.transformBigInt(item));
    }

    if (typeof obj === 'object') {
      const transformed: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          transformed[key] = this.transformBigInt(obj[key]);
        }
      }
      return transformed;
    }

    return obj;
  }
}

