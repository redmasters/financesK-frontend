import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  LOCALE_ID
} from '@angular/core';
import {registerLocaleData} from '@angular/common';
import {provideRouter} from '@angular/router';
import localePt from '@angular/common/locales/pt';

import {routes} from './app.routes';

registerLocaleData(localePt, 'pt-BR')

export const appConfig: ApplicationConfig = {
  providers: [
    {provide: LOCALE_ID, useValue: 'pt-BR'},
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes)
  ]
};
