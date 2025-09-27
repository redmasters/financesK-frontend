import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

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
    console.log('AuthService inicializado. Usuário armazenado:', storedUser);

    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();

    // Log do estado inicial
    const currentUser = this.currentUserValue;
    console.log('Estado inicial da autenticação:', {
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
    console.log('Verificação de autenticação:', {
      hasUser: !!user,
      hasToken: !!user?.token,
      isAuthenticated: hasValidUser
    });
    return hasValidUser;
  }

  public get token(): string | null {
    const token = this.currentUserValue?.token || null;
    console.log('Token solicitado:', token ? `${token.substring(0, 20)}...` : 'null');
    return token;
  }

  login(credentials: LoginRequest): Observable<User> {
    console.log('Tentativa de login para:', credentials.username);

    return this.http.post<User>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(user => console.log('Resposta do login:', { ...user, token: user.token ? `${user.token.substring(0, 20)}...` : 'null' })),
        map(user => {
          // Armazena o usuário no localStorage
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          console.log('Usuário autenticado e armazenado com sucesso');
          return user;
        })
      );
  }

  /**
   * Registra um novo usuário
   */
  register(userData: CreateUserRequest): Observable<User> {
    console.log('Tentativa de registro para:', userData.username);

    // Se há um arquivo de avatar, usa FormData para enviar multipart
    if (userData.avatar instanceof File) {
      const formData = new FormData();
      formData.append('username', userData.username);
      formData.append('email', userData.email);
      formData.append('password', userData.password);
      formData.append('avatar', userData.avatar);

      return this.http.post<CreateUserResponse>(`${this.USERS_API_URL}`, formData)
        .pipe(
          tap(response => console.log('Resposta do registro (com avatar):', { ...response, token: response.token ? `${response.token.substring(0, 20)}...` : 'null' })),
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
              console.log('Usuário autenticado automaticamente após registro:', user.username);
              return of(user);
            } else {
              // Se não retornou token, faz login manual
              console.log('Token não retornado no registro, fazendo login manual...');
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
          tap(response => console.log('Resposta do registro (sem avatar):', { ...response, token: response.token ? `${response.token.substring(0, 20)}...` : 'null' })),
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
              console.log('Usuário autenticado automaticamente após registro:', user.username);
              return of(user);
            } else {
              // Se não retornou token, faz login manual
              console.log('Token não retornado no registro, fazendo login manual...');
              return this.login({ username: userData.username, password: userData.password });
            }
          })
        );
    }
  }

  logout(): void {
    console.log('Fazendo logout...');
    // Remove o usuário do localStorage
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    console.log('Logout realizado com sucesso');
  }

  // Método para verificar se o token ainda é válido
  // Será útil quando implementarmos JWT
  isTokenValid(): boolean {
    const user = this.currentUserValue;
    if (!user || !user.token) {
      console.log('Token inválido: usuário ou token não encontrado');
      return false;
    }

    // Por enquanto, assume que o token é sempre válido
    // Futuramente aqui verificaremos a expiração do JWT
    console.log('Token considerado válido');
    return true;
  }

  // Método para renovar o token
  // Será implementado quando tivermos JWT
  refreshToken(): Observable<User> {
    // Placeholder para implementação futura
    throw new Error('Refresh token not implemented yet');
  }
}
