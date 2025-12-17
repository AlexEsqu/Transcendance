/// <reference types="vite/client" />

declare module '*.html' {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_APP_SECRET_KEY?: string;
  readonly VITE_JWT_SECRET?: string;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
