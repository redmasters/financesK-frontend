import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CurrencyBrlPipe} from '../../pipes/currency-brl.pipe';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [CommonModule, CurrencyBrlPipe],
  templateUrl: './summary-card.component.html',
  styleUrl: './summary-card.component.scss'
})
export class SummaryCardComponent {
  @Input() title: string = '';
  @Input() value: number = 0;
  @Input() subtitle: string = '';
  @Input() icon: string = '';
  @Input() iconBg: string = '';
  @Input() iconColor: string = '';
}
