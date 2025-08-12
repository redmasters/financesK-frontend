import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyBrl',
  standalone: true
})
export class CurrencyBrlPipe implements PipeTransform {
  transform(value: number | undefined): string {
    if (value === undefined || value === null) return '';

    // Formata o valor absoluto
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(Math.abs(value));

    // Adiciona sinal negativo se o valor for negativo
    return value < 0 ? `- ${formatted}` : formatted;
  }
}
