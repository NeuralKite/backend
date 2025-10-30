export interface AppConfig {
  environment: string;
  port: number;
}

export const appConfig = (): { app: AppConfig } => ({
  app: {
    environment: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3000),
  },
});
