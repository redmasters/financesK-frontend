export const environment = {
  production: false,
  apiUrl: 'https://staging-api.yourdomain.com/api/v1', // Substitua por seu domínio de staging
  enableDevTools: false,
  enableMocking: false,
  logging: {
    level: 'info',
    enableConsole: true,
    enableRemoteLogging: true
  },
  features: {
    enableAnalytics: false,
    enableNotifications: true,
    enableOnboarding: true
  },
  security: {
    enableHttps: true,
    enableCSP: true
  }
};

