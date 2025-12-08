(window as any).process = {
  env: {
    APP_SECRET_KEY: 'test-secret',
    JWT_SECRET: 'test-jwt',
    NODE_ENV: 'test',
  },
};
