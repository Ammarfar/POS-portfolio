import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

interface ErrorResponseBody {
  code: string;
  message: string;
  statusCode: number;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: ErrorResponseBody = {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      statusCode: status,
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        body = {
          code: (resObj['code'] as string) ?? HttpStatus[status] ?? 'ERROR',
          message:
            (resObj['message'] as string) ??
            exception.message ??
            'An error occurred',
          statusCode: status,
        };
      } else {
        body = {
          code: HttpStatus[status] ?? 'ERROR',
          message: typeof res === 'string' ? res : exception.message,
          statusCode: status,
        };
      }
    }

    if (status >= 500) {
      this.logger.error(
        `[${status}] ${body.code}: ${body.message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json(body);
  }
}
