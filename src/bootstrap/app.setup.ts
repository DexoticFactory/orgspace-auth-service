import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '../common/errors/http-exception.filter';

export function setupApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const origins = process.env['CORS_ORIGINS']
    ? process.env['CORS_ORIGINS'].split(',').map((o) => o.trim())
    : [];

  app.enableCors({
    origin: origins.length > 0 ? origins : false,
    credentials: true,
  });

  // ponytail: helmet not installed — add when `npm install helmet` is run
  // app.use(require('helmet')());
}
