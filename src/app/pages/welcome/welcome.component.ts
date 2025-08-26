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
          <button class="btn btn-primary btn-start" (click)="startJourney()">
            <i class="fas fa-play"></i>
            Começar Configuração
          </button>
          <button class="btn btn-secondary btn-skip" (click)="skipOnboarding()">
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
    /* Importando mixins centralizados */
    @use '../../shared/styles/mixins' as *;

    /* Estilos específicos do componente welcome usando sistema centralizado */
    .welcome-container {
      min-height: 100vh;
      @include flex-center;
      @include gradient-background;
      padding: var(--spacing-xl);
    }

    .welcome-card {
      @include card-base;
      width: 100%;
      max-width: 700px;
      box-shadow: var(--shadow-xl);
      text-align: center;
      animation: slideUpFade 0.6s ease-out;
    }

    @keyframes slideUpFade {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .welcome-header {
      text-align: center;
      margin-bottom: var(--spacing-2xl);

      .welcome-icon {
        width: 80px;
        height: 80px;
        @include flex-center;
        background: var(--primary);
        border-radius: 50%;
        margin: 0 auto var(--spacing-lg);

        i {
          font-size: 2rem;
          color: white;
        }
      }

      h1 {
        color: var(--dark);
        margin-bottom: var(--spacing-sm);
        font-size: var(--font-size-3xl);
        font-weight: var(--font-weight-bold);
      }

      .welcome-subtitle {
        color: var(--gray);
        font-size: var(--font-size-lg);
        line-height: 1.6;
      }
    }

    .onboarding-steps {
      margin: var(--spacing-2xl) 0;

      .steps-container {
        display: flex;
        justify-content: center;
        gap: var(--spacing-lg);
        margin-bottom: var(--spacing-xl);
      }

      .step-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        max-width: 150px;

        &.current .step-number {
          background: var(--primary);
          color: white;
          animation: pulse 2s infinite;
        }

        &.completed .step-number {
          background: var(--success);
          color: white;
        }

        .step-number {
          width: 40px;
          height: 40px;
          @include flex-center;
          background: var(--gray-light);
          color: var(--gray);
          border-radius: 50%;
          font-weight: var(--font-weight-bold);
          margin-bottom: var(--spacing-sm);
          transition: all var(--transition-normal);
        }

        .step-title {
          font-weight: var(--font-weight-semibold);
          color: var(--dark);
          margin-bottom: var(--spacing-xs);
        }

        .step-description {
          font-size: var(--font-size-sm);
          color: var(--gray);
          line-height: 1.4;
        }
      }
    }

    .welcome-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: center;
      margin-top: var(--spacing-xl);

      .btn {
        padding: var(--spacing-md) var(--spacing-xl);
        border-radius: var(--border-radius-md);
        font-weight: var(--font-weight-semibold);
        cursor: pointer;
        transition: all var(--transition-normal);
        border: none;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-sm);
      }

      .btn-primary {
        @include button-gradient;
      }

      .btn-secondary {
        background: transparent;
        color: var(--gray);
        border: 2px solid var(--border);

        &:hover {
          border-color: var(--gray);
          color: var(--dark);
        }
      }
    }

    .welcome-benefits {
      margin-top: var(--spacing-2xl);
      padding-top: var(--spacing-xl);
      border-top: 1px solid var(--border);

      h3 {
        text-align: center;
        color: var(--dark);
        margin-bottom: var(--spacing-xl);
        font-size: var(--font-size-xl);
      }

      .benefits-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-lg);

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }
      }

      .benefit-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);

        i {
          width: 40px;
          height: 40px;
          @include flex-center;
          background: var(--primary-light);
          color: var(--primary);
          border-radius: var(--border-radius-md);
          font-size: 1.2rem;
        }

        span {
          color: var(--gray);
          font-weight: var(--font-weight-medium);
        }
      }
    }

    @media (max-width: 768px) {
      .welcome-container {
        padding: var(--spacing-lg);
      }

      .welcome-card {
        padding: var(--spacing-xl);
      }

      .onboarding-steps .steps-container {
        flex-direction: column;
        gap: var(--spacing-md);
      }

      .welcome-actions {
        flex-direction: column;

        .btn {
          justify-content: center;
        }
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
