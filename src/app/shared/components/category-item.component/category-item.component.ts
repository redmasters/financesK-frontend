import { Component, Input } from '@angular/core';
import { Category } from '../../../core/models/category.model';
import { CurrencyBrlPipe } from '../../pipes/currency-brl.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-item',
  standalone: true,
  imports: [CommonModule, CurrencyBrlPipe],
  templateUrl: './category-item.component.html',
  styleUrls: ['./category-item.component.scss']
})
export class CategoryItemComponent {
  @Input() category!: Category;
  @Input() amount: number = 0;
}
