import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  /**
   * Formata um valor em centavos para a moeda brasileira
   * @param valueInCents Valor em centavos (ex: 3500 = R$ 35,00)
   * @returns String formatada (ex: "R$ 35,00")
   */
  formatCurrency(valueInCents: number): string {
    const valueInReais = valueInCents / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valueInReais);
  }

  /**
   * Formata um valor que já vem em reais do backend
   * @param valueInReais Valor já em reais (ex: 1086.35)
   * @returns String formatada (ex: "R$ 1.086,35")
   */
  formatBRL(valueInReais: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valueInReais);
  }

  /**
   * Formata um valor já em reais para exibição
   * @param valueInReais Valor em reais
   * @returns String formatada (ex: "R$ 35,00")
   */
  formatValue(valueInReais: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valueInReais);
  }

  /**
   * Converte centavos para reais
   * @param cents Valor em centavos
   * @returns Valor em reais
   */
  centsToReais(cents: number): number {
    return cents / 100;
  }

  /**
   * Converte reais para centavos
   * @param reais Valor em reais
   * @returns Valor em centavos
   */
  reaisToCents(reais: number): number {
    return Math.round(reais * 100);
  }
}
