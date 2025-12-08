import './setup';

declare const require: {
  context: (path: string, recursive: boolean, regExp: RegExp) => {
    keys: () => string[];
    <T = unknown>(id: string): T;
  };
};

const ctx = require.context('./', true, /\.spec\.ts$/);
ctx.keys().forEach(ctx);
