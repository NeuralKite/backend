import { ConfigModule, ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { DatabaseConfig } from './database.config';

const logger = new Logger('TypeORM');

const maskPassword = (value: string): string => {
  if (!value) {
    return '***';
  }

  return '*'.repeat(Math.min(8, value.length));
};

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const database = configService.get<DatabaseConfig>('database');

    const connectionOptions: TypeOrmModuleOptions = {
      type: database?.type ?? 'mysql',
      host: database?.host ?? 'localhost',
      port: database?.port ?? 3306,
      username: database?.username ?? 'root',
      password: database?.password ?? 'root',
      database: database?.database ?? 'shopping_cart',
      synchronize: database?.synchronize ?? false,
      logging: database?.logging ?? false,
      autoLoadEntities: true,
      retryAttempts: database?.retryAttempts ?? 5,
      retryDelay: database?.retryDelay ?? 3000,
      extra: {},
    };

    if (database?.socketPath) {
      Object.assign(connectionOptions.extra, {
        socketPath: database.socketPath,
      });
    } else {
      Object.assign(connectionOptions, {
        host: database?.host ?? '127.0.0.1',
        port: database?.port ?? 3306,
      });
    }

    const logHost = database?.socketPath
      ? `socket:${database.socketPath}`
      : `${connectionOptions.host ?? '127.0.0.1'}:${connectionOptions.port ?? 3306}`;

    logger.log(
      `Connecting to ${connectionOptions.type}://${connectionOptions.username}:${maskPassword(connectionOptions.password)}@${logHost}/${connectionOptions.database} ` +
        `(retryAttempts=${connectionOptions.retryAttempts}, retryDelay=${connectionOptions.retryDelay}ms)`,
    );

    return connectionOptions;
  },
  inject: [ConfigService],
};
