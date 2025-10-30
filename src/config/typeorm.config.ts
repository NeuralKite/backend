import { ConfigService } from '@nestjs/config';
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
  imports: [],
  useFactory: async (configService: ConfigService) => {
    const database = configService.get<DatabaseConfig>('database');

    return {
      type: database?.type ?? 'mysql',
      host: database?.host ?? 'localhost',
      port: database?.port ?? 3306,
      username: database?.username ?? 'root',
      password: database?.password ?? 'Ricar555@',
      database: database?.database ?? 'shopping_cart_db',
      synchronize: database?.synchronize ?? true,
      logging: database?.logging ?? true,
      autoLoadEntities: true,
    };
  },
  inject: [ConfigService],
};
