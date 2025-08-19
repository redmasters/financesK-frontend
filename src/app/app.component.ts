import { Component, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { PrivacyService } from './core/services/privacy.service';

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

  // Dados do usuário atual (mock - depois pode vir de um serviço de autenticação)
  currentUser = {
    name: 'João Silva',
    email: 'joao.silva@example.com',
    avatar: '' // Por enquanto usando ícone padrão
  };

  constructor(private privacyService: PrivacyService) {}

  /**
   * Getter para acessar o estado de privacidade
   */
  get showValues(): boolean {
    return this.privacyService.getShowValues();
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
    // Por enquanto apenas um console.log - depois implementar lógica real de logout
    console.log('Logout realizado');
    this.showUserCard = false;
    // Aqui seria implementado:
    // - Limpar dados de autenticação
    // - Redirecionar para tela de login
    // - Limpar storage/cookies
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
