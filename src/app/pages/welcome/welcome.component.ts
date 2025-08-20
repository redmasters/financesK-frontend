import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OnboardingService, OnboardingState } from '../../core/services/onboarding.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="welcome-container">
      <div class="welcome-card">
        <div class="welcome-header">
          <div class="welcome-icon">
            <i class="fas fa-rocket"></i>
          </div>
          <h1>Bem-vindo ao FinancesK!</h1>
          <p class="welcome-subtitle">Olá {{ currentUser?.username }}, vamos configurar sua conta em alguns passos simples</p>
        </div>

        <div class="onboarding-steps">
          <div class="steps-container">
            <div
              *ngFor="let step of onboardingState?.steps; let i = index"
              class="step-item"
              [class.current]="i === onboardingState?.currentStep"
              [class.completed]="step.completed"
            >
              <div class="step-number">
                <span *ngIf="!step.completed">{{ i + 1 }}</span>
                <i *ngIf="step.completed" class="fas fa-check"></i>
              </div>
              <div class="step-content">
                <h3>{{ step.title }}</h3>
                <p>{{ step.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="welcome-actions">
          <button class="btn-start" (click)="startJourney()">
            <i class="fas fa-play"></i>
            Começar Configuração
          </button>
          <button class="btn-skip" (click)="skipOnboarding()">
            Pular e ir direto ao painel
          </button>
        </div>

        <div class="welcome-benefits">
          <h3>O que você pode fazer no FinancesK:</h3>
          <div class="benefits-grid">
            <div class="benefit-item">
              <i class="fas fa-chart-line"></i>
              <span>Acompanhar receitas e despesas</span>
            </div>
            <div class="benefit-item">
              <i class="fas fa-university"></i>
              <span>Gerenciar múltiplas contas</span>
            </div>
            <div class="benefit-item">
              <i class="fas fa-tags"></i>
              <span>Organizar por categorias</span>
            </div>
            <div class="benefit-item">
              <i class="fas fa-chart-pie"></i>
              <span>Visualizar relatórios</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .welcome-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .welcome-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
      padding: 40px;
      width: 100%;
      max-width: 700px;
      animation: slideUp 0.8s ease-out;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .welcome-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .welcome-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;

      i {
        color: white;
        font-size: 2rem;
      }
    }

    .welcome-header h1 {
      color: #2c3e50;
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 10px 0;
    }

    .welcome-subtitle {
      color: #7f8c8d;
      font-size: 1.1rem;
      margin: 0;
    }

    .onboarding-steps {
      margin-bottom: 40px;
    }

    .steps-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .step-item {
      display: flex;
      align-items: center;
      padding: 20px;
      border-radius: 12px;
      border: 2px solid #e9ecef;
      transition: all 0.3s ease;

      &.current {
        border-color: #667eea;
        background: #f8f9ff;
      }

      &.completed {
        border-color: #28a745;
        background: #f8fff9;
      }
    }

    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e9ecef;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20px;
      font-weight: 600;
      color: #6c757d;
      flex-shrink: 0;

      .current & {
        background: #667eea;
        color: white;
      }

      .completed & {
        background: #28a745;
        color: white;
      }
    }

    .step-content {
      h3 {
        margin: 0 0 5px 0;
        color: #2c3e50;
        font-size: 1.1rem;
      }

      p {
        margin: 0;
        color: #6c757d;
        font-size: 0.95rem;
      }
    }

    .welcome-actions {
      display: flex;
      gap: 15px;
      margin-bottom: 40px;
      justify-content: center;
    }

    .btn-start {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 10px;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
      }
    }

    .btn-skip {
      background: transparent;
      color: #6c757d;
      border: 2px solid #e9ecef;
      padding: 16px 32px;
      border-radius: 12px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        border-color: #6c757d;
        color: #495057;
      }
    }

    .welcome-benefits {
      border-top: 1px solid #e9ecef;
      padding-top: 30px;

      h3 {
        text-align: center;
        color: #2c3e50;
        margin-bottom: 20px;
      }
    }

    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .benefit-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;

      i {
        color: #667eea;
        font-size: 1.2rem;
      }

      span {
        color: #495057;
        font-size: 0.9rem;
      }
    }

    @media (max-width: 768px) {
      .welcome-card {
        padding: 30px 20px;
      }

      .welcome-actions {
        flex-direction: column;
      }

      .benefits-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class WelcomeComponent implements OnInit {
  onboardingState: OnboardingState | null = null;
  currentUser: any = null;

  constructor(
    private router: Router,
    private onboardingService: OnboardingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Se não estiver autenticado, redireciona para login
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }

    // Define o usuário atual após a inicialização
    this.currentUser = this.authService.currentUserValue;

    // Inicia automaticamente o onboarding se for um novo usuário
    if (!this.onboardingService.isOnboardingActive()) {
      this.onboardingService.startOnboarding();
    }

    // Escuta mudanças no estado do onboarding
    this.onboardingService.onboardingState$.subscribe(state => {
      this.onboardingState = state;
      console.log('Estado do onboarding na Welcome:', state);
    });
  }

  startJourney(): void {
    // Vai para o próximo passo (criar conta bancária)
    this.onboardingService.nextStep();

    console.log('Navegando para accounts com onboarding ativo');

    this.router.navigate(['/accounts'], {
      queryParams: { onboarding: 'true', step: 'create-account' }
    }).then(success => {
      console.log('Navegação concluída:', success);
    }).catch(error => {
      console.error('Erro na navegação:', error);
    });
  }

  skipOnboarding(): void {
    this.onboardingService.skipOnboarding();
    this.router.navigate(['/home']);
  }
}
