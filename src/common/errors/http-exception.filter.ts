import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const requestId =
      (req.headers['x-request-id'] as string | undefined) ?? 'unknown';

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const isClientError = status < 500;

    let message: string;
    let code: string;

    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        const b = body as Record<string, unknown>;
        message = Array.isArray(b['message'])
          ? (b['message'] as string[]).join(', ')
          : String(b['message'] ?? exception.message);
      } else {
        message = exception.message;
      }
      code = exception.constructor.name.replace(/Exception$/, '').toUpperCase();
    } else {
      message = 'Internal server error';
      code = 'INTERNAL_SERVER_ERROR';
    }

    if (!isClientError) {
      this.logger.error(
        `${req.method} ${req.url} status=${status} request_id=${requestId} — ${
          exception instanceof Error ? exception.message : String(exception)
        }`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        `${req.method} ${req.url} status=${status} request_id=${requestId} — ${message}`,
      );
    }

    res.status(status).json({
      error: { code, message, request_id: requestId },
    });
  }
}
