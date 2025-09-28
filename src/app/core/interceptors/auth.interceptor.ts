import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token;

  console.log('AuthInterceptor executado:', {
    url: req.url,
    hasToken: !!token,
    token: token ? `${token.substring(0, 20)}...` : 'null'
  });

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Headers adicionados:', authReq.headers.get('Authorization'));
    return next(authReq);
  }

  console.log('Requisição sem token enviada');
  return next(req);
};
