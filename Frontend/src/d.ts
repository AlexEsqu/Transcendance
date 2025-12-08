declare module "*.html" {
    const content: string;
    export default content;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly APP_SECRET_KEY: string;
    readonly JWT_SECRET: string;
    readonly NODE_ENV: 'development' | 'production';
  }
}
