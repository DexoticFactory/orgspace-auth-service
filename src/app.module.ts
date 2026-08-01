import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    HealthModule,

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('DB_HOST'),
        port: cfg.get<number>('DB_PORT'),
        database: cfg.get('DB_NAME'),
        username: cfg.get('DB_USER'),
        password: cfg.get('DB_PASS'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,         // ponytail: migrations only; enable never in prod
        logging: cfg.get('NODE_ENV') === 'development',
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
