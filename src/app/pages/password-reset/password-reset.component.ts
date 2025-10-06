import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, PasswordChangeRequest } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {
  token: string = '';
  isValidToken = false;
  isCheckingToken = true;
  passwordData: PasswordChangeRequest = {
    newPassword: '',
    confirmPassword: ''
  };

  isLoading = false;
  error = '';
  successMessage = '';

  // Password validation flags
  passwordMismatch = false;
  passwordTooWeak = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get token from query parameters
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (this.token) {
        this.validateToken();
      } else {
        this.isCheckingToken = false;
        this.error = 'Token de redefinição de senha não fornecido';
      }
    });
  }

  private validateToken(): void {
    this.isCheckingToken = true;
    this.error = '';

    this.authService.validateResetToken(this.token).subscribe({
      next: (isValid) => {
        this.isValidToken = isValid;
        this.isCheckingToken = false;

        if (!isValid) {
          this.error = 'Token inválido ou expirado';
        }
      },
      error: (error) => {
        // Log only safe error properties in development
        if (!environment.production) {
          console.error('Token validation error - Status:', error.status, 'Message:', error.message);
        }
        this.isCheckingToken = false;
        this.isValidToken = false;

        // Better error handling based on HTTP status
        if (error.status === 400) {
          this.error = 'Token inválido';
        } else if (error.status === 401) {
          this.error = 'Token expirado';
        } else if (error.status === 404) {
          this.error = 'Token não encontrado';
        } else {
          this.error = 'Erro ao validar token. Tente novamente.';
        }
      }
    });
  }

  onSubmit(): void {
    if (!this.validatePasswords()) {
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.successMessage = '';

    this.authService.saveNewPassword(this.token, this.passwordData).subscribe({
      next: (response) => {
        this.successMessage = 'Senha alterada com sucesso! Você será redirecionado para o login.';

        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        // Log only safe error properties in development
        if (!environment.production) {
          console.error('Password change error - Status:', error.status, 'Message:', error.message);
        }

        if (error.error && typeof error.error === 'object' && error.error.error) {
          this.error = error.error.error;
        } else if (error.error && typeof error.error === 'string') {
          this.error = error.error;
        } else {
          this.error = 'Erro ao alterar a senha. Tente novamente.';
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private validatePasswords(): boolean {
    this.error = '';
    this.passwordMismatch = false;
    this.passwordTooWeak = false;

    // Check if passwords are filled
    if (!this.passwordData.newPassword || !this.passwordData.confirmPassword) {
      this.error = 'Por favor, preencha todos os campos';
      return false;
    }

    // Check password strength (minimum 6 characters)
    if (this.passwordData.newPassword.length < 6) {
      this.passwordTooWeak = true;
      this.error = 'A senha deve ter pelo menos 6 caracteres';
      return false;
    }

    // Check if passwords match
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.passwordMismatch = true;
      this.error = 'As senhas não coincidem';
      return false;
    }

    return true;
  }

  clearError(): void {
    this.error = '';
    this.passwordMismatch = false;
    this.passwordTooWeak = false;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
