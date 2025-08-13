import { Directive, ElementRef, HostListener, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CurrencyService } from '../../core/services/currency.service';

@Directive({
  selector: '[appCurrencyInput]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyInputDirective),
      multi: true
    }
  ]
})
export class CurrencyInputDirective implements ControlValueAccessor {
  private onChange = (value: any) => {};
  private onTouched = () => {};
  private lastValue = '';

  constructor(
    private el: ElementRef,
    private currencyService: CurrencyService
  ) {}

  @HostListener('input', ['$event'])
  onInput(event: any): void {
    const input = event.target;
    let value = input.value;

    // Remove tudo exceto números
    value = value.replace(/\D/g, '');

    // Se vazio, reseta
    if (!value) {
      input.value = '';
      this.onChange(0);
      this.lastValue = '';
      return;
    }

    // Converte para número (este é o valor em centavos que vai para o backend)
    const centavosValue = parseInt(value);

    // Formata para exibição (converte centavos para reais)
    const reaisValue = centavosValue / 100;
    const formattedValue = reaisValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    // Atualiza apenas se mudou para evitar loops
    if (formattedValue !== this.lastValue) {
      input.value = formattedValue;
      this.lastValue = formattedValue;
    }

    // Envia valor em centavos para o backend
    this.onChange(centavosValue);
  }

  @HostListener('focus', ['$event'])
  onFocus(event: any): void {
    // Seleciona todo o conteúdo quando foca
    event.target.select();
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: any): void {
    if (value !== null && value !== undefined && value > 0) {
      // Os valores do backend já vêm em reais
      const formattedValue = value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      this.el.nativeElement.value = formattedValue;
      this.lastValue = formattedValue;
    } else {
      this.el.nativeElement.value = '';
      this.lastValue = '';
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }
}
