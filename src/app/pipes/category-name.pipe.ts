import { Pipe, PipeTransform } from '@angular/core';
import {Category} from '../services/api.service';

@Pipe({
  name: 'categoryName',
  standalone: true
})
export class CategoryNamePipe implements PipeTransform {
  transform(categoryId: number, categories: Category[]): string {
    if(!categoryId) return 'Desconhecida';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown';
  }

}
