import { Component, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { PrivacyService } from './core/services/privacy.service';
import { AuthService } from './core/services/auth.service';
import { OnboardingService } from './core/services/onboarding.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, NotificationComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'financesK-front';

  // Estado do card do usuário
  showUserCard = false;

  // Estado do menu móvel
  mobileMenuOpen = false;
  isMobile = false;

  constructor(
    private privacyService: PrivacyService,
    private authService: AuthService,
    private router: Router,
    private onboardingService: OnboardingService
  ) {
    this.checkScreenSize();
  }

  /**
   * Listener para detectar mudanças no tamanho da tela
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  /**
   * Verifica o tamanho da tela e define se é mobile
   */
  private checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;

    // Fecha o menu móvel se a tela ficar grande
    if (!this.isMobile && this.mobileMenuOpen) {
      this.mobileMenuOpen = false;
    }
  }

  /**
   * Alterna o menu móvel
   */
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;

    // Fecha o card do usuário quando abre/fecha o menu
    if (this.showUserCard) {
      this.showUserCard = false;
    }
  }

  /**
   * Fecha o menu móvel (usado quando clica em um link)
   */
  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  /**
   * Fecha o menu móvel quando clica fora dele
   */
  onOverlayClick(): void {
    this.mobileMenuOpen = false;
  }

  /**
   * Getter para verificar se o usuário está autenticado
   */
  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }

  /**
   * Getter para acessar o usuário atual
   */
  get currentUser() {
    return this.authService.currentUserValue;
  }

  /**
   * Getter para acessar o estado de privacidade
   */
  get showValues(): boolean {
    return this.privacyService.getShowValues();
  }

  /**
   * Verifica se deve mostrar a sidebar
   * A sidebar não deve aparecer durante o onboarding ou nas páginas de autenticação
   */
  get shouldShowSidebar(): boolean {
    // Se não estiver autenticado, não mostra a sidebar
    if (!this.isAuthenticated) {
      return false;
    }

    // Lista de rotas onde a sidebar não deve aparecer
    const noSidebarRoutes = ['/login', '/register', '/welcome'];
    const currentRoute = this.router.url.split('?')[0]; // Remove query params

    // Se está em uma rota sem sidebar, não mostra
    if (noSidebarRoutes.includes(currentRoute)) {
      return false;
    }

    // Se o onboarding está ativo, não mostra a sidebar
    if (this.onboardingService.isOnboardingActive()) {
      return false;
    }
    // Em todos os outros casos, mostra a sidebar
    return true;
  }

  /**
   * Alterna a visibilidade do card do usuário
   */
  toggleUserCard(): void {
    this.showUserCard = !this.showUserCard;
  }

  /**
   * Alterna a visibilidade dos valores financeiros
   */
  toggleValueVisibility(): void {
    this.privacyService.toggleValueVisibility();
  }

  /**
   * Realiza logout do usuário
   */
  logout(): void {
    if (confirm('Tem certeza que deseja sair?')) {
      this.authService.logout();
      this.showUserCard = false;
      this.mobileMenuOpen = false;
      this.router.navigate(['/login']); // Redireciona para a página inicial ou de login após o logout
    }
  }

  /**
   * Fecha o card do usuário quando clica fora dele
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const userSection = target.closest('.user-section');

    // Se clicou fora da seção do usuário e o card está aberto, fecha o card
    if (!userSection && this.showUserCard) {
      this.showUserCard = false;
    }
  }
}
