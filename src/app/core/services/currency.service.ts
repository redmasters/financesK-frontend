import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  /**
   * Converte valor em reais para centavos
   * Exemplo: 30.50 -> 3050
   */
  toCents(value: number): number {
    return Math.round(value * 100);
  }

  /**
   * Converte valor em centavos para reais
   * Exemplo: 3050 -> 30.50
   */
  fromCents(cents: number): number {
    return cents / 100;
  }

  /**
   * Formata valor para exibição em reais brasileiros
   * Exemplo: 30.50 -> "R$ 30,50"
   */
  formatBRL(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  /**
   * Formata valor para exibição simples sem símbolo
   * Exemplo: 30.50 -> "30,50"
   */
  formatSimple(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  /**
   * Remove formatação e converte string para número
   * Exemplo: "30,50" -> 30.50, "R$ 30,50" -> 30.50
   */
  parseFromString(value: string): number {
    if (!value) return 0;

    // Remove caracteres não numéricos exceto vírgula e ponto
    const cleaned = value.replace(/[^\d,.-]/g, '');

    // Substitui vírgula por ponto para conversão
    const normalized = cleaned.replace(',', '.');

    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Formata valor enquanto o usuário digita
   * Mantém o cursor na posição correta
   */
  formatInput(value: string): string {
    if (!value) return '';

    // Remove tudo exceto números
    const numbers = value.replace(/\D/g, '');

    if (numbers.length === 0) return '';

    // Converte para número e divide por 100 para ter centavos
    const amount = parseInt(numbers) / 100;

    // Formata com 2 casas decimais
    return this.formatSimple(amount);
  }

  /**
   * Obtém valor numérico de uma string formatada para enviar ao backend
   */
  getValueForBackend(formattedValue: string): number {
    const numericValue = this.parseFromString(formattedValue);
    return this.toCents(numericValue);
  }

  /**
   * Prepara valor do backend para exibição no formulário
   */
  getValueForForm(backendValue: number): string {
    const reaisValue = this.fromCents(backendValue);
    return this.formatSimple(reaisValue);
  }
}
