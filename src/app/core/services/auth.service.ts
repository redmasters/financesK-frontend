import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/v1/auth';
  private readonly USERS_API_URL = 'http://localhost:8080/api/v1/users';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {
    // Recupera o usuário do localStorage se existir
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  public get token(): string | null {
    return this.currentUserValue?.token || null;
  }

  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/login`, credentials)
      .pipe(
        map(user => {
          // Armazena o usuário no localStorage
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        })
      );
  }

  /**
   * Registra um novo usuário
   */
  register(userData: CreateUserRequest): Observable<CreateUserResponse> {
    // Se há um arquivo de avatar, usa FormData para enviar multipart
    if (userData.avatar instanceof File) {
      const formData = new FormData();
      formData.append('username', userData.username);
      formData.append('email', userData.email);
      formData.append('password', userData.password);
      formData.append('avatar', userData.avatar);

      return this.http.post<CreateUserResponse>(`${this.USERS_API_URL}`, formData)
        .pipe(
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
              return of(response);
            } else {
              // Se não retornou token, faz login manual
              console.log('Token não retornado no registro, fazendo login manual...');
              return this.login({ username: userData.username, password: userData.password })
                .pipe(
                  map(() => response)
                );
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
              return of(response);
            } else {
              // Se não retornou token, faz login manual
              console.log('Token não retornado no registro, fazendo login manual...');
              return this.login({ username: userData.username, password: userData.password })
                .pipe(
                  map(() => response)
                );
            }
          })
        );
    }
  }

  logout(): void {
    // Remove o usuário do localStorage
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // Método para verificar se o token ainda é válido
  // Será útil quando implementarmos JWT
  isTokenValid(): boolean {
    const user = this.currentUserValue;
    if (!user || !user.token) {
      return false;
    }

    // Por enquanto, assume que o token é sempre válido
    // Futuramente aqui verificaremos a expiração do JWT
    return true;
  }

  // Método para renovar o token
  // Será implementado quando tivermos JWT
  refreshToken(): Observable<User> {
    // Placeholder para implementação futura
    throw new Error('Refresh token not implemented yet');
  }
}
