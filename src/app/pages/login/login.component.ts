import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, LoginRequest } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  credentials: LoginRequest = {
    password: ''
  };

  // Single input field for username or email
  usernameOrEmail = '';

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
    if (!this.usernameOrEmail || !this.credentials.password) {
      this.error = 'Por favor, preencha todos os campos';
      return;
    }

    // Determine if input is email or username and prepare credentials
    this.prepareCredentials();

    this.isLoading = true;
    this.error = '';

    this.authService.login(this.credentials).subscribe({
      next: (user) => {
        // Only log non-sensitive success info in development
        if (!environment.production) {
          console.log('Login successful for user ID:', user?.id);
        }
        this.router.navigate(['/home']);
      },
      error: (error) => {
        // Log only safe error properties in development
        if (!environment.production) {
          console.error('Login error - Status:', error.status, 'Message:', error.message);
        }
        this.error = 'Usuário/email ou senha inválidos';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private prepareCredentials(): void {
    // Reset credentials
    this.credentials.username = undefined;
    this.credentials.email = undefined;

    // Check if input is email format
    if (this.isValidEmail(this.usernameOrEmail)) {
      this.credentials.email = this.usernameOrEmail.toLowerCase();
    } else {
      this.credentials.username = this.usernameOrEmail.toLowerCase();
    }
  }

  private isValidEmail(input: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  }

  // Method to handle input changes
  onUsernameOrEmailInput(): void {
    // Just clear error, don't modify the input as user types
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
        this.resetMessage = 'Se o email estiver cadastrado, um link de redefinição de senha será enviado.';
        this.resetError = '';
      },
      error: (error) => {
        // Log only safe error properties in development
        if (!environment.production) {
          console.error('Password reset error - Status:', error.status, 'Message:', error.message);
        }

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

  clearResetError(): void {
    this.resetError = '';
  }
}
