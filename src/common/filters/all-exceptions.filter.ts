import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: any;
  statusCode: number;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const responseData = exception.getResponse();

      if (typeof responseData === 'object' && responseData !== null) {
        message = (responseData as any).message || exception.message;
        errors = (responseData as any).errors;
      } else {
        message = responseData as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse: ErrorResponse = {
      success: false,
      message,
      statusCode,
    };

    if (errors) {
      errorResponse.errors = errors;
    }

    response.status(statusCode).json(errorResponse);
  }
}
