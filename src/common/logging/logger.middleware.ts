import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const requestId =
      (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
    const { method, url } = req;
    const start = Date.now();

    this.logger.log(
      `→ ${method} ${url} request_id=${requestId} ts=${new Date().toISOString()}`,
    );

    res.on('finish', () => {
      const latencyMs = Date.now() - start;
      this.logger.log(
        `← ${method} ${url} status=${res.statusCode} latency_ms=${latencyMs} request_id=${requestId}`,
      );
    });

    req.headers['x-request-id'] = requestId;
    next();
  }
}
