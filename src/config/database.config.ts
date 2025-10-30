import { registerAs } from '@nestjs/config';

type DatabaseType = 'mysql' | 'mariadb';

export default registerAs('database', () => ({
  type: (process.env.DB_TYPE as DatabaseType) ?? 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? 'root',
  database: process.env.DB_NAME ?? 'shopping_cart',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
}));
