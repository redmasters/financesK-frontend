import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideClientHydration, withEventReplay} from '@angular/platform-browser';
import {provideHttpClient} from '@angular/common/http';
import {provideServerRouting} from '@angular/ssr';
import {serverRoutes} from './app.routes.server';
import {provideServerRendering} from '@angular/platform-server';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    // provideServerRouting(serverRoutes),
    // provideServerRendering(),
    provideHttpClient(),
    provideClientHydration(withEventReplay())
  ]
};
