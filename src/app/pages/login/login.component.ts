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

  // Password reset properties
  showPasswordReset = false;
  resetEmail = '';
  isResettingPassword = false;
  resetMessage = '';
  resetError = '';

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

    // Convert username to lowercase before submitting
    this.credentials.username = this.credentials.username.toLowerCase();

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

  // Method to convert username to lowercase as user types
  onUsernameInput(): void {
    this.credentials.username = this.credentials.username.toLowerCase();
    this.clearError();
  }

  clearError(): void {
    this.error = '';
  }

  // Password reset methods
  showResetPasswordForm(): void {
    this.showPasswordReset = true;
    this.clearError();
  }

  hideResetPasswordForm(): void {
    this.showPasswordReset = false;
    this.resetEmail = '';
    this.resetMessage = '';
    this.resetError = '';
  }

  onResetPassword(): void {
    if (!this.resetEmail || !this.isValidEmail(this.resetEmail)) {
      this.resetError = 'Por favor, digite um email válido';
      return;
    }

    this.isResettingPassword = true;
    this.resetError = '';
    this.resetMessage = '';

    this.authService.resetPassword(this.resetEmail).subscribe({
      next: (response) => {
        console.log('Password reset response:', response);
        this.resetMessage = 'Se o email estiver cadastrado, um link de redefinição de senha será enviado.';
        this.resetError = '';
      },
      error: (error) => {
        console.error('Password reset error:', error);
        if (error.error && typeof error.error === 'object' && error.error.error) {
          this.resetError = error.error.error;
        } else if (error.error && typeof error.error === 'string') {
          this.resetError = error.error;
        } else {
          this.resetError = 'Erro ao solicitar redefinição de senha. Tente novamente.';
        }
        this.resetMessage = '';
      },
      complete: () => {
        this.isResettingPassword = false;
      }
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  clearResetError(): void {
    this.resetError = '';
  }
}
