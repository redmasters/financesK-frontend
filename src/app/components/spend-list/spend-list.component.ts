import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {ApiService, Category, SpendStatus} from '../../services/api.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-spend-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './spend-list.component.html',
  styleUrl: './spend-list.component.css'
})
export class SpendListComponent implements OnInit {
  spends: any[] = [];
  categories: any[] = [];
  loading = true;
  error = '';
  total = 0;


  constructor(private apiService: ApiService) {
  }

  ngOnInit(): void {
    this.loadData();
  }
  private calculateTotal(): void {
    this.total = this.spends.reduce((acc, spend) => acc + spend.amount, 0);
  }

  private loadData(): void {
    this.apiService.getSpends().subscribe({
      next: (spends) => {
        this.spends = spends;
        this.calculateTotal();
        this.loadCategories();
      },
      error: () => {
        this.error = 'Failed to load spends';
        this.loading = false;
      }
    });
  }
private loadCategories(): void {
    this.apiService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load categories';
        this.loading = false;
      }
    });
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  statusClass(statusName?: string): string {
    if(!statusName) return 'bg-secondary';

    return {
      'PENDING': 'bg-warning',
      'PAID': 'bg-success',
      'OVERDUE': 'bg-danger'
    }[statusName] || 'bg-secondary';
  }

}

