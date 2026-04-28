import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseData {
  success: boolean;
  data?: any;
  message?: string;
  errors?: any;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode || HttpStatus.OK;

        // If data already has success property, return as-is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        return {
          success: statusCode < 400,
          data: data || null,
          message: 'Request successful',
        };
      }),
    );
  }
}
