import { registerAs } from '@nestjs/config';

export type DatabaseType = 'mysql' | 'mariadb';

const toNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value: string | undefined, fallback = false): boolean => {
  if (typeof value === 'undefined') {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

const normalizeHost = (host: string | undefined): string => {
  if (!host || host.trim().length === 0) {
    return '127.0.0.1';
  }

  const trimmed = host.trim();
  return trimmed === 'localhost' ? '127.0.0.1' : trimmed;
};

export type DatabaseConfig = {
  type: DatabaseType;
  host: string;
  port: number;
  socketPath?: string;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
  retryAttempts: number;
  retryDelay: number;
};

export default registerAs(
  'database',
  (): DatabaseConfig => ({
    type: (process.env.DB_TYPE as DatabaseType) ?? 'mysql',
    host: normalizeHost(process.env.DB_HOST),
    port: toNumber(process.env.DB_PORT, 3306),
    socketPath: process.env.DB_SOCKET_PATH,
    username: process.env.DB_USERNAME ?? process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? 'Ricar555@',
    database:
      process.env.DB_DATABASE ?? process.env.DB_NAME ?? 'shopping_cart_db',
    synchronize: toBoolean(process.env.DB_SYNCHRONIZE),
    logging: toBoolean(process.env.DB_LOGGING),
    retryAttempts: toNumber(process.env.DB_RETRY_ATTEMPTS, 5),
    retryDelay: toNumber(process.env.DB_RETRY_DELAY, 3000),
  }),
);
