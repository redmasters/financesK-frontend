export const environment = {
  production: true,
  envName: 'production',
  apiUrl: '/api/v1',
  enableDevTools: false,
  enableMocking: false,
  logging: {
    level: 'error',
    enableConsole: false,
    enableRemoteLogging: true
  },
  features: {
    enableAnalytics: true,
    enableNotifications: true,
    enableOnboarding: true
  },
  security: {
    enableHttps: true,
    enableCSP: true
  }
};
