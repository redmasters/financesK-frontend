import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  route: string;
}

export interface OnboardingState {
  isActive: boolean;
  currentStep: number;
  steps: OnboardingStep[];
}

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private readonly ONBOARDING_KEY = 'financesK-onboarding';

  private onboardingStateSubject = new BehaviorSubject<OnboardingState>({
    isActive: false,
    currentStep: 0,
    steps: [
      {
        id: 'welcome',
        title: 'Bem-vindo ao FinancesK!',
        description: 'Vamos configurar sua conta em alguns passos simples',
        completed: false,
        route: '/onboarding/welcome'
      },
      {
        id: 'create-account',
        title: 'Criar Conta Bancária',
        description: 'Configure sua primeira conta bancária para começar a organizar suas finanças',
        completed: false,
        route: '/accounts'
      },
      {
        id: 'first-transaction',
        title: 'Explore as Transações',
        description: 'Conheça o painel principal onde você gerenciará suas receitas e despesas',
        completed: false,
        route: '/home'
      }
    ]
  });

  public onboardingState$ = this.onboardingStateSubject.asObservable();

  constructor() {
    this.loadOnboardingState();
  }

  /**
   * Inicia o processo de onboarding para um novo usuário
   */
  startOnboarding(): void {
    const state: OnboardingState = {
      isActive: true,
      currentStep: 0,
      steps: this.onboardingStateSubject.value.steps.map(step => ({ ...step, completed: false }))
    };

    this.updateOnboardingState(state);
  }

  /**
   * Avança para o próximo passo do onboarding
   */
  nextStep(): void {
    const currentState = this.onboardingStateSubject.value;
    if (!currentState.isActive) return;

    const nextStepIndex = currentState.currentStep + 1;

    // Marca o passo atual como completo
    const updatedSteps = [...currentState.steps];
    if (updatedSteps[currentState.currentStep]) {
      updatedSteps[currentState.currentStep].completed = true;
    }

    const newState: OnboardingState = {
      ...currentState,
      currentStep: nextStepIndex,
      steps: updatedSteps,
      isActive: nextStepIndex < currentState.steps.length
    };

    this.updateOnboardingState(newState);
  }

  /**
   * Marca um passo específico como completo
   */
  completeStep(stepId: string): void {
    const currentState = this.onboardingStateSubject.value;
    if (!currentState.isActive) return;

    const updatedSteps = currentState.steps.map(step =>
      step.id === stepId ? { ...step, completed: true } : step
    );

    this.updateOnboardingState({
      ...currentState,
      steps: updatedSteps
    });
  }

  /**
   * Finaliza o onboarding
   */
  completeOnboarding(): void {
    const currentState = this.onboardingStateSubject.value;
    const completedSteps = currentState.steps.map(step => ({ ...step, completed: true }));

    const finalState: OnboardingState = {
      isActive: false,
      currentStep: currentState.steps.length,
      steps: completedSteps
    };

    this.updateOnboardingState(finalState);
  }

  /**
   * Pula o onboarding
   */
  skipOnboarding(): void {
    this.completeOnboarding();
  }

  /**
   * Verifica se o onboarding está ativo
   */
  isOnboardingActive(): boolean {
    return this.onboardingStateSubject.value.isActive;
  }

  /**
   * Obtém o passo atual do onboarding
   */
  getCurrentStep(): OnboardingStep | null {
    const state = this.onboardingStateSubject.value;
    return state.steps[state.currentStep] || null;
  }

  /**
   * Verifica se é um novo usuário (nunca completou o onboarding)
   */
  isNewUser(): boolean {
    const savedState = localStorage.getItem(this.ONBOARDING_KEY);
    return !savedState;
  }

  private loadOnboardingState(): void {
    const savedState = localStorage.getItem(this.ONBOARDING_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        this.onboardingStateSubject.next(parsedState);
      } catch (error) {
        console.error('Erro ao carregar estado do onboarding:', error);
      }
    }
  }

  private updateOnboardingState(state: OnboardingState): void {
    this.onboardingStateSubject.next(state);
    localStorage.setItem(this.ONBOARDING_KEY, JSON.stringify(state));
  }
}
