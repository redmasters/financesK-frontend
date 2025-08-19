import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrivacyService {
  private showValues = true;

  constructor() {
    this.initializePrivacySettings();
  }

  /**
   * Inicializa as configurações de privacidade
   */
  private initializePrivacySettings(): void {
    // Recupera a preferência salva do localStorage
    const savedPreference = localStorage.getItem('financesK-showValues');
    if (savedPreference !== null) {
      this.showValues = savedPreference === 'true';
    }

    // Escuta mudanças na visibilidade dos valores
    window.addEventListener('valuesVisibilityChanged', (event: any) => {
      this.showValues = event.detail.showValues;
    });
  }

  /**
   * Retorna o estado atual da privacidade
   */
  getShowValues(): boolean {
    return this.showValues;
  }

  /**
   * Alterna a visibilidade dos valores financeiros
   */
  toggleValueVisibility(): void {
    this.showValues = !this.showValues;

    // Salva a preferência no localStorage para persistir entre sessões
    localStorage.setItem('financesK-showValues', this.showValues.toString());

    // Dispara evento customizado para notificar outros componentes
    window.dispatchEvent(new CustomEvent('valuesVisibilityChanged', {
      detail: { showValues: this.showValues }
    }));
  }

  /**
   * Formata valor para exibição com privacidade
   * @param value - Valor monetário formatado (ex: "R$ 1.234,56")
   * @returns Valor original ou asteriscos se privacidade estiver ativa
   */
  formatValueWithPrivacy(value: string): string {
    if (!this.showValues) {
      // Conta o número de caracteres para manter o layout
      const length = value.replace(/[^\d]/g, '').length;
      const asterisks = '*'.repeat(Math.max(3, Math.min(8, length)));
      return `R$ ${asterisks}`;
    }
    return value;
  }

  /**
   * Método alias para ser usado nos templates
   * @param value - Valor monetário formatado
   * @returns Valor formatado com ou sem privacidade
   */
  getDisplayValue(value: string): string {
    return this.formatValueWithPrivacy(value);
  }
}
