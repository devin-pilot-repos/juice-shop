declare module './dotenv.config.cjs' {
  export function getEnv(key: string, defaultValue?: string): string;
  export function loadEnv(): void;
}
