import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { LoggerService } from './logger.service';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  username: string;
  email: string;
  token: string;
  avatar?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  avatar?: File | string;
}

export interface CreateUserResponse {
  id: number;
  username: string;
  email: string;
  token: string;
  avatar?: string;
}

export interface PasswordResetResponse {
  message: string;
}

export interface PasswordResetError {
  error: string;
}

export interface PasswordChangeRequest {
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordChangeResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly USERS_API_URL = `${environment.apiUrl}/users`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private logger: LoggerService
  ) {
    // Recupera o usuário do localStorage se existir
    const storedUser = localStorage.getItem('currentUser');
    this.logger.debug('AuthService initialized', { hasStoredUser: !!storedUser });

    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();

    // Log do estado inicial
    const currentUser = this.currentUserValue;
    this.logger.debug('Initial authentication state', {
      isAuthenticated: this.isAuthenticated,
      hasToken: !!this.token,
      userId: currentUser?.id,
      username: currentUser?.username
    });
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isAuthenticated(): boolean {
    const user = this.currentUserValue;
    const hasValidUser = !!user && !!user.token;
    this.logger.debug('Authentication check', {
      hasUser: !!user,
      hasToken: !!user?.token,
      isAuthenticated: hasValidUser
    });
    return hasValidUser;
  }

  public get token(): string | null {
    const token = this.currentUserValue?.token || null;
    this.logger.debug('Token requested', { hasToken: !!token });
    return token;
  }

  login(credentials: LoginRequest): Observable<User> {
    this.logger.logAuthAttempt(credentials.username);

    return this.http.post<User>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(user => {
          this.logger.debug('Login response received', {
            userId: user.id,
            username: user.username,
            hasToken: !!user.token
          });
        }),
        map(user => {
          // Armazena o usuário no localStorage
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.logger.logAuthSuccess(user.username);
          return user;
        })
      );
  }

  /**
   * Registra um novo usuário
   */
  register(userData: CreateUserRequest): Observable<User> {
    this.logger.logRegistrationAttempt(userData.username);

    // Se há um arquivo de avatar, usa FormData para enviar multipart
    if (userData.avatar instanceof File) {
      const formData = new FormData();
      formData.append('username', userData.username);
      formData.append('email', userData.email);
      formData.append('password', userData.password);
      formData.append('avatar', userData.avatar);

      return this.http.post<CreateUserResponse>(`${this.USERS_API_URL}`, formData)
        .pipe(
          tap(response => {
            this.logger.debug('Registration response (with avatar)', {
              userId: response.id,
              username: response.username,
              hasToken: !!response.token
            });
          }),
          switchMap(response => {
            // Se o backend retornou um token, usa ele diretamente
            if (response.token) {
              const user: User = {
                id: response.id,
                username: response.username,
                email: response.email,
                token: response.token,
                avatar: response.avatar
              };
              localStorage.setItem('currentUser', JSON.stringify(user));
              this.currentUserSubject.next(user);
              this.logger.logRegistrationSuccess(user.username);
              return of(user);
            } else {
              // Se não retornou token, faz login manual
              this.logger.debug('No token in registration response, performing manual login');
              return this.login({ username: userData.username, password: userData.password });
            }
          })
        );
    } else {
      // Cadastro sem avatar - usa JSON conforme especificado no endpoint
      const payload = {
        username: userData.username,
        email: userData.email,
        password: userData.password
      };

      return this.http.post<CreateUserResponse>(`${this.USERS_API_URL}`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .pipe(
          tap(response => {
            this.logger.debug('Registration response (without avatar)', {
              userId: response.id,
              username: response.username,
              hasToken: !!response.token
            });
          }),
          switchMap(response => {
            // Se o backend retornou um token, usa ele diretamente
            if (response.token) {
              const user: User = {
                id: response.id,
                username: response.username,
                email: response.email,
                token: response.token,
                avatar: response.avatar
              };
              localStorage.setItem('currentUser', JSON.stringify(user));
              this.currentUserSubject.next(user);
              this.logger.logRegistrationSuccess(user.username);
              return of(user);
            } else {
              // Se não retornou token, faz login manual
              this.logger.debug('No token in registration response, performing manual login');
              return this.login({ username: userData.username, password: userData.password });
            }
          })
        );
    }
  }

  /**
   * Solicita reset de senha
   */
  resetPassword(email: string): Observable<string> {
    this.logger.debug('Password reset requested', { email });

    return this.http.post(`${this.USERS_API_URL}/reset-password?email=${encodeURIComponent(email)}`, null, {
      responseType: 'text'
    }).pipe(
      tap(response => {
        this.logger.debug('Password reset response received', { response });
      })
    );
  }

  /**
   * Valida o token de reset de senha
   */
  validateResetToken(token: string): Observable<boolean> {
    this.logger.debug('Validating reset token');

    return this.http.post<boolean>(`${this.USERS_API_URL}/change-password?token=${encodeURIComponent(token)}`, null, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).pipe(
      tap(isValid => {
        this.logger.debug('Token validation result', { isValid });
      }),
      // Handle the case where backend might return different response format
      map(response => {
        // If response is already boolean, return it
        if (typeof response === 'boolean') {
          return response;
        }
        // If response is an object with success property
        if (typeof response === 'object' && response !== null && 'success' in response) {
          return (response as any).success === true;
        }
        // Default to true if we get any successful response
        return true;
      })
    );
  }

  /**
   * Salva a nova senha usando o token de reset
   */
  saveNewPassword(token: string, passwordData: PasswordChangeRequest): Observable<PasswordChangeResponse> {
    this.logger.debug('Saving new password');

    return this.http.post<PasswordChangeResponse>(`${this.USERS_API_URL}/save-password?token=${encodeURIComponent(token)}`, passwordData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).pipe(
      tap(response => {
        this.logger.debug('Password change response', { response });
      })
    );
  }

  logout(): void {
    this.logger.debug('Logout initiated');
    // Remove o usuário do localStorage
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.logger.logLogout();
  }

  // Método para verificar se o token ainda é válido
  // Será útil quando implementarmos JWT
  isTokenValid(): boolean {
    const user = this.currentUserValue;
    const isValid = !!(user && user.token);

    this.logger.logTokenValidation(isValid);

    if (!isValid) {
      this.logger.debug('Token validation failed', { reason: 'No user or token found' });
      return false;
    }

    // Por enquanto, assume que o token é sempre válido
    // Futuramente aqui verificaremos a expiração do JWT
    this.logger.debug('Token validation passed');
    return true;
  }

  // Método para renovar o token
  // Será implementado quando tivermos JWT
  refreshToken(): Observable<User> {
    this.logger.warn('Refresh token called but not implemented');
    throw new Error('Refresh token not implemented yet');
  }
}
