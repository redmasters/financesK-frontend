export const environment = {
  production: true,
  apiUrl: 'https://financesk.ddns.net', // URL da API para Vercel
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
  },
  vercel: {
    enabled: true,
    analytics: true,
    vitals: true
  }
};

