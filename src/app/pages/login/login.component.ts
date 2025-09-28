import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, LoginRequest } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  credentials: LoginRequest = {
    username: '',
    password: ''
  };

  isLoading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Redireciona se já estiver logado
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/home']);
    }
  }

  onSubmit(): void {
    if (!this.credentials.username || !this.credentials.password) {
      this.error = 'Por favor, preencha todos os campos';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.authService.login(this.credentials).subscribe({
      next: (user) => {
        console.log('Login realizado com sucesso:', user);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Erro no login:', error);
        this.error = 'Usuário ou senha inválidos';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  clearError(): void {
    this.error = '';
  }
}
