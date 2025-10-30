import { registerAs } from '@nestjs/config';

export type SupportedDatabaseType = 'mysql' | 'sqljs';

export interface DatabaseConfig {
  type: SupportedDatabaseType;
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
  logging: boolean;
}

const DEFAULT_TYPE = (process.env.NODE_ENV === 'test' ? 'sqljs' : 'mysql') as SupportedDatabaseType;

export const databaseConfig = registerAs('database', (): DatabaseConfig => ({
  type: (process.env.DATABASE_TYPE as SupportedDatabaseType) ?? DEFAULT_TYPE,
  host: process.env.DATABASE_HOST ?? '127.0.0.1',
  port: Number(process.env.DATABASE_PORT ?? 3306),
  username: process.env.DATABASE_USERNAME ?? 'cart_app',
  password: process.env.DATABASE_PASSWORD ?? 'cart_app',
  name: process.env.DATABASE_NAME ?? 'cart_service',
  logging: (process.env.DATABASE_LOGGING ?? 'false').toLowerCase() === 'true',
}));
