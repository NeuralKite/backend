import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig, databaseConfig } from '../config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(databaseConfig)],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const config = configService.get<DatabaseConfig>('database');
        if (!config) {
          throw new Error('Database configuration is not defined');
        }

        if (config.type === 'sqljs') {
          return {
            type: 'sqljs' as const,
            autoSave: false,
            dropSchema: process.env.NODE_ENV === 'test',
            synchronize: true,
            autoLoadEntities: true,
            logging: config.logging,
          };
        }

        return {
          type: 'mysql' as const,
          host: config.host,
          port: config.port,
          username: config.username,
          password: config.password,
          database: config.name,
          autoLoadEntities: true,
          synchronize: false,
          logging: config.logging,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
