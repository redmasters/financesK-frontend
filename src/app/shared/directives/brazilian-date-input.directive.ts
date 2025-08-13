import { Directive, ElementRef, forwardRef, HostListener, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: 'input[appBrazilianDate]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BrazilianDateInputDirective),
      multi: true
    }
  ]
})
export class BrazilianDateInputDirective implements ControlValueAccessor {
  private onChange = (value: string) => {};
  private onTouched = () => {};

  constructor(
    private elementRef: ElementRef<HTMLInputElement>,
    private renderer: Renderer2
  ) {
    // Configura o input como text em vez de date para controle total
    this.renderer.setAttribute(this.elementRef.nativeElement, 'type', 'text');
    this.renderer.setAttribute(this.elementRef.nativeElement, 'placeholder', 'dd/mm/aaaa');
    this.renderer.setAttribute(this.elementRef.nativeElement, 'maxlength', '10');
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove caracteres não numéricos

    // Aplica a máscara dd/mm/aaaa
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    if (value.length >= 5) {
      value = value.substring(0, 5) + '/' + value.substring(5, 9);
    }

    // Atualiza o valor do input
    this.renderer.setProperty(this.elementRef.nativeElement, 'value', value);

    // Converte para formato ISO se a data estiver completa e válida
    if (value.length === 10) {
      const isoDate = this.convertToISO(value);
      if (isoDate) {
        this.onChange(isoDate);
      }
    } else {
      this.onChange('');
    }
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Permite backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
        // Permite Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (event.keyCode === 65 && event.ctrlKey) ||
        (event.keyCode === 67 && event.ctrlKey) ||
        (event.keyCode === 86 && event.ctrlKey) ||
        (event.keyCode === 88 && event.ctrlKey) ||
        // Permite home, end, setas
        (event.keyCode >= 35 && event.keyCode <= 39)) {
      return;
    }
    // Permite apenas números
    if ((event.keyCode < 48 || event.keyCode > 57) &&
        (event.keyCode < 96 || event.keyCode > 105)) {
      event.preventDefault();
    }
  }

  writeValue(value: string): void {
    if (value) {
      // Converte de ISO (yyyy-mm-dd) para formato brasileiro (dd/mm/yyyy)
      const brazilianDate = this.convertToBrazilian(value);
      this.renderer.setProperty(this.elementRef.nativeElement, 'value', brazilianDate);
    } else {
      this.renderer.setProperty(this.elementRef.nativeElement, 'value', '');
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.renderer.setProperty(this.elementRef.nativeElement, 'disabled', isDisabled);
  }

  /**
   * Converte data do formato brasileiro (dd/mm/yyyy) para ISO (yyyy-mm-dd)
   */
  private convertToISO(brazilianDate: string): string | null {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(brazilianDate)) {
      return null;
    }

    const [day, month, year] = brazilianDate.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    // Valida se a data é válida
    if (date.getFullYear() !== parseInt(year) ||
        date.getMonth() !== parseInt(month) - 1 ||
        date.getDate() !== parseInt(day)) {
      return null;
    }

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  /**
   * Converte data do formato ISO (yyyy-mm-dd) para brasileiro (dd/mm/yyyy)
   */
  private convertToBrazilian(isoDate: string): string {
    if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
      return '';
    }

    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  }
}
