import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, CreateUserRequest } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { OnboardingService } from '../../core/services/onboarding.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerData: CreateUserRequest = {
    username: '',
    email: '',
    password: ''
  };

  confirmPassword = '';
  isLoading = false;
  error = '';

  // Avatar upload
  selectedAvatar: File | null = null;
  avatarPreview: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private onboardingService: OnboardingService
  ) {
    // Redireciona se já estiver logado
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/home']);
    }
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.error = '';

    // Adiciona o avatar se foi selecionado
    if (this.selectedAvatar) {
      this.registerData.avatar = this.selectedAvatar;
    }

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        console.log('Cadastro realizado com sucesso:', response);

        // Aguarda um momento para garantir que o estado de autenticação seja atualizado
        setTimeout(() => {
          // Verifica se o usuário foi autenticado corretamente
          if (this.authService.isAuthenticated) {
            console.log('Usuário autenticado com sucesso após registro');
            this.notificationService.success('Conta criada com sucesso! Bem-vindo ao FinancesK!');

            // Inicia a jornada de onboarding para novo usuário
            this.onboardingService.startOnboarding();

            // Aguarda mais um momento para garantir que o onboarding foi iniciado
            setTimeout(() => {
              console.log('Redirecionando para welcome...');
              // Redireciona para a página de boas-vindas
              this.router.navigate(['/welcome']);
            }, 200);
          } else {
            // Se não conseguiu autenticar automaticamente, mostra erro e redireciona para login
            console.warn('Cadastro realizado mas autenticação falhou');
            this.notificationService.success('Conta criada com sucesso! Faça login para continuar.');
            this.router.navigate(['/login']);
          }
        }, 300);
      },
      error: (error) => {
        console.error('Erro no cadastro:', error);
        this.error = this.getErrorMessage(error);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private validateForm(): boolean {
    // Validação de campos obrigatórios
    if (!this.registerData.username || !this.registerData.email || !this.registerData.password) {
      this.error = 'Por favor, preencha todos os campos obrigatórios';
      return false;
    }

    // Validação de username
    if (this.registerData.username.length < 3) {
      this.error = 'O nome de usuário deve ter pelo menos 3 caracteres';
      return false;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email)) {
      this.error = 'Por favor, insira um email válido';
      return false;
    }

    // Validação de senha
    if (this.registerData.password.length < 6) {
      this.error = 'A senha deve ter pelo menos 6 caracteres';
      return false;
    }

    // Validação de confirmação de senha
    if (this.registerData.password !== this.confirmPassword) {
      this.error = 'As senhas não coincidem';
      return false;
    }

    return true;
  }

  private getErrorMessage(error: any): string {
    if (error.status === 409) {
      return 'Este email ou nome de usuário já está em uso';
    }
    if (error.status === 400) {
      return 'Dados inválidos. Verifique as informações inseridas';
    }
    return 'Erro ao criar conta. Tente novamente';
  }

  clearError(): void {
    this.error = '';
  }

  // Métodos para upload de avatar
  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validação do arquivo
      if (!this.validateAvatarFile(file)) {
        return;
      }

      this.selectedAvatar = file;

      // Cria preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  private validateAvatarFile(file: File): boolean {
    // Verifica tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      this.error = 'Apenas arquivos de imagem (JPEG, PNG, GIF) são permitidos';
      return false;
    }

    // Verifica tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.error = 'O arquivo deve ter no máximo 5MB';
      return false;
    }

    return true;
  }

  removeAvatar(): void {
    this.selectedAvatar = null;
    this.avatarPreview = null;

    // Limpa o input file
    const input = document.getElementById('avatar-input') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }

  triggerAvatarUpload(): void {
    const input = document.getElementById('avatar-input') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }
}
