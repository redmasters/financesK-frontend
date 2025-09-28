import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

// Otimizações específicas para Vercel
if (environment.production) {
  // Desabilitar logs em produção
  if (!environment.logging.enableConsole) {
    console.log = console.warn = console.error = () => {};
  }
}

bootstrapApplication(AppComponent, appConfig).catch((err) => {
  if (environment.logging.enableConsole) {
    console.error(err);
  }
});
