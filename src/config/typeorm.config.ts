import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

type DatabaseConfig = {
  type: 'mysql' | 'mariadb';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
};

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const database = configService.get<DatabaseConfig>('database');

    return {
      type: database?.type ?? 'mysql',
      host: database?.host ?? 'localhost',
      port: database?.port ?? 3306,
      username: database?.username ?? 'root',
      password: database?.password ?? 'root',
      database: database?.database ?? 'shopping_cart',
      synchronize: database?.synchronize ?? false,
      logging: database?.logging ?? false,
      autoLoadEntities: true,
    };
  },
  inject: [ConfigService],
};
