import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../../types';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((response: unknown) => {
        if (typeof response === 'object' && response !== null && 'data' in response) {
          const res = response as Record<string, unknown>;
          return {
            success: true,
            data: res.data as T,
            meta: res.meta as Record<string, unknown> | undefined,
            timestamp: new Date().toISOString(),
          };
        }
        return {
          success: true,
          data: response as T,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
